import type { RejuvenationVial } from "@/lib/rejuvenation-vial-catalog"

export type WeightLossBillingPlan = "monthly" | "quarterly"

/** Dose option id, e.g. sema-1mg / tirz-10mg (vial totals; labels show weekly dose). */
export type WeightLossDoseId = string

export const WEIGHT_LOSS_KIT_SUPPLY = "30-day kit · 4 weekly injections"

export const WEIGHT_LOSS_KIT_INJECTIONS_NOTE =
  "Every kit includes 4 once-weekly injections at your selected weekly amount. The price shown is always for the full 30-day kit — not a weekly price and not per injection."

/** Charged only when the provider requires a live visit (waived on quarterly billing). */
export const WEIGHT_LOSS_LIVE_VISIT_ADDON = 25

export type WeightLossKitQuote = {
  kitPrice: number
  /** Kit-only total for the selected billing plan (1 kit or 3-kit shipment). */
  totalBilled: number
  monthlyEquivalent: number
  kitsIncluded: number
  /** $25 on monthly if a live visit is required; $0 on quarterly (waived). */
  liveVisitAddon: number
  /** Max card authorization: kit total + possible live-visit add-on. */
  authorizationHold: number
}

export type WeightLossDoseOption = {
  id: WeightLossDoseId
  /** Once-weekly injection dose patients take (mg). */
  weeklyMg: number
  /** Total vial content for a 30-day kit (typically 4 × weeklyMg). */
  vialMg: number
  /** Short label shown in dropdown, e.g. "0.25 mg weekly" */
  label: string
  /** Supporting line under the label */
  detail: string
  monthlyKitPrice: number
  quarterlyKitPrice: number
}

/** @deprecated Use WeightLossDoseOption — kept for gradual renames in UI helpers */
export type WeightLossDoseTier = WeightLossDoseOption
/** @deprecated Use WeightLossDoseId */
export type WeightLossDoseTierId = WeightLossDoseId

export type WeightLossBillingPlanOption = {
  plan: WeightLossBillingPlan
  badge?: string
}

export type WeightLossProgram = {
  id: string
  name: string
  subtitle: string
  description: string
  features: string[]
  image: { src: string; alt: string }
  supplyLabel: string
  doses: WeightLossDoseOption[]
  /** Alias of doses for older UI helpers */
  doseTiers: WeightLossDoseOption[]
  billingPlans: WeightLossBillingPlanOption[]
}

export const WEIGHT_LOSS_DOSE_PRICING_NOTE =
  "Each 30-day home kit includes 4 once-weekly injections at the weekly amount you select. The listed price is always for the full 30-day kit — not per week or per injection. Intake physician review, compounding, syringes, supplies, and shipping are included. If a live visit is required, a $25 add-on applies on monthly billing and is waived with quarterly supply."

export const WEIGHT_LOSS_LIVE_VISIT_FEE_NOTE =
  "Live visit add-on $25 if your provider requires a live telehealth visit. Waived with quarterly supply."

export const WEIGHT_LOSS_INTAKE_HOLD_NOTE =
  "Your card is authorized for the 30-day kit at the weekly injection amount you select (plus up to $25 on monthly billing if a live visit is required). Quarterly supply waives the live-visit add-on. If your provider changes the prescribed dose, we confirm the exact amount before capture."

export const WEIGHT_LOSS_DOSE_SELECT_TITLE = "1. Choose your weekly injection amount"

export const WEIGHT_LOSS_DOSE_SELECT_HINT =
  "Already on GLP-1? Pick the closest weekly amount. New patients usually start at the lowest option."

export const WEIGHT_LOSS_PRICE_PERIOD_BADGE = "Price is per 30-day kit"

const QUARTERLY_KITS = 3

function quarterlyTotal(kitPrice: number) {
  return kitPrice * QUARTERLY_KITS
}

function q(monthly: number) {
  return Math.round(monthly * 0.9)
}

