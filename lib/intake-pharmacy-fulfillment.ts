import "server-only"
import { sql } from "@/lib/db"
import {
  buildIntakePharmacyPaymentReminderEmail,
  buildIntakeShippedEmail,
  INTAKE_PAYMENT_REMINDER_SUBJECT,
  INTAKE_SHIPPED_SUBJECT,
} from "@/lib/intake-pharmacy-payment-reminder-email"
import { sendPatientEmail } from "@/lib/ses-mail"
import { STANDARD_INTAKE_STATUS } from "@/lib/telehealth/intake-status"
import {
  APPROVED_INTAKE_STATUSES,
  isAdminIntakeServiceType,
  SERVICE_LABELS,
  type AdminIntakeServiceType,
} from "@/lib/telehealth/intake-registry"
import {
  getWeightLossDose,
  getWeightLossIntakeHoldQuote,
  type WeightLossDoseId,
} from "@/lib/weight-loss-catalog"

const PAID_STATUSES = new Set(["captured", "paid_in_person"])

const FULFILLMENT_TABLES: Record<string, string> = {
  weight_loss: "weight_loss_intake",
  mens_health: "patient_intake",
  trt: "trt_intake",
  rejuvenation_vial: "rejuvenation_vial_intakes",
}

export function supportsPharmacyFulfillment(serviceType: string): boolean {
  return serviceType in FULFILLMENT_TABLES
}

function tableForService(serviceType: string): string | null {
  return FULFILLMENT_TABLES[serviceType] ?? null
}

