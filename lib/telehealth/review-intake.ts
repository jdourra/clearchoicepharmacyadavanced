import "server-only"
import { sql } from "@/lib/db"
import { capturePaymentHold, cancelPaymentHold } from "@/lib/stripe-server"
import { getWeightLossDose, getWeightLossIntakeHoldQuote, type WeightLossDoseId } from "@/lib/weight-loss-catalog"
import { STANDARD_INTAKE_STATUS } from "@/lib/telehealth/intake-status"
import { notifyPatientIntakeDecision } from "@/lib/telehealth/patient-notify"
import { PRIMARY_PHYSICIAN } from "@/lib/clinical-provider"
import { createPharmacyOrderFromPrescriptionTelemedicineIntake } from "@/lib/prescription-telemedicine-clinical-intake"
import {
  getClinicalIntakeDetail,
  isAdminIntakeServiceType,
  SERVICE_LABELS,
  SPECIALTY_INTAKE_STATUS,
  treatmentLabelFromDetail,
  type AdminIntakeServiceType,
} from "@/lib/telehealth/intake-registry"
import type { ClinicalRxPayload } from "@/lib/clinical-prescription"
import {
  createPrescriptionOnApprove,
  shouldGeneratePrescription,
} from "@/lib/clinical-prescription-service"

export type IntakeReviewAction = "approve" | "deny" | "follow_up"

export type IntakeReviewResult = {
  success: boolean
  status?: string
  paymentAction?: "captured" | "released" | "none" | "failed"
  emailSent?: boolean
  emailError?: string
  error?: string
  prescriptionId?: string
  prescriptionStatus?: string
  dropboxSent?: boolean
  dropboxError?: string
}

function resolveWeightLossDoseId(detail: Record<string, unknown>): WeightLossDoseId {
  const programId = String(detail.selected_program ?? "")
  const raw = String(detail.selected_dose_tier ?? "").trim()
  if (raw) {
    const dose = getWeightLossDose(programId, raw)
    if (dose) return dose.id
  }
  const concerns = String(detail.additional_concerns ?? "")
  const match = concerns.match(/\[selected_dose_tier:([^\]]+)\]/i)
  if (match?.[1]) {
    const dose = getWeightLossDose(programId, match[1].trim())
    if (dose) return dose.id
  }
  return getWeightLossDose(programId, "starter")?.id ?? "sema-1mg"
}

function tableForService(serviceType: AdminIntakeServiceType): string {
  switch (serviceType) {
    case "mens_health":
      return "patient_intake"
    case "trt":
      return "trt_intake"
    case "weight_loss":
      return "weight_loss_intake"
    case "rejuvenation_vial":
      return "rejuvenation_vial_intakes"
    case "iv_rejuvenation":
      return "iv_booking_requests"
    case "specialty_pharmacy":
      return "specialty_intake"
    case "prescription_telemedicine":
      return "prescription_telemedicine_intake"
  }
}

function nextStatus(serviceType: AdminIntakeServiceType, action: IntakeReviewAction): string {
  if (serviceType === "specialty_pharmacy") {
    switch (action) {
      case "approve":
        return SPECIALTY_INTAKE_STATUS.coordinating
      case "deny":
        return SPECIALTY_INTAKE_STATUS.cancelled
      case "follow_up":
        return SPECIALTY_INTAKE_STATUS.pending
    }
  }

  switch (action) {
    case "approve":
      return STANDARD_INTAKE_STATUS.approved
    case "deny":
      return STANDARD_INTAKE_STATUS.denied
    case "follow_up":
      return STANDARD_INTAKE_STATUS.followUp
  }
}

