import "server-only"
import { PRIMARY_PHYSICIAN } from "@/lib/clinical-provider"
import { sendPatientEmail } from "@/lib/ses-mail"

export type IntakeDecision = "approved" | "denied" | "follow_up"
export type IntakePaymentModel = "online_hold" | "pharmacy_terminal"

export async function notifyPatientIntakeDecision(params: {
  to: string
  patientName: string
  serviceLabel: string
  submissionId: string
  decision: IntakeDecision
  note?: string
  paymentModel?: IntakePaymentModel
}): Promise<{ success: boolean; error?: string; sandboxBlocked?: boolean }> {
  const {
    to,
    patientName,
    serviceLabel,
    submissionId,
    decision,
    note,
    paymentModel = "online_hold",
  } = params

  const payAtPharmacy = paymentModel === "pharmacy_terminal"

  const subjects: Record<IntakeDecision, string> = {
    approved: `Approved — ${serviceLabel} | Clear Choice Pharmacy`,
    denied: `Update on your ${serviceLabel} request | Clear Choice Pharmacy`,
    follow_up: `Follow-up needed — ${serviceLabel} | Clear Choice Pharmacy`,
  }

  const approvedBody = payAtPharmacy
    ? `Hi ${patientName},

Good news — ${PRIMARY_PHYSICIAN.name} has approved your ${serviceLabel} intake (Reference: ${submissionId}).

Next step: Clear Choice Pharmacy in Novi will contact you to collect payment for your kit on our pharmacy card terminal (or by phone/cash). Once payment is arranged, we prepare and ship your prescription.

Questions? Call ${PRIMARY_PHYSICIAN.pharmacyPhone} or reply to this email.

— Clear Choice Pharmacy`
    : `Hi ${patientName},

Good news — ${PRIMARY_PHYSICIAN.name} has approved your ${serviceLabel} intake (Reference: ${submissionId}).

Clear Choice Pharmacy in Novi, MI is now preparing your prescription. You'll receive another update when your order ships or is ready for dispatch.

Questions? Call ${PRIMARY_PHYSICIAN.pharmacyPhone} or reply to this email.

— Clear Choice Pharmacy`

  const deniedBody = payAtPharmacy
    ? `Hi ${patientName},

${PRIMARY_PHYSICIAN.name} reviewed your ${serviceLabel} intake (Reference: ${submissionId}) and we are unable to approve treatment through our online program at this time.

${note ? `Provider note: ${note}\n\n` : ""}No payment was collected online. You will not be charged.

We recommend discussing your options with your primary care physician. For pharmacy questions, call ${PRIMARY_PHYSICIAN.pharmacyPhone}.

— Clear Choice Pharmacy`
    : `Hi ${patientName},

${PRIMARY_PHYSICIAN.name} reviewed your ${serviceLabel} intake (Reference: ${submissionId}) and we are unable to approve treatment through our online program at this time.

${note ? `Provider note: ${note}\n\n` : ""}Your card authorization hold has been released — you will not be charged.

We recommend discussing your options with your primary care physician. For pharmacy questions, call ${PRIMARY_PHYSICIAN.pharmacyPhone}.

— Clear Choice Pharmacy`

  const followUpBody = payAtPharmacy
    ? `Hi ${patientName},

${PRIMARY_PHYSICIAN.name} is reviewing your ${serviceLabel} intake (Reference: ${submissionId}) and needs additional information before we can proceed.

${note ? `Please reply with: ${note}\n\n` : "Our team will contact you shortly with specific questions.\n\n"}No online payment is required until after approval. Payment is collected at the pharmacy when treatment is approved.

Questions? Call ${PRIMARY_PHYSICIAN.pharmacyPhone}.

— Clear Choice Pharmacy`
    : `Hi ${patientName},

${PRIMARY_PHYSICIAN.name} is reviewing your ${serviceLabel} intake (Reference: ${submissionId}) and needs additional information before we can proceed.

${note ? `Please reply with: ${note}\n\n` : "Our team will contact you shortly with specific questions.\n\n"}Your card authorization hold remains in place until a final decision is made.

Questions? Call ${PRIMARY_PHYSICIAN.pharmacyPhone}.

— Clear Choice Pharmacy`

  const bodies: Record<IntakeDecision, string> = {
    approved: approvedBody,
    denied: deniedBody,
    follow_up: followUpBody,
  }

  const result = await sendPatientEmail({
    to,
    subject: subjects[decision],
    text: bodies[decision],
  })

  if (!result.success) {
    console.error("[telehealth/patient] email failed:", {
      to,
      decision,
      submissionId,
      error: result.error,
    })
  }

  return result
}
