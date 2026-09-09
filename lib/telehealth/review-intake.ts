import "server-only"
import { sql } from "@/lib/db"
import { capturePaymentHold, cancelPaymentHold } from "@/lib/stripe-server"
import {
  formatWeightLossSupplyFromKitCount,
  getWeightLossDose,
  getWeightLossIntakeHoldQuote,
  type WeightLossDoseId,
} from "@/lib/weight-loss-catalog"
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
import { recordIntakeSupplyCycleStart } from "@/lib/patient-refill-reminder"
import {
  formatWeightLossDoseLabel,
  getPatientRequestedWeightLossDose,
  resolvePatientRequestedBillingKitCount,
  resolvePatientRequestedWeightLossDoseId,
  resolveWeightLossDoseIdFromDetail,
  billingPlanFromKitCount,
} from "@/lib/weight-loss-dose-review"

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
  /** Weight loss: clinician-selected dose id (may differ from patient request). */
  prescribedDoseId?: string
  /** Weight loss: clinician-selected kit months (1 / 2 / 3). */
  prescribedKitCount?: number
  /** Prescription fields — required when approving a medication program. */
  prescription?: ClinicalRxPayload
}): Promise<IntakeReviewResult> {
  const {
    serviceType,
    id,
    action,
    note,
    liveVisitRequired,
    prescription,
    prescribedDoseId,
    prescribedKitCount,
  } = params

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

  let effectivePrescribedDoseId: WeightLossDoseId | undefined
  let effectivePrescribedKitCount: number | undefined
  if (serviceType === "weight_loss" && action === "approve") {
    const programId = String(detail.selected_program ?? "")
    const fallback = resolveWeightLossDoseIdFromDetail(detail)
    const candidate = String(prescribedDoseId ?? "").trim() || fallback
    const dose = getWeightLossDose(programId, candidate)
    if (!dose) {
      return { success: false, error: "Invalid prescribed dose for this weight-loss program." }
    }
    effectivePrescribedDoseId = dose.id

    const requestedKits = resolvePatientRequestedBillingKitCount(detail)
    const kitCandidate = Number(prescribedKitCount)
    const kits =
      Number.isFinite(kitCandidate) && kitCandidate >= 1 && kitCandidate <= 3
        ? Math.floor(kitCandidate)
        : requestedKits
    effectivePrescribedKitCount = kits
  }

  const stripeId =
    detail.stripe_payment_intent_id != null ? String(detail.stripe_payment_intent_id) : null

  let paymentAction: IntakeReviewResult["paymentAction"] = "none"
  let paymentStatus =
    detail.payment_status != null ? String(detail.payment_status) : stripeId ? "authorized" : "none"

  if (stripeId && serviceType !== "specialty_pharmacy") {
    if (action === "approve") {
      let amountCents: number | undefined
      if (serviceType === "weight_loss") {
        const programId = String(detail.selected_program ?? "")
        const kitsIncluded = effectivePrescribedKitCount ?? resolvePatientRequestedBillingKitCount(detail)
        const billingPlan = billingPlanFromKitCount(kitsIncluded)
        const tierId = effectivePrescribedDoseId ?? resolveWeightLossDoseIdFromDetail(detail)
        const quote = getWeightLossIntakeHoldQuote(programId, billingPlan, tierId, {
          kitsIncluded,
        })
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
      paymentStatus = captured ? "captured" : "failed"
      if (!captured) {
        await sql(
          `UPDATE ${table} SET payment_status = $1, updated_at = NOW() WHERE id = $2`,
          ["failed", id]
        ).catch(() => [])
        return {
          success: false,
          error: "Failed to capture payment hold. Check Stripe dashboard and retry.",
          paymentAction,
        }
      }
    } else if (action === "deny") {
      const released = await cancelPaymentHold(stripeId)
      paymentAction = released ? "released" : "failed"
      paymentStatus = released ? "released" : "failed"
    }
  } else if (serviceType === "weight_loss") {
    // Pay-at-pharmacy path: no online Stripe hold
    if (action === "approve") {
      paymentStatus = "awaiting_pharmacy"
    } else if (action === "deny") {
      paymentStatus = "none"
    }
  }

  const rows =
    serviceType === "specialty_pharmacy"
      ? await sql(
          `UPDATE specialty_intake SET status = $1, payment_status = COALESCE($2, payment_status), updated_at = NOW() WHERE id = $3 RETURNING id`,
          [next, paymentStatus, id]
        ).catch(() => [])
      : await sql(
          `UPDATE ${table}
     SET status = $1,
         partner_name = $2,
         partner_status = $3,
         payment_status = $4,
         updated_at = NOW()
     WHERE id = $5
     RETURNING id`,
          [next, "manual", partnerStatus, paymentStatus, id]
        ).catch(() => [])

  if (rows.length === 0) {
    return { success: false, error: "Failed to update intake status" }
  }

  if (
    serviceType === "weight_loss" &&
    action === "approve" &&
    effectivePrescribedDoseId &&
    effectivePrescribedKitCount
  ) {
    const requestedId = resolvePatientRequestedWeightLossDoseId(detail)
    const requestedKits = resolvePatientRequestedBillingKitCount(detail)
    const billingPlan = billingPlanFromKitCount(effectivePrescribedKitCount)
    const supplyLabel = formatWeightLossSupplyFromKitCount(effectivePrescribedKitCount)

    await sql(
      `ALTER TABLE weight_loss_intake ADD COLUMN IF NOT EXISTS billing_kit_count INTEGER`,
      []
    ).catch(() => [])
    await sql(
      `ALTER TABLE weight_loss_intake ADD COLUMN IF NOT EXISTS billing_supply_label TEXT`,
      []
    ).catch(() => [])

    await sql(
      `UPDATE weight_loss_intake
       SET selected_dose_tier = $1,
           selected_billing_plan = $2,
           billing_kit_count = $3,
           billing_supply_label = $4,
           updated_at = NOW()
       WHERE id = $5`,
      [
        effectivePrescribedDoseId,
        billingPlan,
        effectivePrescribedKitCount,
        supplyLabel,
        id,
      ]
    ).catch(() => [])

    detail.selected_dose_tier = effectivePrescribedDoseId
    detail.selected_billing_plan = billingPlan
    detail.billing_kit_count = effectivePrescribedKitCount
    detail.billing_supply_label = supplyLabel

    // Keep an audit trail of the patient's original request when clinician overrides.
    let concerns = String(detail.additional_concerns ?? "")
    let concernsChanged = false
    if (requestedId !== effectivePrescribedDoseId && !/\[patient_requested_dose_tier:/i.test(concerns)) {
      concerns = `${concerns}\n[patient_requested_dose_tier:${requestedId}]`.trim()
      concernsChanged = true
    }
    if (
      requestedKits !== effectivePrescribedKitCount &&
      !/\[patient_requested_billing_kit_count:/i.test(concerns)
    ) {
      concerns =
        `${concerns}\n[patient_requested_billing_kit_count:${requestedKits}]`.trim()
      concernsChanged = true
    }
    if (concernsChanged) {
      await sql(
        `UPDATE weight_loss_intake
         SET additional_concerns = $1,
             updated_at = NOW()
         WHERE id = $2`,
        [concerns, id]
      ).catch(() => [])
      detail.additional_concerns = concerns
    }
  }

  if (
    paymentStatus === "captured" &&
    (serviceType === "weight_loss" || serviceType === "mens_health" || serviceType === "trt")
  ) {
    const intakeTable =
      serviceType === "weight_loss"
        ? "weight_loss_intake"
        : serviceType === "mens_health"
          ? "patient_intake"
          : "trt_intake"
    await recordIntakeSupplyCycleStart(intakeTable, id, { force: true }).catch((error) => {
      console.error("[review-intake] supply cycle start failed:", error)
    })
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
  let treatmentLabel = treatmentLabelFromDetail(serviceType, detail)
  if (serviceType === "weight_loss") {
    const dose =
      (effectivePrescribedDoseId
        ? getWeightLossDose(String(detail.selected_program ?? ""), effectivePrescribedDoseId)
        : null) ?? getPatientRequestedWeightLossDose(detail)
    if (dose) {
      treatmentLabel = `${treatmentLabel} · ${formatWeightLossDoseLabel(dose)}`
    }
  }

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
      paymentModel:
        serviceType === "weight_loss" && !stripeId ? "pharmacy_terminal" : "online_hold",
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
