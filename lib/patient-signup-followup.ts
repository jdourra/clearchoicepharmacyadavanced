import "server-only"
import { sql } from "@/lib/db"
import { buildSignupFollowupEmail, SIGNUP_FOLLOWUP_SUBJECT } from "@/lib/patient-signup-followup-email"
import { sendPatientEmail } from "@/lib/ses-mail"

/** Days after signup before sending the check-in (avoid same-day noise). */
export const SIGNUP_FOLLOWUP_MIN_AGE_DAYS = 3

/** Do not email accounts older than this (stale signups). */
export const SIGNUP_FOLLOWUP_MAX_AGE_DAYS = 30

export type SignupFollowupCandidate = {
  id: string
  email: string
  firstName: string
  lastName: string
  createdAt: string
  signupFollowupSentAt: string | null
}

export type SignupFollowupSendResult = {
  patientId: string
  email: string
  success: boolean
  error?: string
}

async function ensureFollowupColumn(): Promise<void> {
  await sql(
    `ALTER TABLE patients ADD COLUMN IF NOT EXISTS signup_followup_sent_at TIMESTAMPTZ`,
    []
  )
}

export async function listSignupFollowupCandidates(options?: {
  patientIds?: string[]
  /** When true (manual admin send), include recent signups under 3 days. */
  relaxAgeRules?: boolean
}): Promise<SignupFollowupCandidate[]> {
  await ensureFollowupColumn()

  const minDays = options?.relaxAgeRules ? 0 : SIGNUP_FOLLOWUP_MIN_AGE_DAYS
  const maxDays = options?.relaxAgeRules ? 365 : SIGNUP_FOLLOWUP_MAX_AGE_DAYS
  const ids = options?.patientIds?.filter(Boolean)

  const rows = await sql(
    `SELECT p.id, p.email, p.first_name, p.last_name, p.created_at, p.signup_followup_sent_at
     FROM patients p
     WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.patient_id = p.id)
       AND ($1::int = 0 OR p.created_at <= NOW() - ($1::text || ' days')::interval)
       AND p.created_at >= NOW() - ($2::text || ' days')::interval
       AND p.signup_followup_sent_at IS NULL
       AND p.email IS NOT NULL
       AND TRIM(p.email) <> ''
       AND ($3::uuid[] IS NULL OR p.id = ANY($3::uuid[]))
     ORDER BY p.created_at ASC`,
    [String(minDays), String(maxDays), ids?.length ? ids : null]
  )

  return rows.map((r) => ({
    id: String(r.id),
    email: String(r.email),
    firstName: String(r.first_name || ""),
    lastName: String(r.last_name || ""),
    createdAt: String(r.created_at),
    signupFollowupSentAt: r.signup_followup_sent_at ? String(r.signup_followup_sent_at) : null,
  }))
}

export async function sendSignupFollowupToPatient(
  candidate: SignupFollowupCandidate
): Promise<SignupFollowupSendResult> {
  const { text, html } = buildSignupFollowupEmail({ firstName: candidate.firstName })
  const result = await sendPatientEmail({
    to: candidate.email,
    subject: SIGNUP_FOLLOWUP_SUBJECT,
    text,
    html,
  })

  if (result.success) {
    await sql(`UPDATE patients SET signup_followup_sent_at = NOW() WHERE id = $1`, [candidate.id])
  }

  return {
    patientId: candidate.id,
    email: candidate.email,
    success: result.success,
    error: result.error,
  }
}

export async function sendSignupFollowupBatch(options?: {
  patientIds?: string[]
  dryRun?: boolean
  relaxAgeRules?: boolean
}): Promise<{
  dryRun: boolean
  eligible: number
  sent: number
  failed: number
  results: SignupFollowupSendResult[]
}> {
  const candidates = await listSignupFollowupCandidates({
    patientIds: options?.patientIds,
    relaxAgeRules: options?.relaxAgeRules,
  })

  if (options?.dryRun) {
    return {
      dryRun: true,
      eligible: candidates.length,
      sent: 0,
      failed: 0,
      results: candidates.map((c) => ({
        patientId: c.id,
        email: c.email,
        success: true,
      })),
    }
  }

  const results: SignupFollowupSendResult[] = []
  for (const candidate of candidates) {
    results.push(await sendSignupFollowupToPatient(candidate))
  }

  return {
    dryRun: false,
    eligible: candidates.length,
    sent: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    results,
  }
}
