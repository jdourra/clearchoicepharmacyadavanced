import "server-only"
import { sql } from "@/lib/db"
import {
  buildEdIntakeUrl,
  buildTrtIntakeUrl,
  buildWeightLossIntakeUrl,
} from "@/lib/intake-prefill"
import { SITE_URL } from "@/lib/site-config"
import {
  buildRefillReminderEmail,
  REFILL_REMINDER_SUBJECT,
} from "@/lib/patient-refill-reminder-email"
import { sendPatientEmail } from "@/lib/ses-mail"
import {
  defaultCashPaySupplyDays,
  getReminderDaysAfterFulfillment,
  getSupplyPeriodDays,
  type RefillReminderServiceType,
} from "@/lib/supply-reminder-schedule"

export type RefillReminderSourceType =
  | "order"
  | "weight_loss_intake"
  | "patient_intake"
  | "trt_intake"

export type RefillReminderCandidate = {
  sourceType: RefillReminderSourceType
  sourceId: string
  patientId: string | null
  email: string
  firstName: string
  productLabel: string
  billingPlan: string | null
  serviceType: RefillReminderServiceType
  supplyPeriodDays: number
  reminderDaysAfterFulfillment: number
  supplyCycleStartedAt: string
  reorderUrl: string
}

export type RefillReminderSendResult = {
  sourceType: RefillReminderSourceType
  sourceId: string
  email: string
  success: boolean
  error?: string
}

const PAID_INTAKE_STATUSES = new Set(["captured", "paid_in_person"])

async function ensureReminderColumns(): Promise<void> {
  const alters = [
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS supply_cycle_started_at TIMESTAMPTZ`,
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS refill_reminder_sent_at TIMESTAMPTZ`,
    `ALTER TABLE weight_loss_intake ADD COLUMN IF NOT EXISTS supply_cycle_started_at TIMESTAMPTZ`,
    `ALTER TABLE weight_loss_intake ADD COLUMN IF NOT EXISTS refill_reminder_sent_at TIMESTAMPTZ`,
    `ALTER TABLE patient_intake ADD COLUMN IF NOT EXISTS supply_cycle_started_at TIMESTAMPTZ`,
    `ALTER TABLE patient_intake ADD COLUMN IF NOT EXISTS refill_reminder_sent_at TIMESTAMPTZ`,
    `ALTER TABLE trt_intake ADD COLUMN IF NOT EXISTS supply_cycle_started_at TIMESTAMPTZ`,
    `ALTER TABLE trt_intake ADD COLUMN IF NOT EXISTS refill_reminder_sent_at TIMESTAMPTZ`,
  ]
  for (const statement of alters) {
    await sql(statement, [])
  }
}

function siteUrl(path: string): string {
  return `${SITE_URL.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`
}

function resolveWeightLossDoseTier(detail: {
  selected_dose_tier?: unknown
  additional_concerns?: unknown
}): string {
  const direct = String(detail.selected_dose_tier ?? "").trim()
  if (direct) return direct
  const concerns = String(detail.additional_concerns ?? "")
  const match = concerns.match(/\[selected_dose_tier:([^\]]+)\]/i)
  return match?.[1]?.trim() || "starter"
}

function mapIntakeCandidate(
  row: Record<string, unknown>,
  sourceType: Exclude<RefillReminderSourceType, "order">,
  serviceType: Exclude<RefillReminderServiceType, "order">
): RefillReminderCandidate | null {
  const email = String(row.email || "").trim()
  const supplyCycleStartedAt = row.supply_cycle_started_at
  if (!email || !supplyCycleStartedAt) return null

  const billingPlan = row.selected_billing_plan != null ? String(row.selected_billing_plan) : "monthly"
  const supplyPeriodDays = getSupplyPeriodDays({ serviceType, billingPlan })

  let productLabel = "your medication"
  let reorderUrl = siteUrl("/account?tab=orders")

  if (sourceType === "weight_loss_intake") {
    const program = String(row.selected_program || "semaglutide")
    productLabel = program.includes("tirz") ? "Tirzepatide weight loss" : "Semaglutide weight loss"
    reorderUrl = siteUrl(
      buildWeightLossIntakeUrl(
        program,
        billingPlan,
        resolveWeightLossDoseTier({
          selected_dose_tier: row.selected_dose_tier,
          additional_concerns: row.additional_concerns,
        })
      )
    )
  } else if (sourceType === "patient_intake") {
    const product = String(row.selected_product || "sildenafil-fast")
    productLabel = "men's health medication"
    reorderUrl = siteUrl(buildEdIntakeUrl(product, { plan: billingPlan as "monthly" | "quarterly" | "annual" }))
  } else if (sourceType === "trt_intake") {
    const program = String(row.selected_program || "injectable")
    productLabel = "testosterone replacement therapy"
    reorderUrl = siteUrl(buildTrtIntakeUrl(program, billingPlan))
  }

  return {
    sourceType,
    sourceId: String(row.id),
    patientId: row.patient_id ? String(row.patient_id) : null,
    email,
    firstName: String(row.first_name || ""),
    productLabel,
    billingPlan,
    serviceType,
    supplyPeriodDays,
    reminderDaysAfterFulfillment: getReminderDaysAfterFulfillment(supplyPeriodDays),
    supplyCycleStartedAt: String(supplyCycleStartedAt),
    reorderUrl,
  }
}

