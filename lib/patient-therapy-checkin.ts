import "server-only"
import { randomBytes } from "crypto"
import { sql } from "@/lib/db"
import { sendPatientEmail } from "@/lib/ses-mail"
import { SITE_URL } from "@/lib/site-config"
import {
  buildTherapyCheckInEmail,
  THERAPY_CHECKIN_SUBJECT,
} from "@/lib/patient-therapy-checkin-email"
import {
  computeNextRefillMeta,
  expandWeightLossIntakeToMonths,
  type TherapyCheckInSummary,
  type TherapyTimelineResult,
} from "@/lib/patient-therapy-timeline"
import {
  formatWeightLossDoseLabel,
  resolveWeightLossBillingKitCount,
  resolveWeightLossDoseIdFromDetail,
} from "@/lib/weight-loss-dose-review"
import { getWeightLossDose, getWeightLossProgram } from "@/lib/weight-loss-catalog"

let ensured = false

export async function ensureTherapyCheckInTable(): Promise<void> {
  if (ensured) return
  await sql(
    `CREATE TABLE IF NOT EXISTS therapy_checkins (
      id TEXT PRIMARY KEY,
      patient_id TEXT,
      patient_email TEXT NOT NULL,
      service_type TEXT NOT NULL DEFAULT 'weight_loss',
      intake_id TEXT NOT NULL,
      month_index INTEGER NOT NULL DEFAULT 0,
      month_label TEXT,
      response_token TEXT UNIQUE NOT NULL,
      sent_at TIMESTAMPTZ,
      responded_at TIMESTAMPTZ,
      tolerating BOOLEAN,
      weight_lost_lbs NUMERIC,
      side_effects TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
    []
  ).catch(() => [])
  await sql(
    `CREATE INDEX IF NOT EXISTS idx_therapy_checkins_intake ON therapy_checkins (intake_id, month_index)`,
    []
  ).catch(() => [])
  await sql(
    `CREATE INDEX IF NOT EXISTS idx_therapy_checkins_token ON therapy_checkins (response_token)`,
    []
  ).catch(() => [])
  ensured = true
}

function mapCheckIn(row: Record<string, unknown>): TherapyCheckInSummary {
  return {
    id: String(row.id),
    monthIndex: Number(row.month_index ?? 0),
    monthLabel: String(row.month_label ?? ""),
    sentAt: row.sent_at != null ? String(row.sent_at) : null,
    respondedAt: row.responded_at != null ? String(row.responded_at) : null,
    tolerating: row.tolerating == null ? null : Boolean(row.tolerating),
    weightLostLbs:
      row.weight_lost_lbs != null && Number.isFinite(Number(row.weight_lost_lbs))
        ? Number(row.weight_lost_lbs)
        : null,
    sideEffects: row.side_effects != null ? String(row.side_effects) : null,
    notes: row.notes != null ? String(row.notes) : null,
  }
}

async function listCheckInsForIntake(intakeId: string): Promise<TherapyCheckInSummary[]> {
  await ensureTherapyCheckInTable()
  const rows = await sql(
    `SELECT * FROM therapy_checkins WHERE intake_id = $1 ORDER BY month_index ASC`,
    [intakeId]
  ).catch(() => [])
  return rows.map((r) => mapCheckIn(r as Record<string, unknown>))
}

async function listWeightLossIntakesForPatient(params: {
  patientId?: string | null
  email?: string | null
}): Promise<Record<string, unknown>[]> {
  const email = params.email?.trim().toLowerCase() || null
  const patientId = params.patientId?.trim() || null
  if (!email && !patientId) return []

  const rows = await sql(
    `SELECT *
     FROM weight_loss_intake
     WHERE ($1::text IS NOT NULL AND patient_id = $1)
        OR ($2::text IS NOT NULL AND LOWER(email) = $2)
     ORDER BY COALESCE(supply_cycle_started_at, created_at) ASC`,
    [patientId, email]
  ).catch(() => [])
  return rows as Record<string, unknown>[]
}

async function getPrescriptionForIntake(intakeId: string): Promise<Record<string, unknown> | null> {
  const rows = await sql(
    `SELECT * FROM clinical_prescriptions
     WHERE service_type = 'weight_loss' AND intake_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [intakeId]
  ).catch(() => [])
  return (rows[0] as Record<string, unknown>) ?? null
}

