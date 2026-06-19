import { sql } from "@/lib/db"
import type { ClinicalServiceType, TelehealthWebhookEvent } from "@/lib/telehealth/types"

export const STANDARD_INTAKE_STATUS = {
  pending: "pending_provider_review",
  approved: "rx_at_pharmacy",
  denied: "provider_denied",
  followUp: "provider_follow_up",
  preparing: "preparing",
  shipped: "shipped",
  completed: "completed",
  cancelled: "cancelled",
} as const

const EVENT_TO_STATUS: Record<TelehealthWebhookEvent["event"], string> = {
  "intake.submitted": STANDARD_INTAKE_STATUS.pending,
  "provider.approved": STANDARD_INTAKE_STATUS.approved,
  "provider.denied": STANDARD_INTAKE_STATUS.denied,
  "provider.follow_up_required": STANDARD_INTAKE_STATUS.followUp,
  "prescription.sent_to_pharmacy": STANDARD_INTAKE_STATUS.approved,
}

type IntakeTable =
  | "patient_intake"
  | "trt_intake"
  | "weight_loss_intake"
  | "rejuvenation_vial_intakes"
  | "iv_booking_requests"

function tableForService(serviceType: ClinicalServiceType): IntakeTable {
  switch (serviceType) {
    case "mens_health":
      return "patient_intake"
    case "trt":
      return "trt_intake"
    case "weight_loss":
      return "weight_loss_intake"
    case "rejuvenation_vial":
      return "rejuvenation_vial_intakes"
    case "iv_rejuvenation":
      return "iv_booking_requests"
  }
}

export async function applyClinicalWebhookEvent(event: TelehealthWebhookEvent): Promise<boolean> {
  const nextStatus = EVENT_TO_STATUS[event.event]
  if (!nextStatus) return false

  const table = tableForService(event.serviceType)

  const rows = await sql(
    `UPDATE ${table}
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
