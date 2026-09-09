import "server-only"
import { sql } from "@/lib/db"
import {
  buildGoogleReviewRequestEmail,
  GOOGLE_REVIEW_REQUEST_SUBJECT,
} from "@/lib/patient-google-review-email"
import { sendPatientEmail } from "@/lib/ses-mail"
import { GOOGLE_REVIEW_URL, isGoogleReviewUrlConfigured } from "@/lib/site-config"

/** Wait this many days after fulfillment before asking for a review. */
export const GOOGLE_REVIEW_MIN_DAYS_AFTER_FULFILLMENT = 3

/** Do not email fulfillments older than this (avoid stale outreach). */
export const GOOGLE_REVIEW_MAX_DAYS_AFTER_FULFILLMENT = 90

export type GoogleReviewCandidate = {
  id: string
  email: string
  firstName: string
  lastName: string
  fulfilledAt: string
  source: "order" | "weight_loss_intake" | "patient_intake" | "trt_intake"
}

export type GoogleReviewSendResult = {
  patientId: string
  email: string
  success: boolean
  error?: string
}

async function ensureReviewColumn(): Promise<void> {
  await sql(
    `ALTER TABLE patients ADD COLUMN IF NOT EXISTS google_review_request_sent_at TIMESTAMPTZ`,
    []
  )
}

/**
 * Patients who completed a paid fulfillment (shipped order or paid clinical intake)
 * and have not yet received a Google review request.
 */
export async function listGoogleReviewCandidates(options?: {
  patientIds?: string[]
  /** When true, ignore the 3–90 day window (manual admin send). */
  relaxAgeRules?: boolean
}): Promise<GoogleReviewCandidate[]> {
  await ensureReviewColumn()

  const minDays = options?.relaxAgeRules ? 0 : GOOGLE_REVIEW_MIN_DAYS_AFTER_FULFILLMENT
  const maxDays = options?.relaxAgeRules ? 3650 : GOOGLE_REVIEW_MAX_DAYS_AFTER_FULFILLMENT
  const ids = options?.patientIds?.filter(Boolean)

  const rows = await sql(
    `WITH fulfilled AS (
       SELECT o.patient_id,
              COALESCE(o.supply_cycle_started_at, o.updated_at, o.created_at) AS fulfilled_at,
              'order'::text AS source
       FROM orders o
       WHERE o.patient_id IS NOT NULL
         AND o.payment_status = 'paid'
         AND o.status IN ('shipped', 'delivered', 'completed')

       UNION ALL

       SELECT wi.patient_id,
              COALESCE(wi.supply_cycle_started_at, wi.updated_at, wi.created_at) AS fulfilled_at,
              'weight_loss_intake'::text AS source
       FROM weight_loss_intake wi
       WHERE wi.patient_id IS NOT NULL
         AND wi.payment_status IN ('captured', 'paid_in_person')
         AND wi.status IN ('shipped', 'completed')

       UNION ALL

       SELECT pi.patient_id,
              COALESCE(pi.supply_cycle_started_at, pi.updated_at, pi.created_at) AS fulfilled_at,
              'patient_intake'::text AS source
       FROM patient_intake pi
       WHERE pi.patient_id IS NOT NULL
         AND pi.payment_status IN ('captured', 'paid_in_person')
         AND pi.status IN ('shipped', 'completed')

       UNION ALL

       SELECT ti.patient_id,
              COALESCE(ti.supply_cycle_started_at, ti.updated_at, ti.created_at) AS fulfilled_at,
              'trt_intake'::text AS source
       FROM trt_intake ti
       WHERE ti.patient_id IS NOT NULL
         AND ti.payment_status IN ('captured', 'paid_in_person')
         AND ti.status IN ('shipped', 'completed')
     ),
     latest AS (
       SELECT patient_id, MAX(fulfilled_at) AS fulfilled_at,
              (ARRAY_AGG(source ORDER BY fulfilled_at DESC))[1] AS source
       FROM fulfilled
       WHERE patient_id IS NOT NULL
       GROUP BY patient_id
     )
     SELECT p.id, p.email, p.first_name, p.last_name, l.fulfilled_at, l.source
     FROM latest l
     JOIN patients p ON p.id = l.patient_id
     WHERE p.google_review_request_sent_at IS NULL
       AND p.email IS NOT NULL
       AND TRIM(p.email) <> ''
       AND ($1::int = 0 OR l.fulfilled_at <= NOW() - ($1::text || ' days')::interval)
       AND l.fulfilled_at >= NOW() - ($2::text || ' days')::interval
       AND ($3::uuid[] IS NULL OR p.id = ANY($3::uuid[]))
     ORDER BY l.fulfilled_at ASC`,
    [String(minDays), String(maxDays), ids?.length ? ids : null]
  ).catch(async () => {
    // Fallback if supply_cycle_started_at is missing on some tables
    return sql(
      `WITH fulfilled AS (
         SELECT o.patient_id,
                COALESCE(o.updated_at, o.created_at) AS fulfilled_at,
                'order'::text AS source
         FROM orders o
         WHERE o.patient_id IS NOT NULL
           AND o.payment_status = 'paid'
           AND o.status IN ('shipped', 'delivered', 'completed')

         UNION ALL

         SELECT wi.patient_id,
                COALESCE(wi.updated_at, wi.created_at) AS fulfilled_at,
                'weight_loss_intake'::text AS source
         FROM weight_loss_intake wi
         WHERE wi.patient_id IS NOT NULL
           AND wi.payment_status IN ('captured', 'paid_in_person')
           AND wi.status IN ('shipped', 'completed')
       ),
       latest AS (
         SELECT patient_id, MAX(fulfilled_at) AS fulfilled_at,
                (ARRAY_AGG(source ORDER BY fulfilled_at DESC))[1] AS source
         FROM fulfilled
         GROUP BY patient_id
       )
       SELECT p.id, p.email, p.first_name, p.last_name, l.fulfilled_at, l.source
       FROM latest l
       JOIN patients p ON p.id = l.patient_id
       WHERE p.google_review_request_sent_at IS NULL
         AND p.email IS NOT NULL
         AND TRIM(p.email) <> ''
         AND ($1::int = 0 OR l.fulfilled_at <= NOW() - ($1::text || ' days')::interval)
         AND l.fulfilled_at >= NOW() - ($2::text || ' days')::interval
         AND ($3::uuid[] IS NULL OR p.id = ANY($3::uuid[]))
       ORDER BY l.fulfilled_at ASC`,
      [String(minDays), String(maxDays), ids?.length ? ids : null]
    ).catch(() => [])
  })

  return rows.map((r) => ({
    id: String(r.id),
    email: String(r.email),
    firstName: String(r.first_name || ""),
    lastName: String(r.last_name || ""),
    fulfilledAt: String(r.fulfilled_at),
    source: String(r.source) as GoogleReviewCandidate["source"],
  }))
}

