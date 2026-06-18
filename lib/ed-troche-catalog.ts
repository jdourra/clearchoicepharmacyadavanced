export type EdBillingPlan = "monthly" | "quarterly" | "annual"

export type EdTrocheProduct = {
  id: string
  name: string
  subtitle: string
  description: string
  dosage: string
  frequency: string
  features: string[]
  highlight?: string
  pricing: {
    plan: EdBillingPlan
    pricePerMonth: number
    totalBilled: number
    badge?: "Best Seller" | "Best Value"
  }[]
}

/** All ED troche formulations — one card per option (TRT-style picker). */
export const ED_FORMULATIONS: EdTrocheProduct[] = [
  {
    id: "sildenafil-fast",
    name: "Sildenafil",
    subtitle: "Fast-Acting Troche",
    description:
      "Rapid-onset sublingual troche for on-demand use. Dissolves under the tongue for faster absorption than swallowed pills.",
    dosage: "50mg or 100mg",
    frequency: "As needed, 30–60 min before activity",
    features: ["Works in 15–30 minutes", "Lasts 4–6 hours", "Unaffected by food", "Take as needed"],
    pricing: [
      { plan: "monthly", pricePerMonth: 69, totalBilled: 69 },
      { plan: "quarterly", pricePerMonth: 39, totalBilled: 117, badge: "Best Seller" },
      { plan: "annual", pricePerMonth: 29, totalBilled: 348 },
    ],
  },
  {
    id: "tadalafil-daily",
    name: "Tadalafil",
    subtitle: "Extended-Duration Troche",
    description:
      "Long-window sublingual troche for continuous readiness—up to 36 hours of support without timing pressure.",
    dosage: "5mg or 10mg",
    frequency: "As needed or daily",
    features: ["Up to 36-hour window", "Great for spontaneity", "Can take daily", "Unaffected by food"],
    pricing: [
      { plan: "monthly", pricePerMonth: 79, totalBilled: 79 },
      { plan: "quarterly", pricePerMonth: 49, totalBilled: 147 },
      { plan: "annual", pricePerMonth: 34, totalBilled: 408 },
    ],
  },
  {
    id: "combination-troche",
    name: "Sildenafil + Tadalafil",
    subtitle: "Dual-Action Combination",
    description:
      "Dual-action troche combining fast Sildenafil onset with extended Tadalafil duration in one compounded lozenge.",
    dosage: "Custom compounded strengths",
    frequency: "As directed by physician",
    features: ["Fast onset + long duration", "Dual PDE5 action", "Physician-customized", "Pharmacy compounded"],
    pricing: [
      { plan: "monthly", pricePerMonth: 89, totalBilled: 89 },
      { plan: "quarterly", pricePerMonth: 65, totalBilled: 195 },
      { plan: "annual", pricePerMonth: 49, totalBilled: 588, badge: "Best Value" },
    ],
  },
  {
    id: "combination-pe-troche",
    name: "Premature Ejaculation Combination",
    subtitle: "Custom PE Support Troche",
    description:
      "Physician-customized combination troches for premature ejaculation—pairing PDE5 support with PE-focused adjunct ingredients.",
    dosage: "Custom compounded",
    frequency: "As directed by physician",
    features: [
      "Built for premature ejaculation",
      "Combination therapy—not single-ingredient only",
      "Sublingual compounded delivery",
      "Tailored by your provider",
    ],
    highlight: "PE support",
    pricing: [
      { plan: "monthly", pricePerMonth: 95, totalBilled: 95 },
      { plan: "quarterly", pricePerMonth: 69, totalBilled: 207, badge: "Best Seller" },
      { plan: "annual", pricePerMonth: 55, totalBilled: 660, badge: "Best Value" },
    ],
  },
  {
    id: "apomorphine-troche",
    name: "Apomorphine",
    subtitle: "Low Libido Troche",
    description:
      "Compounded sublingual troche selected when low libido and arousal support are the primary concern. Physician-guided dosing.",
    dosage: "Custom compounded",
    frequency: "As directed by physician",
    features: [
      "Focused on low libido support",
      "Sublingual compounded delivery",
      "Discreet pharmacy fulfillment",
      "Provider-guided protocol",
    ],
    highlight: "Low libido",
    pricing: [
      { plan: "monthly", pricePerMonth: 89, totalBilled: 89 },
      { plan: "quarterly", pricePerMonth: 69, totalBilled: 207 },
      { plan: "annual", pricePerMonth: 59, totalBilled: 708 },
    ],
  },
  {
    id: "oxytocin-troche",
    name: "Oxytocin",
    subtitle: "Low Libido & Connection Troche",
    description:
      "Compounded sublingual troche for patients seeking low libido support with an emphasis on emotional connection and intimacy.",
    dosage: "Custom compounded",
    frequency: "As directed by physician",
    features: [
      "Low libido & connection support",
      "Sublingual compounded delivery",
      "Private telehealth review",
      "Discreet shipping",
    ],
    highlight: "Low libido",
    pricing: [
      { plan: "monthly", pricePerMonth: 85, totalBilled: 85 },
      { plan: "quarterly", pricePerMonth: 65, totalBilled: 195 },
      { plan: "annual", pricePerMonth: 55, totalBilled: 660 },
    ],
  },
]

/** @deprecated Use ED_FORMULATIONS */
export const ALL_ED_TROCHES = ED_FORMULATIONS

export function getEdTrocheProduct(id: string): EdTrocheProduct | undefined {
  return ED_FORMULATIONS.find((p) => p.id === id)
}

export function getEdPricing(productId: string, billingPlan: EdBillingPlan) {
  return getEdTrocheProduct(productId)?.pricing.find((p) => p.plan === billingPlan)
}

export function calculateEdMonthlyPrice(productId: string, billingPlan: EdBillingPlan): number {
  return getEdPricing(productId, billingPlan)?.pricePerMonth ?? 0
}

export function calculateEdTotalBilled(productId: string, billingPlan: EdBillingPlan): number {
  return getEdPricing(productId, billingPlan)?.totalBilled ?? 0
}

export const ED_PRODUCT_LABELS: Record<string, string> = {
  "sildenafil-fast": "Sildenafil Fast-Acting Troches",
  "tadalafil-daily": "Tadalafil Extended-Duration Troches",
  "combination-troche": "Sildenafil + Tadalafil Combination Troches",
  "combination-pe-troche": "Premature Ejaculation Combination Troches",
  "apomorphine-troche": "Apomorphine Low Libido Troches",
  "oxytocin-troche": "Oxytocin Low Libido Troches",
}
