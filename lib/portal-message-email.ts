import "server-only"
import { SendEmailCommand } from "@aws-sdk/client-ses"
import { SITE_URL } from "@/lib/site-config"
import { envTrim, getAwsCredentials } from "@/lib/s3-env"
import { getSesClient } from "@/lib/ses-client"

export async function emailPatientPortalMessage(params: {
  to: string
  patientName?: string
  subject: string
  body: string
  orderId?: string | null
}): Promise<{ emailed: boolean; error?: string }> {
  const from = envTrim("SES_SENDER_EMAIL") || "intake@clearchoicepharmacy.com"
  const { to, patientName, subject, body, orderId } = params
  const recipient = to.trim().toLowerCase()

  if (!getAwsCredentials()) {
    return { emailed: false, error: "SES not configured" }
  }

  const greeting = patientName?.trim() ? `Hi ${patientName.trim()},` : "Hi,"
  const portalUrl = `${SITE_URL.replace(/\/$/, "")}/account`
  const orderLine = orderId ? `\nOrder reference: ${orderId}\n` : ""

  const text = `${greeting}

${subject}

${body}
${orderLine}
You can also read this message in your patient portal:
${portalUrl}

Questions? Call (248) 987-6182 or reply to this email.

— Clear Choice Pharmacy`

  try {
    await getSesClient().send(
      new SendEmailCommand({
        Source: from,
        Destination: { ToAddresses: [recipient] },
        Message: {
          Subject: { Data: subject, Charset: "UTF-8" },
          Body: { Text: { Data: text, Charset: "UTF-8" } },
        },
      })
    )
    return { emailed: true }
  } catch (error) {
    console.error("[portal-message-email]", error)
    return {
      emailed: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    }
  }
}
