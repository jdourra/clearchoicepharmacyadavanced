import {
  formatWeightLossBillingPlanTitle,
  getWeightLossDose,
  getWeightLossKitQuote,
  getWeightLossProgram,
  type WeightLossBillingPlan,
  type WeightLossDoseId,
  type WeightLossDoseOption,
  type WeightLossKitQuote,
} from "@/lib/weight-loss-catalog"

/** Current dose on the intake record (prescribed after clinician override, else patient pick). */
export function resolveWeightLossDoseIdFromDetail(
  detail: Record<string, unknown>
): WeightLossDoseId {
  const programId = String(detail.selected_program ?? "")
  const direct = String(detail.selected_dose_tier ?? "").trim()
  if (direct) {
    const dose = getWeightLossDose(programId, direct)
    if (dose) return dose.id
  }
  const concerns = String(detail.additional_concerns ?? "")
  const match = concerns.match(/\[selected_dose_tier:([^\]]+)\]/i)
  if (match?.[1]) {
    const dose = getWeightLossDose(programId, match[1].trim())
    if (dose) return dose.id
  }
  return getWeightLossDose(programId, "starter")?.id ?? "sema-1mg"
}

/** Dose the patient originally requested (survives clinician override via audit tag). */
export function resolvePatientRequestedWeightLossDoseId(
  detail: Record<string, unknown>
): WeightLossDoseId {
  const programId = String(detail.selected_program ?? "")
  const concerns = String(detail.additional_concerns ?? "")
  const requestedTag = concerns.match(/\[patient_requested_dose_tier:([^\]]+)\]/i)
  if (requestedTag?.[1]) {
    const dose = getWeightLossDose(programId, requestedTag[1].trim())
    if (dose) return dose.id
  }
  return resolveWeightLossDoseIdFromDetail(detail)
}

export function getPatientRequestedWeightLossDose(
  detail: Record<string, unknown>
): WeightLossDoseOption | undefined {
  const programId = String(detail.selected_program ?? "")
  return getWeightLossDose(programId, resolvePatientRequestedWeightLossDoseId(detail))
}

export function formatWeightLossDoseStrength(dose: WeightLossDoseOption): string {
  return `${dose.weeklyMg} mg weekly (${dose.vialMg} mg / 30-day vial)`
}

export function formatWeightLossDoseLabel(dose: WeightLossDoseOption): string {
  return `${dose.label} · ${dose.detail}`
}

export function weightLossDrugName(programId: string): string {
  return programId === "tirzepatide"
    ? "Compounded Tirzepatide injection"
    : "Compounded Semaglutide injection"
}

export function listWeightLossDosesForProgram(programId: string): WeightLossDoseOption[] {
  return getWeightLossProgram(programId)?.doses ?? []
}

/** True when intake suggests GLP-naive / first exposure (starter guidance). */
export function isLikelyGlpNaive(detail: Record<string, unknown>): boolean {
  const prior = String(detail.prior_glp_experience ?? "").toLowerCase()
  const onOther = detail.on_other_glp
  if (onOther === true || onOther === "true" || onOther === "yes") return false
  if (!prior.trim()) return true
  if (
    /never|none|no\b|first.?time|naive|not been|haven't|havent|new to/i.test(prior)
  ) {
    return true
  }
  return false
}

export function resolveWeightLossBillingPlan(
  detail: Record<string, unknown>
): WeightLossBillingPlan {
  return detail.selected_billing_plan === "quarterly" ? "quarterly" : "monthly"
}

export function formatWeightLossBillingTimeframe(plan: WeightLossBillingPlan): string {
  return plan === "monthly" ? "1-month (30-day kit)" : "60-day (2-kit / quarterly price)"
}

export type WeightLossChargeSummary = {
  programId: string
  programName: string
  billingPlan: WeightLossBillingPlan
  timeframeLabel: string
  billingTitle: string
  dose: WeightLossDoseOption
  quote: WeightLossKitQuote
  /** Kit total pharmacy should collect (no live-visit add-on unless included). */
  chargeCents: number
  chargeLabel: string
  kitBreakdownLabel: string
  liveVisitNote: string | null
}

/** Charge amount for a specific dose + the intake billing plan. */
export function getWeightLossChargeSummary(
  detail: Record<string, unknown>,
  doseId?: string
): WeightLossChargeSummary | null {
  const programId = String(detail.selected_program ?? "")
  const program = getWeightLossProgram(programId)
  if (!program) return null

  const billingPlan = resolveWeightLossBillingPlan(detail)
  const resolvedDoseId = doseId?.trim() || resolveWeightLossDoseIdFromDetail(detail)
  const dose = getWeightLossDose(programId, resolvedDoseId)
  if (!dose) return null

  const quote = getWeightLossKitQuote(program, dose.id, billingPlan)
  if (!quote) return null

  const kitBreakdownLabel =
    billingPlan === "monthly"
      ? `1 × $${quote.kitPrice.toFixed(2)} (30-day kit)`
      : `2 × $${quote.kitPrice.toFixed(2)} (30-day kits) = $${quote.totalBilled.toFixed(2)}`

  return {
    programId,
    programName: program.name,
    billingPlan,
    timeframeLabel: formatWeightLossBillingTimeframe(billingPlan),
    billingTitle: formatWeightLossBillingPlanTitle(billingPlan),
    dose,
    quote,
    chargeCents: Math.round(quote.totalBilled * 100),
    chargeLabel: `$${quote.totalBilled.toFixed(2)}`,
    kitBreakdownLabel,
    liveVisitNote:
      billingPlan === "monthly" && quote.liveVisitAddon > 0
        ? `Live visit add-on +$${quote.liveVisitAddon.toFixed(2)} only if clinician requires a live visit (not in default pharmacy charge).`
        : billingPlan === "quarterly"
          ? "Live visit add-on waived on 60-day (2-kit) plan."
          : null,
  }
}
