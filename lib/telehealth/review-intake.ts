import "server-only"
import { sql } from "@/lib/db"
import { capturePaymentHold, cancelPaymentHold } from "@/lib/stripe-server"
import { STANDARD_INTAKE_STATUS } from "@/lib/telehealth/intake-status"
import { notifyPatientIntakeDecision } from "@/lib/telehealth/patient-notify"
import { PRIMARY_PHYSICIAN } from "@/lib/clinical-provider"
import {
  getClinicalIntakeDetail,
  isAdminIntakeServiceType,
  SERVICE_LABELS,
  SPECIALTY_INTAKE_STATUS,
  treatmentLabelFromDetail,
  type AdminIntakeServiceType,
} from "@/lib/telehealth/intake-registry"

export type IntakeReviewAction = "approve" | "deny" | "follow_up"

export type IntakeReviewResult = {
  success: boolean
  status?: string
  paymentAction?: "captured" | "released" | "none" | "failed"
  emailSent?: boolean
  emailError?: string
  error?: string
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
}): Promise<IntakeReviewResult> {
  const { serviceType, id, action, note } = params

  if (!isAdminIntakeServiceType(serviceType)) {
    return { success: false, error: "Invalid service type" }
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
      const captured = await capturePaymentHold(stripeId)
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

  return { success: true, status: next, paymentAction, emailSent, emailError }
}