/** Semaglutide — weekly injection titration (Wegovy-aligned). Vial = 4 weeks. */
const SEMAGLUTIDE_DOSES: WeightLossDoseOption[] = [
  {
    id: "sema-1mg",
    weeklyMg: 0.25,
    vialMg: 1,
    label: "0.25 mg weekly",
    detail: "Starter · 30-day kit (1 mg vial)",
    monthlyKitPrice: 149,
    quarterlyKitPrice: 134,
  },
  {
    id: "sema-2mg",
    weeklyMg: 0.5,
    vialMg: 2,
    label: "0.5 mg weekly",
    detail: "Early titration · 30-day kit (2 mg vial)",
    monthlyKitPrice: 169,
    quarterlyKitPrice: q(169),
  },
  {
    id: "sema-4mg",
    weeklyMg: 1,
    vialMg: 4,
    label: "1 mg weekly",
    detail: "Mid titration · 30-day kit (4 mg vial)",
    monthlyKitPrice: 189,
    quarterlyKitPrice: q(189),
  },
  {
    id: "sema-7mg",
    weeklyMg: 1.7,
    vialMg: 6.8,
    label: "1.7 mg weekly",
    detail: "Higher titration · 30-day kit (6.8 mg vial)",
    monthlyKitPrice: 219,
    quarterlyKitPrice: q(219),
  },
  {
    id: "sema-10mg",
    weeklyMg: 2.4,
    vialMg: 9.6,
    label: "2.4 mg weekly",
    detail: "Maintenance · 30-day kit (9.6 mg vial)",
    monthlyKitPrice: 229,
    quarterlyKitPrice: q(229),
  },
]

/** Tirzepatide — weekly injection titration (Zepbound-aligned). Vial = 4 weeks. */
const TIRZEPATIDE_DOSES: WeightLossDoseOption[] = [
  {
    id: "tirz-10mg",
    weeklyMg: 2.5,
    vialMg: 10,
    label: "2.5 mg weekly",
    detail: "Starter · 30-day kit (10 mg vial)",
    monthlyKitPrice: 159,
    quarterlyKitPrice: 149,
  },
  {
    id: "tirz-20mg",
    weeklyMg: 5,
    vialMg: 20,
    label: "5 mg weekly",
    detail: "Early titration · 30-day kit (20 mg vial)",
    monthlyKitPrice: 229,
    quarterlyKitPrice: q(229),
  },
  {
    id: "tirz-30mg",
    weeklyMg: 7.5,
    vialMg: 30,
    label: "7.5 mg weekly",
    detail: "Mid titration · 30-day kit (30 mg vial)",
    monthlyKitPrice: 259,
    quarterlyKitPrice: q(259),
  },
  {
    id: "tirz-40mg",
    weeklyMg: 10,
    vialMg: 40,
    label: "10 mg weekly",
    detail: "Higher titration · 30-day kit (40 mg vial)",
    monthlyKitPrice: 279,
    quarterlyKitPrice: q(279),
  },
  {
    id: "tirz-50mg",
    weeklyMg: 12.5,
    vialMg: 50,
    label: "12.5 mg weekly",
    detail: "High dose · 30-day kit (50 mg vial)",
    monthlyKitPrice: 299,
    quarterlyKitPrice: q(299),
  },
  {
    id: "tirz-60mg",
    weeklyMg: 15,
    vialMg: 60,
    label: "15 mg weekly",
    detail: "Maintenance · 30-day kit (60 mg vial)",
    monthlyKitPrice: 319,
    quarterlyKitPrice: q(319),
  },
]