export async function getTherapyTimelineForPatient(params: {
  patientId?: string | null
  email?: string | null
  patientName?: string | null
}): Promise<TherapyTimelineResult> {
  const intakes = await listWeightLossIntakesForPatient(params)
  const email =
    params.email?.trim() ||
    (intakes[0]?.email != null ? String(intakes[0].email) : "") ||
    ""
  const patientName =
    params.patientName?.trim() ||
    (intakes[0]
      ? `${intakes[0].first_name ?? ""} ${intakes[0].last_name ?? ""}`.trim()
      : "") ||
    "Patient"

  const rows = []
  let nextRefillAt: string | null = null
  let refillReminderDue = false

  for (const intake of intakes) {
    const [rx, checkIns] = await Promise.all([
      getPrescriptionForIntake(String(intake.id)),
      listCheckInsForIntake(String(intake.id)),
    ])
    rows.push(
      ...expandWeightLossIntakeToMonths({
        intake,
        prescription: rx,
        checkIns,
      })
    )
    const meta = computeNextRefillMeta(intake)
    if (meta.nextRefillAt) {
      if (!nextRefillAt || meta.nextRefillAt > nextRefillAt) {
        nextRefillAt = meta.nextRefillAt
      }
    }
    if (meta.refillReminderDue) refillReminderDue = true
  }

  rows.sort((a, b) => a.periodStart.localeCompare(b.periodStart))

  return {
    patientName,
    email,
    rows,
    nextRefillAt,
    refillReminderDue,
  }
}

export async function createAndSendTherapyCheckIn(params: {
  intakeId: string
  monthIndex: number
  forceResend?: boolean
}): Promise<{ success: boolean; error?: string; checkInId?: string }> {
  await ensureTherapyCheckInTable()

  const intakes = await sql(`SELECT * FROM weight_loss_intake WHERE id = $1 LIMIT 1`, [
    params.intakeId,
  ]).catch(() => [])
  const intake = intakes[0] as Record<string, unknown> | undefined
  if (!intake) return { success: false, error: "Intake not found" }

  const email = String(intake.email ?? "").trim()
  if (!email) return { success: false, error: "Patient email missing" }

  const kits = resolveWeightLossBillingKitCount(intake)
  if (params.monthIndex < 0 || params.monthIndex >= kits) {
    return { success: false, error: "Invalid month for this order" }
  }

  const existing = await sql(
    `SELECT * FROM therapy_checkins
     WHERE intake_id = $1 AND month_index = $2
     ORDER BY created_at DESC
     LIMIT 1`,
    [params.intakeId, params.monthIndex]
  ).catch(() => [])
  const prior = existing[0] as Record<string, unknown> | undefined
  if (prior?.responded_at && !params.forceResend) {
    return { success: false, error: "Patient already responded for this month." }
  }
  if (prior?.sent_at && !params.forceResend && !prior.responded_at) {
    // Allow resend only if forced; otherwise reuse token and resend email.
  }

  const timelineRows = expandWeightLossIntakeToMonths({ intake })
  const monthRow = timelineRows.find((r) => r.monthIndex === params.monthIndex)
  if (!monthRow) return { success: false, error: "Could not resolve therapy month" }

  const program = getWeightLossProgram(String(intake.selected_program ?? ""))
  const dose = getWeightLossDose(
    String(intake.selected_program ?? ""),
    resolveWeightLossDoseIdFromDetail(intake)
  )

  const id = prior ? String(prior.id) : `tc_${randomBytes(8).toString("hex")}`
  const token = prior ? String(prior.response_token) : randomBytes(24).toString("hex")
  const checkInUrl = `${SITE_URL.replace(/\/$/, "")}/therapy-checkin/${token}`

  if (prior) {
    await sql(
      `UPDATE therapy_checkins
       SET sent_at = NOW(), month_label = $2, updated_at = NOW()
       WHERE id = $1`,
      [id, monthRow.monthLabel]
    )
  } else {
    await sql(
      `INSERT INTO therapy_checkins (
         id, patient_id, patient_email, service_type, intake_id, month_index, month_label,
         response_token, sent_at
       ) VALUES ($1, $2, $3, 'weight_loss', $4, $5, $6, $7, NOW())`,
      [
        id,
        intake.patient_id != null ? String(intake.patient_id) : null,
        email,
        params.intakeId,
        params.monthIndex,
        monthRow.monthLabel,
        token,
      ]
    )
  }

  const { text, html } = buildTherapyCheckInEmail({
    firstName: String(intake.first_name ?? ""),
    medicationLabel: program?.name ? `Compounded ${program.name}` : "your GLP-1 therapy",
    monthLabel: monthRow.monthLabel,
    doseLabel: dose ? formatWeightLossDoseLabel(dose) : monthRow.doseLabel,
    checkInUrl,
  })

  const sent = await sendPatientEmail({
    to: email,
    subject: THERAPY_CHECKIN_SUBJECT,
    text,
    html,
  })

  if (!sent.success) {
    return { success: false, error: sent.error || "Failed to send check-in email" }
  }

  return { success: true, checkInId: id }
}

