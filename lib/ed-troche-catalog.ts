import type { EdFormulationAddOn } from "@/lib/ed-add-ons"
import {
  calculateEdAddOnsMonthlyPrice,
  calculateEdAddOnsTotalBilled,
  ED_FORMULATION_ADD_ONS,
  getEdAddOnPricing,
} from "@/lib/ed-add-ons"

export type EdBillingPlan = "monthly" | "quarterly" | "annual"

export type EdTrocheProduct = {
  id: string
  name: string
  subtitle: string
  description: string
  dosage: string
  frequency: string
  supplyLabel: string
  features: string[]
  highlight?: string
  image: { src: string; alt: string }
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
    supplyLabel: "30-day supply · 10 sublingual troches",
    features: ["Works in 15–30 minutes", "Lasts 4–6 hours", "Unaffected by food", "Take as needed"],
    image: {
      src: "/images/sildenafil-troches.png",
      alt: "Clear Choice Pharmacy Sildenafil troches blister pack",
    },
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
    supplyLabel: "30-day supply · 30 sublingual troches",
    features: ["Up to 36-hour window", "Great for spontaneity", "Can take daily", "Unaffected by food"],
    image: {
      src: "/images/tadalafil-troches.png",
      alt: "Clear Choice Pharmacy Tadalafil troches blister pack",
    },
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
    supplyLabel: "30-day supply · 10 sublingual troches",
    features: ["Fast onset + long duration", "Dual PDE5 action", "Physician-customized", "Pharmacy compounded"],
    image: {
      src: "/images/combination-troches.png",
      alt: "Clear Choice Pharmacy combination Sildenafil and Tadalafil troches blister pack",
    },
    pricing: [
      { plan: "monthly", pricePerMonth: 89, totalBilled: 89 },
      { plan: "quarterly", pricePerMonth: 65, totalBilled: 195 },
      { plan: "annual", pricePerMonth: 49, totalBilled: 588, badge: "Best Value" },
    ],
  },
]

/** @deprecated Use ED_FORMULATIONS */
export const ALL_ED_TROCHES = ED_FORMULATIONS

export function getEdTrocheProduct(id: string): EdTrocheProduct | undefined {
  return ED_FORMULATIONS.find((p) => p.id === id)
}

export const ED_PRODUCT_IDS = ED_FORMULATIONS.map((p) => p.id)

export function isEdProductId(value: string): value is (typeof ED_PRODUCT_IDS)[number] {
  return ED_PRODUCT_IDS.includes(value as (typeof ED_PRODUCT_IDS)[number])
}

/** Headline “from” price uses the lowest listed plan (usually quarterly/annual). */
export function getEdStartingMonthlyPrice(product: EdTrocheProduct | string): number {
  const p = typeof product === "string" ? getEdTrocheProduct(product) : product
  if (!p || p.pricing.length === 0) return 0
  return Math.min(...p.pricing.map((tier) => tier.pricePerMonth))
}

export function formatEdBillingLabel(plan: EdBillingPlan): string {
  if (plan === "monthly") return "Billed monthly"
  if (plan === "quarterly") return "Billed every 3 months"
  return "Billed annually"
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

export type EdOrderPricing = {
  baseMonthly: number
  baseTotalBilled: number
  addOnMonthly: number
  addOnTotalBilled: number
  pricePerMonth: number
  totalBilled: number
  addOnLineItems: {
    id: EdFormulationAddOn
    label: string
    pricePerMonth: number
    totalBilled: number
  }[]
}

export function calculateEdOrderPricing(
  productId: string,
  billingPlan: EdBillingPlan,
  addOns: EdFormulationAddOn[] = []
): EdOrderPricing {
  const baseMonthly = calculateEdMonthlyPrice(productId, billingPlan)
  const baseTotalBilled = calculateEdTotalBilled(productId, billingPlan)
  const addOnMonthly = calculateEdAddOnsMonthlyPrice(addOns, billingPlan)
  const addOnTotalBilled = calculateEdAddOnsTotalBilled(addOns, billingPlan)

  return {
    baseMonthly,
    baseTotalBilled,
    addOnMonthly,
    addOnTotalBilled,
    pricePerMonth: baseMonthly + addOnMonthly,
    totalBilled: baseTotalBilled + addOnTotalBilled,
    addOnLineItems: addOns.map((id) => {
      const pricing = getEdAddOnPricing(id, billingPlan)
      const label = ED_FORMULATION_ADD_ONS.find((a) => a.id === id)?.label ?? id
      return { id, label, ...pricing }
    }),
  }
}

export const ED_PRODUCT_LABELS: Record<string, string> = {
  "sildenafil-fast": "Sildenafil Fast-Acting Troches",
  "tadalafil-daily": "Tadalafil Extended-Duration Troches",
  "combination-troche": "Sildenafil + Tadalafil Combination Troches",
}