export const WEIGHT_LOSS_PROGRAMS: WeightLossProgram[] = [
  {
    id: "semaglutide",
    name: "Semaglutide Program",
    subtitle: "GLP-1 Therapy",
    description:
      "Physician-guided compounded semaglutide with a structured titration schedule tailored to your metabolic goals.",
    features: ["Weekly dosing protocol", "Structured titration", "Ongoing provider oversight", "Pharmacy fulfillment"],
    image: {
      src: "/images/semaglutide-vial.png",
      alt: "Compounded Semaglutide injection vial",
    },
    supplyLabel: WEIGHT_LOSS_KIT_SUPPLY,
    billingPlans: [
      { plan: "monthly" },
      { plan: "quarterly", badge: "Best Value · Live visit fee waived" },
    ],
    doses: SEMAGLUTIDE_DOSES,
    doseTiers: SEMAGLUTIDE_DOSES,
  },
  {
    id: "tirzepatide",
    name: "Tirzepatide Program",
    subtitle: "Dual GLP-1/GIP Therapy",
    description:
      "Advanced dual-pathway therapy for patients who may benefit from combined GLP-1 and GIP receptor activation.",
    features: ["Weekly dosing protocol", "Dual-action support", "Provider-guided titration", "Pharmacy fulfillment"],
    image: {
      src: "/images/tirzepatide-vial.png",
      alt: "Compounded Tirzepatide injection vial",
    },
    supplyLabel: WEIGHT_LOSS_KIT_SUPPLY,
    billingPlans: [
      { plan: "monthly" },
      { plan: "quarterly", badge: "Best Value · Live visit fee waived" },
    ],
    doses: TIRZEPATIDE_DOSES,
    doseTiers: TIRZEPATIDE_DOSES,
  },
]

export function getWeightLossLiveVisitAddon(billingPlan: WeightLossBillingPlan): number {
  return billingPlan === "monthly" ? WEIGHT_LOSS_LIVE_VISIT_ADDON : 0
}

export function getWeightLossProgram(id: string): WeightLossProgram | undefined {
  return WEIGHT_LOSS_PROGRAMS.find((p) => p.id === id)
}

export function getDefaultWeightLossDoseId(program: WeightLossProgram | string): WeightLossDoseId {
  const p = typeof program === "string" ? getWeightLossProgram(program) : program
  return p?.doses[0]?.id ?? "sema-1mg"
}

export function getWeightLossDose(
  program: WeightLossProgram | string,
  doseId: WeightLossDoseId
): WeightLossDoseOption | undefined {
  const p = typeof program === "string" ? getWeightLossProgram(program) : program
  if (!p) return undefined
  const direct = p.doses.find((d) => d.id === doseId)
  if (direct) return direct
  return resolveLegacyDoseId(p, doseId)
}

/** @deprecated Prefer getWeightLossDose */
export function getWeightLossDoseTier(
  program: WeightLossProgram | string,
  tierId: WeightLossDoseId
): WeightLossDoseOption | undefined {
  return getWeightLossDose(program, tierId)
}