async function listIntakeCandidates(
  table: "weight_loss_intake" | "patient_intake" | "trt_intake",
  sourceType: Exclude<RefillReminderSourceType, "order">,
  serviceType: Exclude<RefillReminderServiceType, "order">,
  options?: { sourceIds?: string[]; relaxTiming?: boolean }
): Promise<RefillReminderCandidate[]> {
  const ids = options?.sourceIds?.filter(Boolean)
  const rows = await sql(
    `SELECT id, patient_id, first_name, email, selected_billing_plan,
            selected_program, selected_product, selected_dose_tier, additional_concerns,
            supply_cycle_started_at, payment_status, status
     FROM ${table}
     WHERE refill_reminder_sent_at IS NULL
       AND supply_cycle_started_at IS NOT NULL
       AND payment_status = ANY($1::text[])
       AND status NOT IN ('denied', 'cancelled', 'pending_provider_review', 'follow_up_required')
       AND ($2::text[] IS NULL OR id = ANY($2::text[]))
     ORDER BY supply_cycle_started_at ASC`,
    [Array.from(PAID_INTAKE_STATUSES), ids?.length ? ids : null]
  ).catch(() => [])

  return rows
    .map((row) => mapIntakeCandidate(row as Record<string, unknown>, sourceType, serviceType))
    .filter((c): c is RefillReminderCandidate => c != null)
    .filter((c) => {
      if (options?.relaxTiming) return true
      const started = new Date(c.supplyCycleStartedAt).getTime()
      const dueMs = c.reminderDaysAfterFulfillment * 24 * 60 * 60 * 1000
      return Date.now() >= started + dueMs
    })
}

async function listOrderCandidates(options?: {
  sourceIds?: string[]
  relaxTiming?: boolean
}): Promise<RefillReminderCandidate[]> {
  const ids = options?.sourceIds?.filter(Boolean)
  const rows = await sql(
    `SELECT o.id, o.patient_id, o.status, o.supply_cycle_started_at,
            p.email, p.first_name,
            COALESCE(
              (
                SELECT MAX(COALESCE(m.days_supply, 30) * GREATEST(1, oi.quantity))
                FROM order_items oi
                LEFT JOIN medications m ON LOWER(TRIM(m.name)) = LOWER(TRIM(oi.medication_name))
                WHERE oi.order_id = o.id
              ),
              30
            ) AS order_supply_days
     FROM orders o
     JOIN patients p ON p.id = o.patient_id
     WHERE o.refill_reminder_sent_at IS NULL
       AND o.supply_cycle_started_at IS NOT NULL
       AND o.status IN ('shipped', 'delivered', 'completed')
       AND o.payment_status = 'paid'
       AND p.email IS NOT NULL
       AND TRIM(p.email) <> ''
       AND ($1::uuid[] IS NULL OR o.id = ANY($1::uuid[]))
     ORDER BY o.supply_cycle_started_at ASC`,
    [ids?.length ? ids : null]
  ).catch(() => [])

  const candidates: RefillReminderCandidate[] = []

  for (const row of rows) {
    const orderSupplyDays =
      Number(row.order_supply_days) > 0
        ? Number(row.order_supply_days)
        : defaultCashPaySupplyDays(1)
    const supplyPeriodDays = getSupplyPeriodDays({
      serviceType: "order",
      orderSupplyDays,
    })
    const reminderDays = getReminderDaysAfterFulfillment(supplyPeriodDays)
    const supplyCycleStartedAt = row.supply_cycle_started_at
    if (!supplyCycleStartedAt) continue

    if (!options?.relaxTiming) {
      const started = new Date(String(supplyCycleStartedAt)).getTime()
      if (Date.now() < started + reminderDays * 24 * 60 * 60 * 1000) {
        continue
      }
    }

    candidates.push({
      sourceType: "order",
      sourceId: String(row.id),
      patientId: row.patient_id ? String(row.patient_id) : null,
      email: String(row.email),
      firstName: String(row.first_name || ""),
      productLabel: "your prescription order",
      billingPlan: null,
      serviceType: "order",
      supplyPeriodDays,
      reminderDaysAfterFulfillment: reminderDays,
      supplyCycleStartedAt: String(supplyCycleStartedAt),
      reorderUrl: siteUrl("/prescriptions"),
    })
  }

  return candidates
}

