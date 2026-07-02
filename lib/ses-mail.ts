import "server-only"
import { SendEmailCommand } from "@aws-sdk/client-ses"
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