export async function sendGoogleReviewRequestToPatient(
  candidate: GoogleReviewCandidate
): Promise<GoogleReviewSendResult> {
  if (!isGoogleReviewUrlConfigured()) {
    return {
      patientId: candidate.id,
      email: candidate.email,
      success: false,
      error:
        "GOOGLE_REVIEW_URL is not set. Add your Google Business Profile review link in Vercel env vars.",
    }
  }

  const { text, html } = buildGoogleReviewRequestEmail({
    firstName: candidate.firstName,
    reviewUrl: GOOGLE_REVIEW_URL,
  })

  const result = await sendPatientEmail({
    to: candidate.email,
    subject: GOOGLE_REVIEW_REQUEST_SUBJECT,
    text,
    html,
  })

  if (result.success) {
    await ensureReviewColumn()
    await sql(`UPDATE patients SET google_review_request_sent_at = NOW() WHERE id = $1`, [
      candidate.id,
    ])
  }

  return {
    patientId: candidate.id,
    email: candidate.email,
    success: result.success,
    error: result.error,
  }
}

export async function sendGoogleReviewRequestBatch(options?: {
  patientIds?: string[]
  dryRun?: boolean
  relaxAgeRules?: boolean
}): Promise<{
  dryRun: boolean
  eligible: number
  sent: number
  failed: number
  reviewUrlConfigured: boolean
  results: GoogleReviewSendResult[]
}> {
  const candidates = await listGoogleReviewCandidates({
    patientIds: options?.patientIds,
    relaxAgeRules: options?.relaxAgeRules,
  })

  if (options?.dryRun) {
    return {
      dryRun: true,
      eligible: candidates.length,
      sent: 0,
      failed: 0,
      reviewUrlConfigured: isGoogleReviewUrlConfigured(),
      results: candidates.map((c) => ({
        patientId: c.id,
        email: c.email,
        success: true,
      })),
    }
  }

  const results: GoogleReviewSendResult[] = []
  for (const candidate of candidates) {
    results.push(await sendGoogleReviewRequestToPatient(candidate))
  }

  return {
    dryRun: false,
    eligible: candidates.length,
    sent: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    reviewUrlConfigured: isGoogleReviewUrlConfigured(),
    results,
  }
}
