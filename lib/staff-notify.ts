import "server-only"
import {
  getAdminInboxEmail,
  getClinicalIntakeRecipientEmails,
  PRIMARY_PHYSICIAN,
} from "@/lib/clinical-provider"
import { isSesConfigured } from "@/lib/ses-env"
import { sendPatientEmail } from "@/lib/ses-mail"
import { SITE_URL } from "@/lib/site-config"
import type { OrderItem } from "@/lib/auth-types"

type StaffNotifyResult = { success: boolean; error?: string }

async function sendToRecipients(
  recipients: string[],
  subject: string,
  text: string
): Promise<StaffNotifyResult> {
  const unique = [...new Set(recipients.map((e) => e.trim().toLowerCase()).filter(Boolean))]

  if (!isSesConfigured()) {
    console.log("[staff-notify] SES not configured — alert log:")
    console.log(`Subject: ${subject}`)
    console.log(`Recipients: ${unique.join(", ") || "(none)"}`)
    console.log(text)
    return { success: true }
  }

  if (unique.length === 0) {
    console.log("[staff-notify] No staff inbox configured — alert log:")
    console.log(`Subject: ${subject}`)
    console.log(text)
    return { success: true }
  }

  let lastError: string | undefined
  for (const to of unique) {
    const result = await sendPatientEmail({ to, subject, text })
    if (!result.success) {
      lastError = result.error
      console.error("[staff-notify] SES error:", { to, error: result.error })
    }
  }

  return { success: !lastError, error: lastError }
}

/** Admin-only alerts (new signups, pharmacy orders). */
export async function notifyAdminAlert(params: {
  subject: string
  body: string
}): Promise<StaffNotifyResult> {
  const admin = getAdminInboxEmail()
  return sendToRecipients(admin ? [admin] : [], `[Admin] ${params.subject}`, params.body)
}

/** Clinical intake alerts — admin + Dr. Dourra. */
export async function notifyClinicalIntakeAlert(params: {
  submissionId: string
  subject: string
  body: string
}): Promise<StaffNotifyResult> {
  const recipients = getClinicalIntakeRecipientEmails()
  const text = `Assigned reviewer: ${PRIMARY_PHYSICIAN.name} (${PRIMARY_PHYSICIAN.credentials})\nReview in admin: ${SITE_URL}/admin/intakes\n\n${params.body}`

  return sendToRecipients(
    recipients,
    `[Clinical intake] ${params.subject}`,
    text
  )
}

export function notifyNewPatientSignupFireAndForget(params: {
  patientId: string
  name: string
  email: string
  phone?: string | null
}): void {
  const lines = [
    "A new patient account was created on Clear Choice Pharmacy.",
    "",
    `Name: ${params.name}`,
    `Email: ${params.email}`,
    params.phone ? `Phone: ${params.phone}` : null,
    `Patient ID: ${params.patientId}`,
    "",
    `View in admin: ${SITE_URL}/admin/customers/${params.patientId}`,
  ].filter(Boolean)

  void notifyAdminAlert({
    subject: `New patient signup — ${params.name}`,
    body: lines.join("\n"),
  }).catch((err) => console.error("[staff-notify] signup alert failed:", err))
}

export function notifyNewPharmacyOrderFireAndForget(params: {
  orderId: string
  orderNumber: string
  patientId: string | null
  patientName?: string | null
  patientEmail?: string | null
  items: OrderItem[]
  total: number
  deliveryMethod: string
  prescriptionMethod?: string | null
}): void {
  const itemLines = params.items.map(
    (item) => `  • ${item.drug_name} × ${item.quantity} — $${(item.price * item.quantity).toFixed(2)}`
  )

  const lines = [
    "A new pharmacy order was placed.",
    "",
    `Order: ${params.orderNumber}`,
    `Total: $${params.total.toFixed(2)}`,
    `Delivery: ${params.deliveryMethod}`,
    params.prescriptionMethod ? `Prescription: ${params.prescriptionMethod}` : null,
    "",
    params.patientName || params.patientEmail
      ? `Patient: ${[params.patientName, params.patientEmail].filter(Boolean).join(" — ")}`
      : "Patient: Guest / no linked account",
    params.patientId ? `Patient ID: ${params.patientId}` : null,
    "",
    "Items:",
    ...itemLines,
    "",
    `Process order: ${SITE_URL}/admin/orders/${params.orderId}/process`,
  ].filter(Boolean)

  void notifyAdminAlert({
    subject: `New order ${params.orderNumber}`,
    body: lines.join("\n"),
  }).catch((err) => console.error("[staff-notify] order alert failed:", err))
}