export async function getTherapyCheckInByToken(token: string) {
  await ensureTherapyCheckInTable()
  const rows = await sql(`SELECT * FROM therapy_checkins WHERE response_token = $1 LIMIT 1`, [
    token,
  ]).catch(() => [])
  return (rows[0] as Record<string, unknown>) ?? null
}

export async function submitTherapyCheckInResponse(params: {
  token: string
  tolerating: boolean
  weightLostLbs?: number | null
  sideEffects?: string
  notes?: string
}): Promise<{ success: boolean; error?: string }> {
  await ensureTherapyCheckInTable()
  const row = await getTherapyCheckInByToken(params.token)
  if (!row) return { success: false, error: "Check-in link is invalid or expired." }

  await sql(
    `UPDATE therapy_checkins
     SET tolerating = $2,
         weight_lost_lbs = $3,
         side_effects = $4,
         notes = $5,
         responded_at = NOW(),
         updated_at = NOW()
     WHERE id = $1`,
    [
      String(row.id),
      params.tolerating,
      params.weightLostLbs ?? null,
      params.sideEffects?.trim() || null,
      params.notes?.trim() || null,
    ]
  )

  return { success: true }
}

/**
 * Auto-send check-ins mid-month (days 14–21 of each kit month) for paid weight-loss supplies.
 */
export async function sendDueTherapyCheckIns(options?: {
  dryRun?: boolean
}): Promise<{ sent: number; skipped: number; errors: string[] }> {
  await ensureTherapyCheckInTable()
  const rows = await sql(
    `SELECT *
     FROM weight_loss_intake
     WHERE payment_status IN ('captured', 'paid_in_person')
       AND supply_cycle_started_at IS NOT NULL
       AND status NOT IN ('denied', 'cancelled', 'pending_provider_review')
     ORDER BY supply_cycle_started_at ASC
     LIMIT 200`,
    []
  ).catch(() => [])

  let sent = 0
  let skipped = 0
  const errors: string[] = []
  const now = Date.now()

  for (const raw of rows) {
    const intake = raw as Record<string, unknown>
    const start = new Date(String(intake.supply_cycle_started_at)).getTime()
    if (!Number.isFinite(start)) {
      skipped++
      continue
    }
    const kits = resolveWeightLossBillingKitCount(intake)
    for (let monthIndex = 0; monthIndex < kits; monthIndex++) {
      const monthStart = start + monthIndex * 28 * 24 * 60 * 60 * 1000
      const day14 = monthStart + 14 * 24 * 60 * 60 * 1000
      const day22 = monthStart + 22 * 24 * 60 * 60 * 1000
      if (now < day14 || now >= day22) {
        skipped++
        continue
      }

      const existing = await sql(
        `SELECT id, sent_at, responded_at FROM therapy_checkins
         WHERE intake_id = $1 AND month_index = $2
         LIMIT 1`,
        [String(intake.id), monthIndex]
      ).catch(() => [])
      if (existing[0]?.sent_at || existing[0]?.responded_at) {
        skipped++
        continue
      }

      if (options?.dryRun) {
        sent++
        continue
      }

      const result = await createAndSendTherapyCheckIn({
        intakeId: String(intake.id),
        monthIndex,
      })
      if (result.success) sent++
      else {
        skipped++
        if (result.error) errors.push(`${intake.id} m${monthIndex}: ${result.error}`)
      }
    }
  }

  return { sent, skipped, errors }
}
