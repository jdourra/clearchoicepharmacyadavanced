import "server-only"
import { sql } from "@/lib/db"
import { notifyClinicianQueue } from "@/lib/telehealth/manual-queue"
import {
  APPROVED_INTAKE_STATUSES,
  PENDING_INTAKE_STATUSES,
} from "@/lib/telehealth/intake-registry"
import { STANDARD_INTAKE_STATUS } from "@/lib/telehealth/intake-status"
import { getWeightLossDose, getWeightLossProgram } from "@/lib/weight-loss-catalog"
import {
  formatWeightLossDoseLabel,
  resolveWeightLossDoseIdFromDetail,
  weightLossDrugName,
} from "@/lib/weight-loss-dose-review"
import { SITE_URL } from "@/lib/site-config"

const PAID_PAYMENT_STATUSES = new Set(["captured", "paid_in_person", "paid"])
const BLOCKED_REORDER_STATUSES = new Set(["provider_denied", "cancelled"])

export function weightLossReorderSummary(row: {
  selected_program?: unknown
  selected_dose_tier?: unknown
  additional_concerns?: unknown
  selected_billing_plan?: unknown
}): string {
  const programId = String(row.selected_program ?? "")
  const program = getWeightLossProgram(programId)
  const dose = getWeightLossDose(programId, resolveWeightLossDoseIdFromDetail(row))
  const medication = program?.name || weightLossDrugName(programId)
  const doseLabel = dose ? formatWeightLossDoseLabel(dose) : ""
  const plan = String(row.selected_billing_plan ?? "")
  const planLabel = plan === "quarterly" ? "90-day supply" : plan === "monthly" ? "Monthly supply" : ""
  return [medication, doseLabel, planLabel].filter(Boolean).join(" · ")
}

export function canPatientReorderWeightLoss(status: string, paymentStatus: string | null | undefined): boolean {
  if (BLOCKED_REORDER_STATUSES.has(status)) return false
  if ((PENDING_INTAKE_STATUSES as readonly string[]).includes(status)) return false
  if ((APPROVED_INTAKE_STATUSES as readonly string[]).includes(status)) return true
  return PAID_PAYMENT_STATUSES.has(String(paymentStatus || ""))
}

function reorderNote(sourceId: string, note: string, previousConcerns: string): string {
  const patientNote = note.trim() || "(No note — patient requested the same medication and dose.)"
  const parts = [
    "PATIENT REORDER",
    `Previous order: ${sourceId}`,
    "",
    "Note for the physician:",
    patientNote,
  ]
  if (previousConcerns.trim()) {
    parts.push("", "--- Previous intake notes ---", previousConcerns.trim())
  }
  return parts.join("\n")
}