function resolveWeightLossDoseId(detail: Record<string, unknown>): WeightLossDoseId {
  const programId = String(detail.selected_program ?? "")
  const direct = String(detail.selected_dose_tier ?? "").trim()
  if (direct) {
    const dose = getWeightLossDose(programId, direct)
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

function weightLossAmountLabel(detail: Record<string, unknown>): string | null {
  const programId = String(detail.selected_program ?? "")
  const billingPlan = detail.selected_billing_plan === "quarterly" ? "quarterly" : "monthly"
  const doseId = resolveWeightLossDoseId(detail)
  const quote = getWeightLossIntakeHoldQuote(programId, billingPlan, doseId)
  if (!quote) return null
  return `$${quote.totalBilled.toFixed(2)}`
}

export async function getIntakeRowForFulfillment(
  serviceType: string,
  id: string
): Promise<Record<string, unknown> | null> {
  const table = tableForService(serviceType)
  if (!table) return null
  const rows = await sql(`SELECT * FROM ${table} WHERE id = $1`, [id]).catch(() => [])
  return (rows[0] as Record<string, unknown>) ?? null
}

export async function sendIntakePharmacyPaymentReminder(params: {
  serviceType: AdminIntakeServiceType
  id: string
}): Promise<{ success: boolean; error?: string }> {
  if (!isAdminIntakeServiceType(params.serviceType)) {
    return { success: false, error: "Invalid service type" }
  }

  const row = await getIntakeRowForFulfillment(params.serviceType, params.id)
  if (!row) return { success: false, error: "Intake not found" }

  const email = String(row.email ?? "").trim()
  if (!email) return { success: false, error: "Patient email is missing on this intake." }

  const paymentStatus = String(row.payment_status ?? "")
  const status = String(row.status ?? "")

  if (paymentStatus !== "awaiting_pharmacy") {
    return {
      success: false,
      error:
        paymentStatus === "paid_in_person" || paymentStatus === "captured"
          ? "This intake is already marked paid."
          : "Payment reminder applies to intakes awaiting pharmacy payment.",
    }
  }

  const approvedSet = new Set<string>(APPROVED_INTAKE_STATUSES)
  if (!approvedSet.has(status)) {
    return { success: false, error: "Send payment reminder only after clinician approval." }
  }

  const serviceLabel = `${SERVICE_LABELS[params.serviceType]}${params.serviceType === "weight_loss" ? "" : ""}`
  const amountLabel =
    params.serviceType === "weight_loss" ? weightLossAmountLabel(row) : null

  const { text, html } = buildIntakePharmacyPaymentReminderEmail({
    firstName: String(row.first_name ?? ""),
    serviceLabel,
    submissionId: params.id,
    amountLabel,
  })

  return sendPatientEmail({
    to: email,
    subject: INTAKE_PAYMENT_REMINDER_SUBJECT,
    text,
    html,
  })
}

export async function updateIntakeFulfillmentStatus(params: {
  serviceType: string
  id: string
  nextStatus: "preparing" | "shipped"
  staffLabel: string
}): Promise<{ success: boolean; error?: string; intake?: Record<string, unknown> }> {
  const table = tableForService(params.serviceType)
  if (!table) return { success: false, error: "Fulfillment not supported for this service type." }

  const row = await getIntakeRowForFulfillment(params.serviceType, params.id)
  if (!row) return { success: false, error: "Intake not found" }

  const currentStatus = String(row.status ?? "")
  const paymentStatus = String(row.payment_status ?? "")

  const approvedSet = new Set<string>([
    ...APPROVED_INTAKE_STATUSES,
    STANDARD_INTAKE_STATUS.preparing,
  ])

  if (params.nextStatus === "preparing") {
    if (!approvedSet.has(currentStatus) && currentStatus !== STANDARD_INTAKE_STATUS.approved) {
      return { success: false, error: "Intake must be approved before marking preparing." }
    }
    if (currentStatus === STANDARD_INTAKE_STATUS.shipped || currentStatus === STANDARD_INTAKE_STATUS.completed) {
      return { success: false, error: "Intake is already shipped or completed." }
    }
  }

  if (params.nextStatus === "shipped") {
    if (!PAID_STATUSES.has(paymentStatus)) {
      return { success: false, error: "Mark the intake paid before marking shipped." }
    }
    if (currentStatus === STANDARD_INTAKE_STATUS.shipped || currentStatus === STANDARD_INTAKE_STATUS.completed) {
      return { success: false, error: "Intake is already shipped or completed." }
    }
    if (
      !approvedSet.has(currentStatus) &&
      currentStatus !== STANDARD_INTAKE_STATUS.approved
    ) {
      return { success: false, error: "Intake must be approved before marking shipped." }
    }
  }

  const statusValue =
    params.nextStatus === "preparing"
      ? STANDARD_INTAKE_STATUS.preparing
      : STANDARD_INTAKE_STATUS.shipped

  const partnerStatus = `${params.nextStatus}_by_${params.staffLabel}`

  const updated = await sql(
    `UPDATE ${table}
     SET status = $1, partner_status = $2, updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [statusValue, partnerStatus, params.id]
  ).catch(() => [])

  if (!updated[0]) {
    return { success: false, error: "Could not update intake status." }
  }

  return { success: true, intake: updated[0] as Record<string, unknown> }
}

export async function markIntakeShippedAndNotify(params: {
  serviceType: AdminIntakeServiceType
  id: string
  staffLabel: string
  /** When false, only update status — do not email the patient. Defaults to true. */
  notifyPatient?: boolean
}): Promise<{
  success: boolean
  error?: string
  emailSent?: boolean
  emailError?: string
}> {
  const notifyPatient = params.notifyPatient !== false

  const update = await updateIntakeFulfillmentStatus({
    serviceType: params.serviceType,
    id: params.id,
    nextStatus: "shipped",
    staffLabel: params.staffLabel,
  })

  if (!update.success || !update.intake) {
    return { success: false, error: update.error }
  }

  if (!notifyPatient) {
    return { success: true, emailSent: false }
  }

  const email = String(update.intake.email ?? "").trim()
  if (!email) {
    return { success: true, emailSent: false, emailError: "Patient email missing — status updated only." }
  }

  const { text, html } = buildIntakeShippedEmail({
    firstName: String(update.intake.first_name ?? ""),
    serviceLabel: SERVICE_LABELS[params.serviceType],
    submissionId: params.id,
  })

  const emailResult = await sendPatientEmail({
    to: email,
    subject: INTAKE_SHIPPED_SUBJECT,
    text,
    html,
  })

  return {
    success: true,
    emailSent: emailResult.success,
    emailError: emailResult.error,
  }
}
