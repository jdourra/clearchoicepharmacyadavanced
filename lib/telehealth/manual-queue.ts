import "server-only"
import { notifyClinicalIntakeAlert } from "@/lib/staff-notify"

export async function notifyClinicianQueue(params: {
  submissionId: string
  subject: string
  body: string
}): Promise<{ success: boolean; error?: string }> {
  return notifyClinicalIntakeAlert(params)
}
