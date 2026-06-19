import type { EdBillingPlan } from "@/lib/ed-troche-catalog"

export type EdFormulationAddOn = "oxytocin" | "apomorphine" | "pe"

/** Lowest observed monthly add-on / enhancement pricing online (Mar 2026). */
export const ED_ADD_ON_MARKET_LOW_MONTHLY: Record<EdFormulationAddOn, number> = {
  oxytocin: 29,
  apomorphine: 35,
  pe: 25,
}

/** Our add-on pricing — at least 15% below market low, scaled by billing plan. */
export const ED_ADD_ON_PRICING: Record<
  EdFormulationAddOn,
  Record<EdBillingPlan, { pricePerMonth: number; totalBilled: number }>
> = {
  oxytocin: {
    monthly: { pricePerMonth: 25, totalBilled: 25 },
    quarterly: { pricePerMonth: 22, totalBilled: 66 },
    annual: { pricePerMonth: 17, totalBilled: 204 },
  },
  apomorphine: {
    monthly: { pricePerMonth: 30, totalBilled: 30 },
    quarterly: { pricePerMonth: 26, totalBilled: 78 },
    annual: { pricePerMonth: 20, totalBilled: 240 },
  },
  pe: {
    monthly: { pricePerMonth: 21, totalBilled: 21 },
    quarterly: { pricePerMonth: 18, totalBilled: 54 },
    annual: { pricePerMonth: 14, totalBilled: 168 },
  },
}

export const ED_FORMULATION_ADD_ONS: {
  id: EdFormulationAddOn
  label: string
  description: string
  marketLowMonthly: number
}[] = [
  {
    id: "oxytocin",
    label: "Oxytocin",
    description: "Optional add-on for intimacy and emotional connection support.",
    marketLowMonthly: ED_ADD_ON_MARKET_LOW_MONTHLY.oxytocin,
  },
  {
    id: "apomorphine",
    label: "Apomorphine",
    description: "Optional add-on for low libido and arousal support.",
    marketLowMonthly: ED_ADD_ON_MARKET_LOW_MONTHLY.apomorphine,
  },
  {
    id: "pe",
    label: "PE Support",
    description: "Optional premature ejaculation adjunct blended into your troche.",
    marketLowMonthly: ED_ADD_ON_MARKET_LOW_MONTHLY.pe,
  },
]

const ADD_ON_SET = new Set<string>(ED_FORMULATION_ADD_ONS.map((a) => a.id))

export function parseEdAddOns(param: string | null | undefined): EdFormulationAddOn[] {
  if (!param?.trim()) return []
  return param
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is EdFormulationAddOn => ADD_ON_SET.has(s))
}

export function getEdAddOnPricing(addOn: EdFormulationAddOn, billingPlan: EdBillingPlan) {
  return ED_ADD_ON_PRICING[addOn][billingPlan]
}

export function getEdAddOnMonthlyPrice(addOn: EdFormulationAddOn, billingPlan: EdBillingPlan): number {
  return getEdAddOnPricing(addOn, billingPlan).pricePerMonth
}

export function calculateEdAddOnsMonthlyPrice(
  addOns: EdFormulationAddOn[],
  billingPlan: EdBillingPlan
): number {
  return addOns.reduce((sum, id) => sum + getEdAddOnMonthlyPrice(id, billingPlan), 0)
}

export function calculateEdAddOnsTotalBilled(
  addOns: EdFormulationAddOn[],
  billingPlan: EdBillingPlan
): number {
  return addOns.reduce((sum, id) => sum + getEdAddOnPricing(id, billingPlan).totalBilled, 0)
}

export function formatEdAddOns(addOns: EdFormulationAddOn[]): string {
  if (addOns.length === 0) return "None"
  return addOns
    .map((id) => ED_FORMULATION_ADD_ONS.find((a) => a.id === id)?.label ?? id)
    .join(", ")
}

export function formatEdAddOnsWithPricing(
  addOns: EdFormulationAddOn[],
  billingPlan: EdBillingPlan
): string {
  if (addOns.length === 0) return "None"
  return addOns
    .map((id) => {
      const meta = ED_FORMULATION_ADD_ONS.find((a) => a.id === id)
      const price = getEdAddOnMonthlyPrice(id, billingPlan)
      return `${meta?.label ?? id} (+$${price}/mo)`
    })
    .join(", ")
}
