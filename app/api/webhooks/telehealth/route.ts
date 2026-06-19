import { NextRequest, NextResponse } from "next/server"
import { createHmac, timingSafeEqual } from "crypto"
import { applyIvWebhookEvent } from "@/lib/telehealth/iv-status"
import type { ClinicalServiceType, TelehealthWebhookEvent } from "@/lib/telehealth/types"

/**
 * Telehealth partner webhook endpoint
 *
 * Configure partner dashboard to POST:
 *   https://clearchoicepharmacy.com/api/webhooks/telehealth
 *
 * Set TELEHEALTH_WEBHOOK_SECRET; partner sends header x-telehealth-signature (HMAC-SHA256).
 */

function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.TELEHEALTH_WEBHOOK_SECRET
  if (!secret) return true

  if (!signature) return false

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex")
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  } catch {
    return false
  }
}

function parseWebhookEvent(body: unknown): TelehealthWebhookEvent | null {
  if (!body || typeof body !== "object") return null
  const record = body as Record<string, unknown>
  const event = record.event
  const submissionId = record.submissionId
  const serviceType = record.serviceType

  if (typeof event !== "string" || typeof submissionId !== "string") return null
  if (serviceType !== "iv_rejuvenation" && serviceType !== "mens_health" && serviceType !== "weight_loss" && serviceType !== "trt" && serviceType !== "rejuvenation_vial") {
    return null
  }

  return {
    event: event as TelehealthWebhookEvent["event"],
    submissionId,
    serviceType: serviceType as ClinicalServiceType,
    partnerCaseId: typeof record.partnerCaseId === "string" ? record.partnerCaseId : undefined,
    message: typeof record.message === "string" ? record.message : undefined,
    prescription:
      record.prescription && typeof record.prescription === "object"
        ? (record.prescription as TelehealthWebhookEvent["prescription"])
        : undefined,
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get("x-telehealth-signature")

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 })
  }

  let body: unknown
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const event = parseWebhookEvent(body)
  if (!event) {
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 })
  }

  if (event.serviceType === "iv_rejuvenation") {
    const updated = await applyIvWebhookEvent(event)
    if (!updated) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }
  } else {
    const { applyClinicalWebhookEvent } = await import("@/lib/telehealth/intake-status")
    const updated = await applyClinicalWebhookEvent(event)
    if (!updated) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }
  }

  return NextResponse.json({ received: true, submissionId: event.submissionId, event: event.event })
}