export async function listRefillReminderCandidates(options?: {
  sourceIds?: string[]
  /** When true, send regardless of elapsed supply time (admin test sends). */
  relaxTiming?: boolean
}): Promise<RefillReminderCandidate[]> {
  await ensureReminderColumns()

  const [orders, weightLoss, mensHealth, trt] = await Promise.all([
    listOrderCandidates(options),
    listIntakeCandidates("weight_loss_intake", "weight_loss_intake", "weight_loss", options),
    listIntakeCandidates("patient_intake", "patient_intake", "mens_health", options),
    listIntakeCandidates("trt_intake", "trt_intake", "trt", options),
  ])

  return [...orders, ...weightLoss, ...mensHealth, ...trt].sort(
    (a, b) =>
      new Date(a.supplyCycleStartedAt).getTime() - new Date(b.supplyCycleStartedAt).getTime()
  )
}

async function markReminderSent(candidate: RefillReminderCandidate): Promise<void> {
  const table =
    candidate.sourceType === "order"
      ? "orders"
      : candidate.sourceType === "weight_loss_intake"
        ? "weight_loss_intake"
        : candidate.sourceType === "patient_intake"
          ? "patient_intake"
          : "trt_intake"

  await sql(`UPDATE ${table} SET refill_reminder_sent_at = NOW() WHERE id = $1`, [
    candidate.sourceId,
  ])
}

export async function sendRefillReminderToCandidate(
  candidate: RefillReminderCandidate
): Promise<RefillReminderSendResult> {
  const { text, html } = buildRefillReminderEmail({
    firstName: candidate.firstName,
    productLabel: candidate.productLabel,
    supplyPeriodDays: candidate.supplyPeriodDays,
    reorderUrl: candidate.reorderUrl,
  })

  const result = await sendPatientEmail({
    to: candidate.email,
    subject: REFILL_REMINDER_SUBJECT,
    text,
    html,
  })

  if (result.success) {
    await markReminderSent(candidate)
  }

  return {
    sourceType: candidate.sourceType,
    sourceId: candidate.sourceId,
    email: candidate.email,
    success: result.success,
    error: result.error,
  }
}

export async function sendRefillReminderBatch(options?: {
  sourceIds?: string[]
  dryRun?: boolean
  relaxTiming?: boolean
}): Promise<{
  dryRun: boolean
  eligible: number
  sent: number
  failed: number
  results: RefillReminderSendResult[]
}> {
  const candidates = await listRefillReminderCandidates(options)

  if (options?.dryRun) {
    return {
      dryRun: true,
      eligible: candidates.length,
      sent: 0,
      failed: 0,
      results: candidates.map((c) => ({
        sourceType: c.sourceType,
        sourceId: c.sourceId,
        email: c.email,
        success: true,
      })),
    }
  }

  const results: RefillReminderSendResult[] = []
  for (const candidate of candidates) {
    results.push(await sendRefillReminderToCandidate(candidate))
  }

  return {
    dryRun: false,
    eligible: candidates.length,
    sent: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    results,
  }
}

/** Backfill supply_cycle_started_at for legacy fulfilled records. */
export async function backfillSupplyCycleStartDates(): Promise<void> {
  await ensureReminderColumns()

  await sql(
    `UPDATE orders
     SET supply_cycle_started_at = COALESCE(supply_cycle_started_at, updated_at)
     WHERE status IN ('shipped', 'delivered', 'completed')
       AND payment_status = 'paid'
       AND supply_cycle_started_at IS NULL`,
    []
  )

  for (const table of ["weight_loss_intake", "patient_intake", "trt_intake"] as const) {
    await sql(
      `UPDATE ${table}
       SET supply_cycle_started_at = COALESCE(supply_cycle_started_at, updated_at)
       WHERE payment_status = ANY($1::text[])
         AND status NOT IN ('denied', 'cancelled', 'pending_provider_review')
         AND supply_cycle_started_at IS NULL`,
      [Array.from(PAID_INTAKE_STATUSES)]
    )
  }
}

export async function recordOrderSupplyCycleStart(orderId: string): Promise<void> {
  await ensureReminderColumns()
  await sql(
    `UPDATE orders
     SET supply_cycle_started_at = COALESCE(supply_cycle_started_at, NOW()),
         refill_reminder_sent_at = NULL
     WHERE id = $1`,
    [orderId]
  )
}

export async function recordIntakeSupplyCycleStart(
  table: "weight_loss_intake" | "patient_intake" | "trt_intake",
  intakeId: string,
  options?: { force?: boolean }
): Promise<void> {
  await ensureReminderColumns()
  if (options?.force) {
    await sql(
      `UPDATE ${table}
       SET supply_cycle_started_at = NOW(),
           refill_reminder_sent_at = NULL
       WHERE id = $1`,
      [intakeId]
    )
    return
  }
  await sql(
    `UPDATE ${table}
     SET supply_cycle_started_at = COALESCE(supply_cycle_started_at, NOW())
     WHERE id = $1`,
    [intakeId]
  )
}
