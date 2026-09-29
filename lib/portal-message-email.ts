import "server-only"
import { SITE_URL } from "@/lib/site-config"
import { sendPatientEmail } from "@/lib/ses-mail"

export async function emailPatientPortalMessage(params: {
  to: string
  patientName?: string
  subject: string
  body: string
  orderId?: string | null
}): Promise<{ emailed: boolean; error?: string; sandboxBlocked?: boolean }> {
  const { to, patientName, subject, body, orderId } = params

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

  const result = await sendPatientEmail({
    to,
    subject: subject || "Message from Clear Choice Pharmacy",
    text,
  })

  return {
    emailed: result.success,
    error: result.error,
    sandboxBlocked: result.sandboxBlocked,
  }
}