export async function createWeightLossReorder(params: {
  patientId: string
  email: string
  sourceIntakeId: string
  note: string
}): Promise<{ id: string; summary: string }> {
  const email = params.email.trim().toLowerCase()
  const sourceId = params.sourceIntakeId.trim()
  if (!sourceId) {
    throw new Error("Choose the order you want to reorder.")
  }
  if (params.note.trim().length > 2000) {
    throw new Error("Please keep the note under 2000 characters.")
  }

  await sql(`ALTER TABLE weight_loss_intake ADD COLUMN IF NOT EXISTS reorder_of_id TEXT`, []).catch(() => [])
  await sql(`ALTER TABLE weight_loss_intake ADD COLUMN IF NOT EXISTS billing_kit_count INTEGER`, []).catch(() => [])
  await sql(`ALTER TABLE weight_loss_intake ADD COLUMN IF NOT EXISTS billing_supply_label TEXT`, []).catch(() => [])
  await sql(`ALTER TABLE weight_loss_intake ADD COLUMN IF NOT EXISTS selected_dose_tier TEXT`, []).catch(() => [])

  const sources = await sql(
    `SELECT *
     FROM weight_loss_intake
     WHERE id = $1
       AND (patient_id = $2 OR LOWER(email) = $3)`,
    [sourceId, params.patientId, email]
  )
  const source = sources[0] as Record<string, unknown> | undefined
  if (!source) {
    throw new Error("That order was not found on your account.")
  }

  const status = String(source.status || "")
  const paymentStatus = source.payment_status != null ? String(source.payment_status) : ""
  if (!canPatientReorderWeightLoss(status, paymentStatus)) {
    throw new Error("This order is not ready to reorder yet.")
  }

  const programId = String(source.selected_program || "")
  const pending = await sql(
    `SELECT id
     FROM weight_loss_intake
     WHERE (patient_id = $1 OR LOWER(email) = $2)
       AND selected_program = $3
       AND status = ANY($4::text[])
     LIMIT 1`,
    [params.patientId, email, programId, [...PENDING_INTAKE_STATUSES]]
  )
  if (pending.length > 0) {
    throw new Error("A reorder for this medication is already waiting for the clinician.")
  }

  const submissionId = `CCR-WL-${Date.now().toString(36).toUpperCase()}`
  const concerns = reorderNote(sourceId, params.note, String(source.additional_concerns ?? ""))
  const summary = weightLossReorderSummary(source)

  const inserted = await sql(
    `INSERT INTO weight_loss_intake (
      id, first_name, last_name, email, phone, date_of_birth, state, address, city, zip_code,
      height_inches, weight_lbs, bmi, goal_weight_lbs, systolic_bp, diastolic_bp,
      pregnant_or_breastfeeding, mtc_or_men2_history, pancreatitis_history, type1_diabetes,
      eating_disorder, on_other_glp,
      type2_diabetes, hypertension, gallbladder_disease, diabetic_retinopathy, bariatric_surgery,
      sleep_apnea, cardiovascular_disease, current_medications, allergies,
      selected_program, selected_billing_plan, selected_dose_tier, prior_glp_experience,
      weight_loss_goals, comorbidities, additional_concerns,
      shipping_address, shipping_city, shipping_state, shipping_zip,
      status, stripe_payment_intent_id, id_front_key, id_back_key, partner_name, partner_status,
      patient_id, payment_status, billing_kit_count, billing_supply_label, reorder_of_id
    )
    SELECT
      $1, first_name, last_name, email, phone, date_of_birth, state, address, city, zip_code,
      height_inches, weight_lbs, bmi, goal_weight_lbs, systolic_bp, diastolic_bp,
      pregnant_or_breastfeeding, mtc_or_men2_history, pancreatitis_history, type1_diabetes,
      eating_disorder, on_other_glp,
      type2_diabetes, hypertension, gallbladder_disease, diabetic_retinopathy, bariatric_surgery,
      sleep_apnea, cardiovascular_disease, current_medications, allergies,
      selected_program, selected_billing_plan, selected_dose_tier, prior_glp_experience,
      weight_loss_goals, comorbidities, $2,
      shipping_address, shipping_city, shipping_state, shipping_zip,
      $3, NULL, id_front_key, id_back_key, COALESCE(partner_name, 'manual'), $4,
      COALESCE(patient_id, $5), $6, billing_kit_count, billing_supply_label, id
    FROM weight_loss_intake
    WHERE id = $7
    RETURNING id`,
    [
      submissionId,
      concerns,
      STANDARD_INTAKE_STATUS.pending,
      "queued_for_manual_review",
      params.patientId,
      "awaiting_pharmacy",
      sourceId,
    ]
  )

  if (inserted.length === 0) {
    throw new Error("Could not submit the reorder.")
  }

  const patientName = [source.first_name, source.last_name].filter(Boolean).join(" ") || email
  const noteLine = params.note.trim() || "(No note — same medication and dose.)"
  await notifyClinicianQueue({
    submissionId,
    subject: `GLP reorder — ${patientName}`,
    body: [
      "A patient reordered their GLP medication from the patient portal.",
      "They did not fill out a new intake. Clinical history was copied from the previous order.",
      "",
      `Patient: ${patientName}`,
      `Email: ${email}`,
      `Medication: ${summary}`,
      `Previous order: ${sourceId}`,
      `New order: ${submissionId}`,
      "",
      "Note for the physician:",
      noteLine,
      "",
      `Review: ${SITE_URL}/admin/intakes/weight_loss/${submissionId}`,
    ].join("\n"),
  }).catch((err) => console.error("[glp-reorder] notify failed:", err))

  return { id: submissionId, summary }
}
