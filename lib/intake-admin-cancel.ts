import "server-only"
import { sql } from "@/lib/db"
import { orders } from "@/lib/auth"
import { isOrderPaid } from "@/lib/order-payment"
import { PHARMACY_PHONE_DISPLAY } from "@/lib/phone"
import { sendPatientEmail } from "@/lib/ses-mail"
import { cancelPaymentHold } from "@/lib/stripe-server"
import { intakeCancelBlockReason } from "@/lib/intake-cancel-rules"
import {
  getClinicalIntakeDetail,
  isAdminIntakeServiceType,
  SERVICE_LABELS,
  tableForAdminService,
  type AdminIntakeServiceType,
} from "@/lib/telehealth/intake-registry"

export type CancelIntakeResult = {
  success: boolean
  status?: string
  paymentAction?: "released" | "none" | "failed"
  emailSent?: boolean
  emailError?: string
  orderCancelled?: boolean
  error?: string
}

export async function cancelClinicalIntakeForPatientRequest(params: {
  serviceType: string
  id: string
  staffLabel: string
}): Promise<CancelIntakeResult> {
  if (!isAdminIntakeServiceType(params.serviceType)) {
    return { success: false, error: "Invalid service type" }
  }

  const detail = await getClinicalIntakeDetail(params.serviceType, params.id)
  if (!detail) return { success: false, error: "Intake not found" }

  const block = intakeCancelBlockReason(
    detail.status != null ? String(detail.status) : "",
    detail.payment_status != null ? String(detail.payment_status) : ""
  )
  if (block) return { success: false, error: block }

  const stripeId =
    detail.stripe_payment_intent_id != null ? String(detail.stripe_payment_intent_id) : ""
  let paymentAction: CancelIntakeResult["paymentAction"] = "none"
  let paymentStatus = "none"

  if (stripeId) {
    const released = await cancelPaymentHold(stripeId)
    if (!released) {
      return {
        success: false,
        error: "Could not release the card authorization. The intake was not cancelled.",
        paymentAction: "failed",
      }
    }
    paymentAction = "released"
    paymentStatus = "released"
  }

  const updated = await markIntakeCancelled(params.serviceType, params.id, paymentStatus, params.staffLabel)
  if (!updated) return { success: false, error: "Failed to cancel the intake" }

  await sql(
    `UPDATE clinical_prescriptions
     SET status = 'cancelled'
     WHERE service_type = $1 AND intake_id = $2 AND status <> 'cancelled'`,
    [params.serviceType, params.id]
  ).catch(() => [])

  let orderCancelled = false
  const linkedOrderId = detail.order_id != null ? String(detail.order_id) : ""
  if (linkedOrderId) {
    const order = await orders.getOrderById(linkedOrderId)
    if (
      order &&
      order.status !== "cancelled" &&
      order.status !== "shipped" &&
      order.status !== "delivered" &&
      !isOrderPaid(order)
    ) {
      orderCancelled = await orders.updateOrderStatus(linkedOrderId, "cancelled")
    }
  }

  const email = await emailPatientCancelled(params.serviceType, params.id, detail, paymentAction === "released")

  return {
    success: true,
    status: "cancelled",
    paymentAction,
    emailSent: email.emailSent,
    emailError: email.emailError,
    orderCancelled,
  }
}

async function markIntakeCancelled(
  serviceType: AdminIntakeServiceType,
  id: string,
  paymentStatus: string,
  staffLabel: string
): Promise<boolean> {
  const table = tableForAdminService(serviceType)
  const partnerStatus = `manual_cancel_patient_request_by_${staffLabel}`

  if (serviceType === "specialty_pharmacy") {
    const rows = await sql(
      `UPDATE specialty_intake
       SET status = 'cancelled', payment_status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id`,
      [paymentStatus, id]
    ).catch(() => [])
    return rows.length > 0
  }

  const rows = await sql(
    `UPDATE ${table}
     SET status = 'cancelled',
         payment_status = $1,
         partner_name = 'manual',
         partner_status = $2,
         updated_at = NOW()
     WHERE id = $3
     RETURNING id`,
    [paymentStatus, partnerStatus, id]
  ).catch(() => [])
  if (rows.length > 0) return true

  const fallback = await sql(
    `UPDATE ${table}
     SET status = 'cancelled', payment_status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id`,
    [paymentStatus, id]
  ).catch(() => [])
  return fallback.length > 0
}

async function emailPatientCancelled(
  serviceType: AdminIntakeServiceType,
  id: string,
  detail: Record<string, unknown>,
  holdReleased: boolean
): Promise<{ emailSent: boolean; emailError?: string }> {
  const to = String(detail.email ?? "").trim()
  if (!to) return { emailSent: false, emailError: "Patient email is missing on this intake." }

  const patientName = `${detail.first_name ?? ""} ${detail.last_name ?? ""}`.trim() || "Patient"
  const serviceLabel = SERVICE_LABELS[serviceType]
  const paymentLine = holdReleased
    ? "Any card authorization hold has been released. You will not be charged."
    : "No payment was collected."

  const text = `Hi ${patientName},

Clear Choice Pharmacy cancelled your ${serviceLabel} request (Reference: ${id}) because you asked us to stop it.

${paymentLine}

Questions? Call ${PHARMACY_PHONE_DISPLAY}.

— Clear Choice Pharmacy`

  const result = await sendPatientEmail({
    to,
    subject: `Your ${serviceLabel} request was cancelled | Clear Choice Pharmacy`,
    text,
  })

  return {
    emailSent: result.success,
    emailError: result.success ? undefined : result.error,
  }
}
