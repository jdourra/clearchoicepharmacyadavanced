import type { RejuvenationVial } from "@/lib/rejuvenation-vial-catalog"

export type WeightLossBillingPlan = "monthly" | "quarterly"

export type WeightLossDoseTierId = "starter" | "titration" | "maintenance"

export const WEIGHT_LOSS_KIT_SUPPLY = "30-day kit · 4 weekly injections"

export const WEIGHT_LOSS_KIT_INJECTIONS_NOTE =
  "Every kit includes 4 once-weekly injections. Kit price reflects your prescribed dose strength — not the number of injections."

export type WeightLossKitQuote = {
  kitPrice: number
  totalBilled: number
  monthlyEquivalent: number
  kitsIncluded: number
}

export type WeightLossDoseTier = {
  id: WeightLossDoseTierId
  name: string
  doseBand: string
  monthlyKitPrice: number
  quarterlyKitPrice: number
}

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
  doseTiers: WeightLossDoseTier[]
  billingPlans: WeightLossBillingPlanOption[]
}

export const WEIGHT_LOSS_DOSE_PRICING_NOTE =
  "Each 30-day home kit includes 4 weekly injections and is priced by your prescribed dose strength. Your provider sets the dose; you pay for that kit — physician review, compounding, syringes, supplies, and shipping included. Refills adjust to your current dose tier."

export const WEIGHT_LOSS_INTAKE_HOLD_NOTE =
  "Your card is authorized for your first kit at the starter dose tier. If your provider prescribes a different tier, we confirm the exact amount before capture."

const QUARTERLY_KITS = 3

function quarterlyTotal(kitPrice: number) {
  return kitPrice * QUARTERLY_KITS
}

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
      { plan: "quarterly", badge: "Best Value" },
    ],
    doseTiers: [
      {
        id: "starter",
        name: "Starter",
        doseBand: "Introductory weekly dose (titration weeks 1–4)",
        monthlyKitPrice: 149,
        quarterlyKitPrice: 134,
      },
      {
        id: "titration",
        name: "Titration",
        doseBand: "Mid-range weekly dose (escalation phase)",
        monthlyKitPrice: 199,
        quarterlyKitPrice: 179,
      },
      {
        id: "maintenance",
        name: "Maintenance",
        doseBand: "Target weekly dose (maintenance phase)",
        monthlyKitPrice: 249,
        quarterlyKitPrice: 224,
      },
    ],
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
      { plan: "quarterly", badge: "Best Value" },
    ],
    doseTiers: [
      {
        id: "starter",
        name: "Starter",
        doseBand: "Introductory weekly dose (titration weeks 1–4)",
        monthlyKitPrice: 199,
        quarterlyKitPrice: 179,
      },
      {
        id: "titration",
        name: "Titration",
        doseBand: "Mid-range weekly dose (escalation phase)",
        monthlyKitPrice: 269,
        quarterlyKitPrice: 242,
      },
      {
        id: "maintenance",
        name: "Maintenance",
        doseBand: "Target weekly dose (maintenance phase)",
        monthlyKitPrice: 339,
        quarterlyKitPrice: 305,
      },
    ],
  },
]

export function getWeightLossProgram(id: string): WeightLossProgram | undefined {
  return WEIGHT_LOSS_PROGRAMS.find((p) => p.id === id)
}

export function getWeightLossDoseTier(
  program: WeightLossProgram | string,
  tierId: WeightLossDoseTierId
): WeightLossDoseTier | undefined {
  const p = typeof program === "string" ? getWeightLossProgram(program) : program
  return p?.doseTiers.find((t) => t.id === tierId)
}

export function getWeightLossKitQuote(
  program: WeightLossProgram | string,
  tierId: WeightLossDoseTierId,
  billingPlan: WeightLossBillingPlan
): WeightLossKitQuote | undefined {
  const tier = getWeightLossDoseTier(program, tierId)
  if (!tier) return undefined

  if (billingPlan === "monthly") {
    return {
      kitPrice: tier.monthlyKitPrice,
      totalBilled: tier.monthlyKitPrice,
      monthlyEquivalent: tier.monthlyKitPrice,
      kitsIncluded: 1,
    }
  }

  const totalBilled = quarterlyTotal(tier.quarterlyKitPrice)
  return {
    kitPrice: tier.quarterlyKitPrice,
    totalBilled,
    monthlyEquivalent: Math.round(totalBilled / QUARTERLY_KITS),
    kitsIncluded: QUARTERLY_KITS,
  }
}

/** First-kit authorization amount at intake (starter dose tier). */
export function getWeightLossIntakeHoldQuote(
  program: WeightLossProgram | string,
  billingPlan: WeightLossBillingPlan
): WeightLossKitQuote | undefined {
  return getWeightLossKitQuote(program, "starter", billingPlan)
}

export function getWeightLossStartingKitPrice(program: WeightLossProgram | string): number {
  const tier = getWeightLossDoseTier(program, "starter")
  return tier?.monthlyKitPrice ?? 0
}

export function formatKitBillingLabel(billingPlan: WeightLossBillingPlan): string {
  return billingPlan === "monthly" ? "Billed per kit, monthly" : "Billed per 3-kit shipment (90 days)"
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
