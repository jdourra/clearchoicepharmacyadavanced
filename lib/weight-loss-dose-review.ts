import {
  formatWeightLossRxQuantity,
  formatWeightLossSupplyFromKitCount,
  getWeightLossDose,
  getWeightLossKitQuote,
  getWeightLossProgram,
  resolveBillingKitCountForPlan,
  WEIGHT_LOSS_MULTI_KIT_COUNT,
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

/**
 * Kits purchased on this intake.
 * Prefer persisted billing_kit_count (audit snapshot). Legacy quarterly rows without
 * a snapshot are treated as 2-kit (prior plan). New quarterly uses current catalog.
 */
export function resolveWeightLossBillingKitCount(detail: Record<string, unknown>): number {
  const raw = detail.billing_kit_count
  const n = typeof raw === "number" ? raw : Number(raw)
  if (Number.isFinite(n) && n > 0) return Math.floor(n)

  const concerns = String(detail.additional_concerns ?? "")
  // After clinician override, current kits are in billing_kit_count; fall through.
  const tagged = concerns.match(/\[billing_kit_count:(\d+)\]/i)
  if (tagged?.[1]) {
    const fromTag = Number(tagged[1])
    if (Number.isFinite(fromTag) && fromTag > 0) return Math.floor(fromTag)
  }

  const plan = resolveWeightLossBillingPlan(detail)
  if (plan === "monthly") return 1
  // Pre-column historical quarterly intakes were sold as 2-kit / 60-day.
  return 2
}

/** Kits the patient originally requested (survives clinician override). */
export function resolvePatientRequestedBillingKitCount(
  detail: Record<string, unknown>
): number {
  const concerns = String(detail.additional_concerns ?? "")
  const requestedTag = concerns.match(/\[patient_requested_billing_kit_count:(\d+)\]/i)
  if (requestedTag?.[1]) {
    const n = Number(requestedTag[1])
    if (Number.isFinite(n) && n > 0) return Math.floor(n)
  }
  return resolveWeightLossBillingKitCount(detail)
}

export function billingPlanFromKitCount(kits: number): WeightLossBillingPlan {
  return kits <= 1 ? "monthly" : "quarterly"
}

export function formatWeightLossBillingTimeframe(
  plan: WeightLossBillingPlan,
  kits?: number
): string {
  if (kits != null && kits > 0) return formatWeightLossSupplyFromKitCount(kits)
  if (plan === "monthly") return "1-month (30-day kit)"
  return formatWeightLossSupplyFromKitCount(WEIGHT_LOSS_MULTI_KIT_COUNT)
}

export type WeightLossChargeSummary = {
  programId: string
  programName: string
  billingPlan: WeightLossBillingPlan
  kitsIncluded: number
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

/** Charge amount for a specific dose + kit count (prescribed or patient snapshot). */
export function getWeightLossChargeSummary(
  detail: Record<string, unknown>,
  doseId?: string,
  kitsOverride?: number
): WeightLossChargeSummary | null {
  const programId = String(detail.selected_program ?? "")
  const program = getWeightLossProgram(programId)
  if (!program) return null

  const kitsIncluded = Math.max(
    1,
    Math.floor(
      Number.isFinite(Number(kitsOverride)) && Number(kitsOverride) > 0
        ? Number(kitsOverride)
        : resolveWeightLossBillingKitCount(detail)
    )
  )
  const billingPlan = billingPlanFromKitCount(kitsIncluded)
  const resolvedDoseId = doseId?.trim() || resolveWeightLossDoseIdFromDetail(detail)
  const dose = getWeightLossDose(programId, resolvedDoseId)
  if (!dose) return null

  const quote = getWeightLossKitQuote(program, dose.id, billingPlan, {
    kitsIncluded,
  })
  if (!quote) return null

  const kitBreakdownLabel =
    kitsIncluded <= 1
      ? `1 × $${quote.kitPrice.toFixed(2)} (30-day kit)`
      : `${kitsIncluded} × $${quote.kitPrice.toFixed(2)} (30-day kits) = $${quote.totalBilled.toFixed(2)}`

  return {
    programId,
    programName: program.name,
    billingPlan,
    kitsIncluded,
    timeframeLabel: formatWeightLossSupplyFromKitCount(kitsIncluded),
    billingTitle: formatWeightLossSupplyFromKitCount(kitsIncluded),
    dose,
    quote,
    chargeCents: Math.round(quote.totalBilled * 100),
    chargeLabel: `$${quote.totalBilled.toFixed(2)}`,
    kitBreakdownLabel,
    liveVisitNote:
      kitsIncluded <= 1 && quote.liveVisitAddon > 0
        ? `Live visit add-on +$${quote.liveVisitAddon.toFixed(2)} only if clinician requires a live visit (not in default pharmacy charge).`
        : kitsIncluded > 1
          ? `Live visit add-on waived on ${formatWeightLossSupplyFromKitCount(kitsIncluded)}.`
          : null,
  }
}

export function suggestWeightLossRxQuantity(
  detail: Record<string, unknown>,
  kitsOverride?: number
): string {
  const kits =
    Number.isFinite(Number(kitsOverride)) && Number(kitsOverride) > 0
      ? Math.floor(Number(kitsOverride))
      : resolveWeightLossBillingKitCount(detail)
  return formatWeightLossRxQuantity(kits)
}

export function snapshotBillingKitCountForNewIntake(
  billingPlan: WeightLossBillingPlan
): number {
  return resolveBillingKitCountForPlan(billingPlan)
}