/** Map old 3-tier ids, old vial ids, and bare mg strings onto weekly dose options. */
function resolveLegacyDoseId(
  program: WeightLossProgram,
  raw: string
): WeightLossDoseOption | undefined {
  const id = raw.trim().toLowerCase()
  if (id === "starter" || id === "titration" || id === "maintenance") {
    if (id === "starter") return program.doses[0]
    if (id === "titration") return program.doses[Math.min(2, program.doses.length - 1)]
    return program.doses[program.doses.length - 1]
  }

  // Previous tirz vial-total ids → current weekly-aligned options
  const legacyMap: Record<string, string> = {
    "tirz-9mg": "tirz-10mg",
    "tirz-18mg": "tirz-20mg",
    "tirz-27mg": "tirz-30mg",
    "tirz-36mg": "tirz-40mg",
    "tirz-45mg": "tirz-50mg",
    "tirz-54mg": "tirz-60mg",
    "tirz-72mg": "tirz-60mg",
    "tirz-2.5mg": "tirz-10mg",
    "tirz-5mg": "tirz-20mg",
    "tirz-7.5mg": "tirz-30mg",
    "tirz-12.5mg": "tirz-50mg",
    "tirz-15mg": "tirz-60mg",
    "sema-0.25mg": "sema-1mg",
    "sema-0.5mg": "sema-2mg",
    "sema-1.7mg": "sema-7mg",
    "sema-2.4mg": "sema-10mg",
  }
  if (legacyMap[id]) {
    return program.doses.find((d) => d.id === legacyMap[id])
  }

  const mgMatch = id.match(/(\d+(?:\.\d+)?)\s*mg/) || id.match(/^(\d+(?:\.\d+)?)$/)
  if (mgMatch) {
    const mg = Number(mgMatch[1])
    const byWeekly = program.doses.find((d) => d.weeklyMg === mg)
    if (byWeekly) return byWeekly
    const byVial = program.doses.find((d) => d.vialMg === mg)
    if (byVial) return byVial
    // Closest weekly dose at or above stated mg (treat large values as vial totals)
    const weeklyGuess = mg >= 9 ? mg / 4 : mg
    const sorted = [...program.doses].sort((a, b) => a.weeklyMg - b.weeklyMg)
    return sorted.find((d) => d.weeklyMg >= weeklyGuess) ?? sorted[sorted.length - 1]
  }
  return undefined
}

export function isWeightLossDoseId(programId: string, value: string): boolean {
  const program = getWeightLossProgram(programId)
  if (!program) return false
  return Boolean(getWeightLossDose(program, value))
}

/** @deprecated Prefer isWeightLossDoseId with program context */
export function isWeightLossDoseTierId(value: string): boolean {
  return (
    value === "starter" ||
    value === "titration" ||
    value === "maintenance" ||
    WEIGHT_LOSS_PROGRAMS.some((p) => p.doses.some((d) => d.id === value))
  )
}

export function getWeightLossKitQuote(
  program: WeightLossProgram | string,
  doseId: WeightLossDoseId,
  billingPlan: WeightLossBillingPlan
): WeightLossKitQuote | undefined {
  const dose = getWeightLossDose(program, doseId)
  if (!dose) return undefined

  const liveVisitAddon = getWeightLossLiveVisitAddon(billingPlan)

  if (billingPlan === "monthly") {
    const totalBilled = dose.monthlyKitPrice
    return {
      kitPrice: dose.monthlyKitPrice,
      totalBilled,
      monthlyEquivalent: dose.monthlyKitPrice,
      kitsIncluded: 1,
      liveVisitAddon,
      authorizationHold: totalBilled + liveVisitAddon,
    }
  }

  const totalBilled = quarterlyTotal(dose.quarterlyKitPrice)
  return {
    kitPrice: dose.quarterlyKitPrice,
    totalBilled,
    monthlyEquivalent: Math.round(totalBilled / QUARTERLY_KITS),
    kitsIncluded: QUARTERLY_KITS,
    liveVisitAddon,
    authorizationHold: totalBilled + liveVisitAddon,
  }
}

/** First-kit authorization amount at intake for the selected vial strength. */
export function getWeightLossIntakeHoldQuote(
  program: WeightLossProgram | string,
  billingPlan: WeightLossBillingPlan,
  doseId?: WeightLossDoseId
): WeightLossKitQuote | undefined {
  const resolved = doseId || getDefaultWeightLossDoseId(program)
  return getWeightLossKitQuote(program, resolved, billingPlan)
}

export function getWeightLossStartingKitPrice(program: WeightLossProgram | string): number {
  const p = typeof program === "string" ? getWeightLossProgram(program) : program
  return p?.doses[0]?.monthlyKitPrice ?? 0
}

