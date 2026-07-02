import "server-only"
import { getClinicianInboxEmail, PRIMARY_PHYSICIAN } from "@/lib/clinical-provider"
import { isSesConfigured } from "@/lib/ses-env"
import { sendPatientEmail } from "@/lib/ses-mail"

export async function notifyClinicianQueue(params: {
  submissionId: string
  subject: string
  body: string
}): Promise<{ success: boolean; error?: string }> {
  const to = getClinicianInboxEmail()

  if (!isSesConfigured()) {
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

  const result = await sendPatientEmail({
    to,
    subject: `[${PRIMARY_PHYSICIAN.name}] ${params.subject}`,
    text: `Assigned reviewer: ${PRIMARY_PHYSICIAN.name} (${PRIMARY_PHYSICIAN.credentials})\nReview in admin: /admin/intakes\n\n${params.body}`,
  })

  if (!result.success) {
    console.error("[telehealth/manual] SES error:", result.error)
  }

  return { success: result.success, error: result.error }
}
