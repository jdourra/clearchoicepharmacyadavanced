import type { IvBookingStatus, TelehealthWebhookEvent } from "@/lib/telehealth/types"
import { sql } from "@/lib/db"

const IV_STATUS_FROM_EVENT: Record<TelehealthWebhookEvent["event"], IvBookingStatus> = {
  "intake.submitted": "pending_provider_review",
  "provider.approved": "rx_at_pharmacy",
  "provider.denied": "provider_denied",
  "provider.follow_up_required": "provider_follow_up",
  "prescription.sent_to_pharmacy": "rx_at_pharmacy",
}

export async function applyIvWebhookEvent(event: TelehealthWebhookEvent): Promise<boolean> {
  const nextStatus = IV_STATUS_FROM_EVENT[event.event]
  if (!nextStatus) return false

  const rows = await sql(
    `UPDATE iv_booking_requests
     SET status = $1,
         partner_case_id = COALESCE($2, partner_case_id),
         partner_status = $3,
         partner_name = COALESCE($4, partner_name),
         updated_at = NOW()
     WHERE id = $5
     RETURNING id`,
    [
      nextStatus,
      event.partnerCaseId || null,
      event.event,
      process.env.TELEHEALTH_PARTNER || "manual",
      event.submissionId,
    ]
  )

  return rows.length > 0
}

export async function markIvReadyForDispatch(submissionId: string): Promise<boolean> {
  const rows = await sql(
    `UPDATE iv_booking_requests
     SET status = 'ready_for_dispatch', updated_at = NOW()
     WHERE id = $1 AND status IN ('rx_at_pharmacy', 'preparing')
     RETURNING id`,
    [submissionId]
  )
  return rows.length > 0
}