/** Map a patient's stated weekly dose (mg) to the closest catalog option. */
export function suggestWeightLossDoseId(
  programId: string,
  doseMg: number
): WeightLossDoseId {
  const program = getWeightLossProgram(programId)
  if (!program?.doses.length || !Number.isFinite(doseMg) || doseMg <= 0) {
    return getDefaultWeightLossDoseId(programId)
  }

  // Large values are often vial totals; convert to weekly equivalent
  const weeklyGuess = doseMg >= 9 ? doseMg / 4 : doseMg
  const sorted = [...program.doses].sort((a, b) => a.weeklyMg - b.weeklyMg)
  return (sorted.find((d) => d.weeklyMg >= weeklyGuess) ?? sorted[sorted.length - 1]).id
}

/** @deprecated Prefer suggestWeightLossDoseId */
export function suggestWeightLossDoseTier(programId: string, weeklyDoseMg: number): WeightLossDoseId {
  return suggestWeightLossDoseId(programId, weeklyDoseMg)
}

export function parseWeeklyDoseMg(raw: string): number | null {
  const match = raw.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/)
  if (!match) return null
  const n = Number(match[1])
  return Number.isFinite(n) ? n : null
}

export function formatDoseOptionLabel(dose: WeightLossDoseOption, billingPlan: WeightLossBillingPlan): string {
  const price = billingPlan === "monthly" ? dose.monthlyKitPrice : dose.quarterlyKitPrice
  return `${dose.weeklyMg} mg once weekly · $${price} per 30-day kit`
}

export function formatSelectedDoseSummary(
  dose: WeightLossDoseOption,
  billingPlan: WeightLossBillingPlan
): string {
  const price = billingPlan === "monthly" ? dose.monthlyKitPrice : dose.quarterlyKitPrice
  return `Selected dose: ${dose.weeklyMg} mg/week · Kit price: $${price}/mo (4 injections)`
}

export function formatKitPriceCaption(doseLabel: string): string {
  return `/mo · 30-day kit · ${doseLabel}`
}

export function formatKitBillingLabel(billingPlan: WeightLossBillingPlan): string {
  return billingPlan === "monthly"
    ? "Billed monthly per 30-day kit"
    : "Billed per 3-kit shipment (90 days)"
}

/** MIC + B12 skinny shot — sold via weight loss landing; intake uses rejuvenation vial flow. */
export const MIC_B12_WEIGHT_LOSS: RejuvenationVial = {
  id: "mic-skinny",
  title: "MIC + B12 Skinny Shot Homekit",
  price: 119,
  category: "metabolic",
  ingredients: ["Methionine, Inositol & Choline (MIC blend)", "Vitamin B12", "L-Carnitine"],
  supply: "30-day kit · 4 weekly injections",
  route: "Intramuscular self-injection",
  frequency: "Once per week",
  description:
    "Physician-reviewed lipotropic injection kit for metabolic support, energy, and fat metabolism — compounded at Clear Choice Pharmacy.",
  image: {
    src: "/images/mic-b12-vial.png",
    alt: "MIC + B12 lipotropic injection vial",
  },
} satisfies RejuvenationVial & { image: { src: string; alt: string } }

export const MIC_B12_HOW_IT_WORKS = [
  {
    icon: "flask-conical" as const,
    title: "MIC Lipotropic Support",
    description:
      "The MIC blend (Methionine, Inositol, and Choline) supports liver function and helps your body process and mobilize stored fat for energy.",
  },
  {
    icon: "activity" as const,
    title: "B12 for Energy & Metabolism",
    description:
      "Vitamin B12 supports cellular energy production and a healthy metabolism — helping you stay active while working toward weight-loss goals.",
  },
  {
    icon: "scale" as const,
    title: "L-Carnitine Fat Transport",
    description:
      "L-Carnitine helps transport fatty acids into cells where they can be used for fuel, supporting fat metabolism alongside diet and exercise.",
  },
  {
    icon: "shield" as const,
    title: "Weekly Home Injection",
    description:
      "After telehealth review, your 30-day kit (4 weekly injections) ships with syringes, supplies, and instructions for once-weekly self-injection at home.",
  },
]
