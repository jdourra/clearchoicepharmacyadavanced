export type TrtBillingPlan = "monthly" | "quarterly"

export type TrtProgram = {
  id: string
  name: string
  subtitle: string
  description: string
  dosage: string
  frequency: string
  features: string[]
  pricing: {
    plan: TrtBillingPlan
    pricePerMonth: number
    totalBilled: number
    badge?: string
  }[]
  highlight?: string
}

/** Competitive cash-pay TRT pricing — includes physician review, medication, supplies, and shipping. */
export const TRT_PROGRAMS: TrtProgram[] = [
  {
    id: "testosterone-cypionate",
    name: "Testosterone Cypionate",
    subtitle: "Injectable TRT",
    description:
      "Physician-supervised testosterone replacement with weekly self-injection. Includes syringes, alcohol pads, and step-by-step guidance.",
    dosage: "Custom titrated strength",
    frequency: "Typically 1 injection per week",
    features: [
      "Most common TRT protocol",
      "Steady testosterone levels",
      "30-day supply shipped cold",
      "Ongoing lab monitoring guidance",
    ],
    pricing: [
      { plan: "monthly", pricePerMonth: 129, totalBilled: 129 },
      { plan: "quarterly", pricePerMonth: 109, totalBilled: 327, badge: "Best Value" },
    ],
    highlight: "Most popular",
  },
  {
    id: "testosterone-cream",
    name: "Testosterone Cream",
    subtitle: "Topical TRT",
    description:
      "Daily topical testosterone for patients who prefer a needle-free option. Compounded for consistent absorption.",
    dosage: "Custom compounded strength",
    frequency: "Once daily",
    features: [
      "No injections required",
      "Easy daily application",
      "Discreet pharmacy fulfillment",
      "Provider-guided dosing",
    ],
    pricing: [
      { plan: "monthly", pricePerMonth: 149, totalBilled: 149 },
      { plan: "quarterly", pricePerMonth: 129, totalBilled: 387, badge: "Best Value" },
    ],
  },
  {
    id: "enclomiphene",
    name: "Enclomiphene",
    subtitle: "Oral testosterone support",
    description:
      "Oral therapy that stimulates your body’s natural testosterone production—often chosen by men who want to preserve fertility.",
    dosage: "Provider-determined oral protocol",
    frequency: "Daily",
    features: [
      "Non-injectable option",
      "May support natural T production",
      "Often used when fertility is a concern",
      "Transparent monthly pricing",
    ],
    pricing: [
      { plan: "monthly", pricePerMonth: 99, totalBilled: 99 },
      { plan: "quarterly", pricePerMonth: 79, totalBilled: 237, badge: "Best Value" },
    ],
  },
]

export function getTrtProgram(id: string): TrtProgram | undefined {
  return TRT_PROGRAMS.find((p) => p.id === id)
}

export function getTrtPrice(programId: string, plan: TrtBillingPlan) {
  const program = getTrtProgram(programId)
  return program?.pricing.find((p) => p.plan === plan)
}
