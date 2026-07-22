import type { EdTrocheProduct, EdBillingPlan } from "@/lib/ed-troche-catalog"
import type { WeightLossProgram } from "@/lib/weight-loss-catalog"
import { IV_TRAVEL_FEE } from "@/lib/iv-catalog"

/** Troche count per 30-day supply — used for transparent $/dose display. */
export const ED_DOSES_PER_SUPPLY: Record<string, number> = {
  "sildenafil-fast": 10,
  "tadalafil-daily": 30,
  "combination-troche": 10,
}

export function getEdDosesPerSupply(productId: string): number {
  return ED_DOSES_PER_SUPPLY[productId] ?? 10
}

export function getEdPricePerDose(pricePerMonth: number, productId: string): number {
  const doses = getEdDosesPerSupply(productId)
  return Math.round((pricePerMonth / doses) * 100) / 100
}

export function formatUsd(amount: number, digits = 0): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

export function getWeightLossQuarterlySavingsPercent(program: WeightLossProgram): number {
  const starter = program.doses[0]
  if (!starter || starter.monthlyKitPrice <= 0) return 0
  const saved = starter.monthlyKitPrice - starter.quarterlyKitPrice
  return Math.round((saved / starter.monthlyKitPrice) * 100)
}

export function getWeightLossPriceRange(program: WeightLossProgram): {
  fromMonthly: number
  toMonthly: number
  fromQuarterly: number
  toQuarterly: number
} {
  const monthly = program.doses.map((t) => t.monthlyKitPrice)
  const quarterly = program.doses.map((t) => t.quarterlyKitPrice)
  return {
    fromMonthly: Math.min(...monthly),
    toMonthly: Math.max(...monthly),
    fromQuarterly: Math.min(...quarterly),
    toQuarterly: Math.max(...quarterly),
  }
}

export function getIvVisitTotal(dripPrice: number): number {
  return dripPrice + IV_TRAVEL_FEE
}

export const ALL_IN_INCLUSIONS = {
  weightLoss: [
    "Physician review",
    "Compounded medication",
    "4 weekly injections per kit",
    "Syringes & supplies",
    "Michigan shipping or pickup",
  ],
  ed: [
    "Physician review",
    "Compounded sublingual troches",
    "Discreet packaging",
    "Michigan shipping or pickup",
  ],
  trt: [
    "Physician review",
    "Medication & supplies",
    "Transparent cash-pay billing",
    "Michigan shipping or pickup",
  ],
  iv: [
    "Pharmacy-formulated drip",
    "Licensed RN administration",
    "Clinical intake review",
    `$${IV_TRAVEL_FEE} flat Metro Detroit dispatch`,
  ],
} as const

export function getBestEdPlan(product: EdTrocheProduct): {
  plan: EdBillingPlan
  pricePerMonth: number
  pricePerDose: number
} {
  const preferred =
    product.pricing.find((p) => p.badge === "Best Seller" || p.badge === "Best Value") ||
    product.pricing.find((p) => p.plan === "quarterly") ||
    product.pricing[0]
  const pricePerMonth = preferred?.pricePerMonth ?? 0
  return {
    plan: preferred?.plan ?? "quarterly",
    pricePerMonth,
    pricePerDose: getEdPricePerDose(pricePerMonth, product.id),
  }
}
