import "server-only"
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"

const sesClient = new SESClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
})

export async function notifyClinicianQueue(params: {
  submissionId: string
  subject: string
  body: string
}): Promise<{ success: boolean; error?: string }> {
  const to =
    process.env.TELEHEALTH_CLINICIAN_EMAIL ||
    process.env.DR_DOURRA_EMAIL ||
    process.env.ADMIN_EMAIL ||
    ""

  const from = process.env.SES_SENDER_EMAIL || "intake@clearchoicepharmacy.com"

  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.log("[telehealth/manual] SES not configured — clinician queue log:")
    console.log(`Submission: ${params.submissionId}`)
    console.log(`Subject: ${params.subject}`)
    console.log(params.body)
    return { success: true }
  }

  if (!to) {
    console.log("[telehealth/manual] No clinician email — logging intake:")
    console.log(params.body)
    return { success: true }
  }

  try {
    await sesClient.send(
      new SendEmailCommand({
        Source: from,
        Destination: { ToAddresses: [to] },
        Message: {
          Subject: { Data: params.subject, Charset: "UTF-8" },
          Body: { Text: { Data: params.body, Charset: "UTF-8" } },
        },
      })
    )
    return { success: true }
  } catch (error) {
    console.error("[telehealth/manual] SES error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send clinician notification",
    }
  }
}
