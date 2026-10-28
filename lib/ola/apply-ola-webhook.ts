import "server-only"
import { sql } from "@/lib/db"
import { olaDecisionFromEvent } from "@/lib/ola/webhook-decision"

export type OlaWebhookBody = {
  caseId: string
  eventType: string
  detail: string | null
}

function prescriptionSummary(value: unknown): string | null {
  if (!Array.isArray(value) || value.length === 0) return null
  const names = value
    .map((item) => {
      if (!item || typeof item !== "object") return ""
      const medication = (item as { medication?: { display_name?: unknown } }).medication
      return typeof medication?.display_name === "string" ? medication.display_name : ""
    })
    .filter(Boolean)
  return names.length > 0 ? names.join("; ") : null
}

export function readOlaWebhook(body: unknown): OlaWebhookBody | null {
  if (!body || typeof body !== "object") return null
  const record = body as Record<string, unknown>
  const caseId = record.case_id
  const eventType = record.event_type || record.type
  if (typeof caseId !== "string" || typeof eventType !== "string") return null
  if (!caseId.trim() || !eventType.trim()) return null
  return {
    caseId: caseId.trim(),
    eventType: eventType.trim(),
    detail: prescriptionSummary(record.prescription),
  }
}

export async function applyOlaWebhook(event: OlaWebhookBody): Promise<boolean> {
  const mapped = olaDecisionFromEvent(event.eventType)
  await sql(`ALTER TABLE weight_loss_intake ADD COLUMN IF NOT EXISTS ola_decision TEXT`, []).catch(() => [])
  await sql(`ALTER TABLE weight_loss_intake ADD COLUMN IF NOT EXISTS ola_decision_detail TEXT`, []).catch(() => [])
  await sql(`ALTER TABLE weight_loss_intake ADD COLUMN IF NOT EXISTS ola_decision_at TIMESTAMPTZ`, []).catch(() => [])

  const rows = await sql(
    `UPDATE weight_loss_intake
     SET partner_status = $2,
         ola_decision = $3,
         ola_decision_detail = COALESCE($4, ola_decision_detail),
         ola_decision_at = NOW(),
         status = CASE
           WHEN $5::text IS NULL THEN status
           WHEN $5 = 'provider_denied' THEN $5
           WHEN status IN ('shipped', 'preparing', 'completed') THEN status
           ELSE $5
         END,
         updated_at = NOW()
     WHERE partner_case_id = $1
     RETURNING id`,
    [event.caseId, event.eventType, mapped.decision, event.detail, mapped.status]
  )
  return rows.length > 0
}