export async function reviewClinicalIntake(params: {
  serviceType: string
  id: string
  action: IntakeReviewAction
  note?: string
  reviewerName?: string
  /** Weight loss: capture kit + $25 live-visit add-on when monthly billing was authorized. */
  liveVisitRequired?: boolean
  /** Prescription fields — required when approving a medication program. */
  prescription?: ClinicalRxPayload
}): Promise<IntakeReviewResult> {
  const { serviceType, id, action, note, liveVisitRequired, prescription } = params

  if (!isAdminIntakeServiceType(serviceType)) {
    return { success: false, error: "Invalid service type" }
  }

  if (action === "approve" && shouldGeneratePrescription(serviceType)) {
    if (!prescription?.medicationName?.trim() || !prescription?.directions?.trim()) {
      return {
        success: false,
        error: "Medication name and directions are required to approve and generate a prescription.",
      }
    }
    const useDropbox = Boolean(process.env.DROPBOX_SIGN_API_KEY?.trim())
    if (!useDropbox && !prescription.clinicianEsignName?.trim()) {
      return {
        success: false,
        error:
          "Enter your typed e-signature name, or configure DROPBOX_SIGN_API_KEY to send for remote signature.",
      }
    }
  }

  const detail = await getClinicalIntakeDetail(serviceType, id)
  if (!detail) {
    return { success: false, error: "Intake not found" }
  }

  const table = tableForService(serviceType)
  const next = nextStatus(serviceType, action)
  const reviewer = params.reviewerName ?? PRIMARY_PHYSICIAN.name
  const partnerStatus = `manual_${action}_by_${reviewer.replace(/\s+/g, "_").toLowerCase()}`

  const stripeId =
    detail.stripe_payment_intent_id != null ? String(detail.stripe_payment_intent_id) : null

  let paymentAction: IntakeReviewResult["paymentAction"] = "none"

  if (stripeId && serviceType !== "specialty_pharmacy") {
    if (action === "approve") {
      let amountCents: number | undefined
      if (serviceType === "weight_loss") {
        const programId = String(detail.selected_program ?? "")
        const billingPlan =
          detail.selected_billing_plan === "quarterly" ? "quarterly" : "monthly"
        const tierId = resolveWeightLossDoseId(detail)
        const quote = getWeightLossIntakeHoldQuote(programId, billingPlan, tierId)
        if (quote) {
          const includeLiveVisit =
            Boolean(liveVisitRequired) && quote.liveVisitAddon > 0
          amountCents = Math.round(
            (includeLiveVisit ? quote.authorizationHold : quote.totalBilled) * 100
          )
        }
      }
      const captured = await capturePaymentHold(stripeId, amountCents)
      paymentAction = captured ? "captured" : "failed"
      if (!captured) {
        return {
          success: false,
          error: "Failed to capture payment hold. Check Stripe dashboard and retry.",
          paymentAction,
        }
      }
    } else if (action === "deny") {
      const released = await cancelPaymentHold(stripeId)
      paymentAction = released ? "released" : "failed"
    }
  }

  const rows =
    serviceType === "specialty_pharmacy"
      ? await sql(
          `UPDATE specialty_intake SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id`,
          [next, id]
        ).catch(() => [])
      : await sql(
          `UPDATE ${table}
     SET status = $1,
         partner_name = $2,
         partner_status = $3,
         updated_at = NOW()
     WHERE id = $4
     RETURNING id`,
          [next, "manual", partnerStatus, id]
        ).catch(() => [])

  if (rows.length === 0) {
    return { success: false, error: "Failed to update intake status" }
  }

  if (serviceType === "prescription_telemedicine" && action === "approve") {
    const orderResult = await createPharmacyOrderFromPrescriptionTelemedicineIntake(id)
    if (!orderResult.success) {
      return {
        success: false,
        error: orderResult.error || "Failed to create pharmacy order after approval",
        paymentAction,
      }
    }
  }

  const patientEmail = String(detail.email ?? "")
  const patientName = `${detail.first_name ?? ""} ${detail.last_name ?? ""}`.trim()
  const serviceLabel = SERVICE_LABELS[serviceType]
  const treatmentLabel = treatmentLabelFromDetail(serviceType, detail)

  let emailSent = false
  let emailError: string | undefined

  if (patientEmail) {
    const decision =
      action === "approve" ? "approved" : action === "deny" ? "denied" : "follow_up"
    const emailResult = await notifyPatientIntakeDecision({
      to: patientEmail,
      patientName: patientName || "Patient",
      serviceLabel: `${serviceLabel} — ${treatmentLabel}`,
      submissionId: id,
      decision,
      note,
    })
    emailSent = emailResult.success
    emailError = emailResult.error
  } else {
    emailError = "Patient email is missing on this intake."
  }

  let prescriptionId: string | undefined
  let prescriptionStatus: string | undefined
  let dropboxSent: boolean | undefined
  let dropboxError: string | undefined

  if (action === "approve" && shouldGeneratePrescription(serviceType) && prescription) {
    try {
      const rxResult = await createPrescriptionOnApprove({
        serviceType,
        serviceLabel,
        intakeId: id,
        detail,
        rx: prescription,
      })
      prescriptionId = rxResult.prescriptionId
      prescriptionStatus = rxResult.status
      dropboxSent = rxResult.dropboxSent
      dropboxError = rxResult.dropboxError
    } catch (error) {
      console.error("[review-intake] prescription generation failed:", error)
      dropboxError =
        error instanceof Error
          ? error.message
          : "Prescription generation failed after approval"
    }
  }

  return {
    success: true,
    status: next,
    paymentAction,
    emailSent,
    emailError,
    prescriptionId,
    prescriptionStatus,
    dropboxSent,
    dropboxError,
  }
}
