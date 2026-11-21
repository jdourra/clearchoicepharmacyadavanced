import "server-only"
import { SendEmailCommand, SendRawEmailCommand } from "@aws-sdk/client-ses"
import { getAwsCredentials } from "@/lib/s3-env"
import {
  formatSesError,
  formatSesFromAddress,
  getSesReplyToEmail,
  getSesSenderEmail,
  isSesConfigured,
  normalizePatientEmail,
} from "@/lib/ses-env"
import { getSesClient } from "@/lib/ses-client"

export type SendPatientEmailResult = {
  success: boolean
  error?: string
  sandboxBlocked?: boolean
}

export async function sendPatientEmail(params: {
  to: string
  subject: string
  text: string
  html?: string
}): Promise<SendPatientEmailResult> {
  const to = normalizePatientEmail(params.to)

  if (!to) {
    return { success: false, error: "Recipient email is missing." }
  }

  if (!isSesConfigured()) {
    return {
      success: false,
      error:
        "SES is not configured. Add AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_REGION=us-east-2 on Vercel, then redeploy.",
    }
  }

  if (!getAwsCredentials()) {
    return { success: false, error: "AWS credentials are missing or invalid." }
  }

  const from = formatSesFromAddress()
  const replyTo = getSesReplyToEmail()

  try {
    await getSesClient().send(
      new SendEmailCommand({
        Source: from,
        Destination: { ToAddresses: [to] },
        ReplyToAddresses: replyTo ? [replyTo] : undefined,
        Message: {
          Subject: { Data: params.subject, Charset: "UTF-8" },
          Body: {
            Text: { Data: params.text, Charset: "UTF-8" },
            ...(params.html
              ? { Html: { Data: params.html, Charset: "UTF-8" } }
              : {}),
          },
        },
      })
    )
    return { success: true }
  } catch (error) {
    console.error("[ses-mail] send failed:", { to, from: getSesSenderEmail(), error })
    const formatted = formatSesError(error, to)
    const sandboxBlocked =
      formatted.includes("sandbox") ||
      (error instanceof Error &&
        (error.message.includes("Email address is not verified") ||
          error.message.includes("MessageRejected")))
    return {
      success: false,
      error: formatted,
      sandboxBlocked,
    }
  }
}

function wrapBase64(value: string): string {
  return value.replace(/(.{76})/g, "$1\r\n")
}

function headerValue(value: string): string {
  return value.replace(/[\r\n]/g, " ").trim()
}

export async function sendPatientEmailWithPdf(params: {
  to: string
  subject: string
  text: string
  filename: string
  pdf: Uint8Array
}): Promise<SendPatientEmailResult> {
  const to = normalizePatientEmail(params.to)
  if (!to) return { success: false, error: "Recipient email is missing." }
  if (!isSesConfigured() || !getAwsCredentials()) {
    return { success: false, error: "Email is not configured." }
  }

  const from = formatSesFromAddress()
  const replyTo = getSesReplyToEmail()
  const boundary = `ccp-receipt-${Date.now()}`
  const pdfBase64 = wrapBase64(Buffer.from(params.pdf).toString("base64"))
  const headers = [
    `From: ${headerValue(from)}`,
    `To: ${headerValue(to)}`,
    ...(replyTo ? [`Reply-To: ${headerValue(replyTo)}`] : []),
    `Subject: ${headerValue(params.subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
  ]
  const raw = [
    headers.join("\r\n"),
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 7bit",
    "",
    params.text.replace(/\r?\n/g, "\r\n"),
    "",
    `--${boundary}`,
    `Content-Type: application/pdf; name="${headerValue(params.filename)}"`,
    `Content-Disposition: attachment; filename="${headerValue(params.filename)}"`,
    "Content-Transfer-Encoding: base64",
    "",
    pdfBase64,
    "",
    `--${boundary}--`,
    "",
  ].join("\r\n")

  try {
    await getSesClient().send(
      new SendRawEmailCommand({
        Source: from,
        Destinations: [to],
        RawMessage: { Data: Buffer.from(raw) },
      })
    )
    return { success: true }
  } catch (error) {
    console.error("[ses-mail] receipt send failed:", { to, error })
    const formatted = formatSesError(error, to)
    return { success: false, error: formatted }
  }
}
