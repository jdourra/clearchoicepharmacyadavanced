import "server-only"
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"
import { PRIMARY_PHYSICIAN } from "@/lib/clinical-provider"
import { getAwsCredentials, getAwsRegion } from "@/lib/s3-env"

function getSesClient() {
  return new SESClient({
    region: getAwsRegion(),
    credentials: getAwsCredentials(),
  })
}

export type IntakeDecision = "approved" | "denied" | "follow_up"

export async function notifyPatientIntakeDecision(params: {
  to: string
  patientName: string
  serviceLabel: string
  submissionId: string
  decision: IntakeDecision
  note?: string
}): Promise<{ success: boolean; error?: string }> {
  const from = process.env.SES_SENDER_EMAIL || "intake@clearchoicepharmacy.com"
  const { to, patientName, serviceLabel, submissionId, decision, note } = params

  const subjects: Record<IntakeDecision, string> = {
    approved: `Approved — ${serviceLabel} | Clear Choice Pharmacy`,
    denied: `Update on your ${serviceLabel} request | Clear Choice Pharmacy`,
    follow_up: `Follow-up needed — ${serviceLabel} | Clear Choice Pharmacy`,
  }

  const bodies: Record<IntakeDecision, string> = {
    approved: `Hi ${patientName},

Good news — ${PRIMARY_PHYSICIAN.name} has approved your ${serviceLabel} intake (Reference: ${submissionId}).

Clear Choice Pharmacy in Novi, MI is now preparing your prescription. You'll receive another update when your order ships or is ready for dispatch.

Questions? Call ${PRIMARY_PHYSICIAN.pharmacyPhone} or reply to this email.

— Clear Choice Pharmacy`,

    denied: `Hi ${patientName},

${PRIMARY_PHYSICIAN.name} reviewed your ${serviceLabel} intake (Reference: ${submissionId}) and we are unable to approve treatment through our online program at this time.

${note ? `Provider note: ${note}\n\n` : ""}Your card authorization hold has been released — you will not be charged.

We recommend discussing your options with your primary care physician. For pharmacy questions, call ${PRIMARY_PHYSICIAN.pharmacyPhone}.

— Clear Choice Pharmacy`,

    follow_up: `Hi ${patientName},

${PRIMARY_PHYSICIAN.name} is reviewing your ${serviceLabel} intake (Reference: ${submissionId}) and needs additional information before we can proceed.

${note ? `Please reply with: ${note}\n\n` : "Our team will contact you shortly with specific questions.\n\n"}Your card authorization hold remains in place until a final decision is made.

Questions? Call ${PRIMARY_PHYSICIAN.pharmacyPhone}.

— Clear Choice Pharmacy`,
  }

  if (!getAwsCredentials()) {
    console.log("[telehealth/patient] SES not configured — patient notification log:")
    console.log(`To: ${to} | Decision: ${decision} | ${submissionId}`)
    console.log(bodies[decision])
    return { success: true }
  }

  try {
    await getSesClient().send(
      new SendEmailCommand({
        Source: from,
        Destination: { ToAddresses: [to] },
        Message: {
          Subject: { Data: subjects[decision], Charset: "UTF-8" },
          Body: { Text: { Data: bodies[decision], Charset: "UTF-8" } },
        },
      })
    )
    return { success: true }
  } catch (error) {
    console.error("[telehealth/patient] SES error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send patient notification",
    }
  }
}
