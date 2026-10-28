import "server-only"
import { PHARMACY_PHONE_DISPLAY } from "@/lib/phone"
import { sendPatientEmail, type SendPatientEmailResult } from "@/lib/ses-mail"
import { LEGAL_BUSINESS_NAME, ZELLE_PAYMENT_EMAIL } from "@/lib/site-config"

export function weightLossZellePaymentEmail(params: {
  patientName: string
  submissionId: string
  amount?: number
}): { subject: string; text: string } {
  const name = params.patientName.trim() || "there"
  const amountLine =
    typeof params.amount === "number" && params.amount > 0
      ? `Pay $${params.amount} by Zelle.`
      : "Pay the amount confirmed on your intake by Zelle."

  return {
    subject: "Pay by Zelle to finish your weight-loss intake | Clear Choice Pharmacy",
    text: `Hi ${name},

Your weight-loss intake is saved. Reference: ${params.submissionId}.

${amountLine}
Send it to: ${ZELLE_PAYMENT_EMAIL}
The payment shows as: ${LEGAL_BUSINESS_NAME}
Memo: ${params.patientName.trim() || "your name"}

Your intake is sent for review after the payment arrives. If treatment is not approved, the pharmacy refunds you.

If the name on the Zelle screen is different, call ${PHARMACY_PHONE_DISPLAY} and do not send the payment.

Questions? Call ${PHARMACY_PHONE_DISPLAY} or reply to this email.

— Clear Choice Pharmacy`,
  }
}

export async function sendWeightLossZellePaymentEmail(params: {
  to: string
  patientName: string
  submissionId: string
  amount?: number
}): Promise<SendPatientEmailResult> {
  const message = weightLossZellePaymentEmail(params)
  const result = await sendPatientEmail({
    to: params.to,
    subject: message.subject,
    text: message.text,
  })
  if (!result.success) {
    console.error("[weight-loss] Zelle payment email failed:", {
      submissionId: params.submissionId,
      error: result.error,
    })
  }
  return result
}
