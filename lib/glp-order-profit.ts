import { requiresSyncVisit } from "@/lib/us-states"
import {
  getWeightLossDose,
  getWeightLossIntakeHoldQuote,
  getWeightLossProgram,
  type WeightLossBillingPlan,
  type WeightLossDoseId,
} from "@/lib/weight-loss-catalog"

/**
 * What Rx Ave charges Clear Choice for one injectable vial (4 weeks).
 * Product price on their sheet. That column says shipping is not included.
 */
const SEMAGLUTIDE_VIAL_COST: Record<string, number> = {
  "0.25": 35,
  "0.5": 42,
  "1": 55,
  "1.7": 60,
  "2.5": 68,
}

const TIRZEPATIDE_VIAL_COST: Record<string, number> = {
  "2.5": 68,
  "5": 80,
  "7.5": 95,
  "10": 110,
  "12.5": 125,
  "15": 145,
}

/**
 * Clinician-network visit fee under 500 visits a month.
 * One-month async $25, live video $45.
 * Three-month async $35, live video $60.
 */
const DOCTOR_FEE = {
  monthlyAsync: 25,
  monthlySync: 45,
  quarterlyAsync: 35,
  quarterlySync: 60,
} as const

export type WeightLossProfit = {
  doseLabel: string
  patientPaid: number
  vialCost: number
  kits: number
  medicationCost: number
  doctorFee: number
  doctorFeeLabel: string
  /** The Rx Ave sheet does not list a shipping price. */
  shippingKnown: false
  profitBeforeShipping: number
  approximatedDose: boolean
  partnerPricing: boolean
}

function money(value: number): number {
  return Math.round(value * 100) / 100
}

function vialCost(programId: string, weeklyMg: number): number | null {
  const table = programId === "tirzepatide" ? TIRZEPATIDE_VIAL_COST : SEMAGLUTIDE_VIAL_COST
  const amount = table[String(weeklyMg)]
  return amount == null ? null : amount
}

export function weightLossOrderProfit(input: {
  programId: string
  doseId: string
  billingPlan: string
  kitCount?: number | null
  state?: string | null
  partnerPricing?: boolean
}): WeightLossProfit | null {
  const program = getWeightLossProgram(input.programId)
  if (!program) return null
  const doseId = input.doseId.trim()
  const dose = getWeightLossDose(program, doseId as WeightLossDoseId)
  if (!dose) return null
  const each = vialCost(program.id, dose.weeklyMg)
  if (each == null) return null

  const plan: WeightLossBillingPlan = input.billingPlan === "quarterly" ? "quarterly" : "monthly"
  const kitsRaw = Number(input.kitCount)
  const quote = getWeightLossIntakeHoldQuote(program, plan, dose.id, {
    kitsIncluded: Number.isFinite(kitsRaw) && kitsRaw > 0 ? Math.floor(kitsRaw) : undefined,
  })
  if (!quote) return null

  const sync = requiresSyncVisit(input.state)
  const doctorFee =
    plan === "quarterly"
      ? sync
        ? DOCTOR_FEE.quarterlySync
        : DOCTOR_FEE.quarterlyAsync
      : sync
        ? DOCTOR_FEE.monthlySync
        : DOCTOR_FEE.monthlyAsync
  const doctorFeeLabel =
    plan === "quarterly"
      ? sync
        ? "Live video visit, 3-month supply"
        : "3-month visit"
      : sync
        ? "Live video visit, one month"
        : "One-month visit"

  const medicationCost = money(each * quote.kitsIncluded)
  const patientPaid = money(quote.totalBilled)
  return {
    doseLabel: dose.label,
    patientPaid,
    vialCost: each,
    kits: quote.kitsIncluded,
    medicationCost,
    doctorFee,
    doctorFeeLabel,
    shippingKnown: false,
    profitBeforeShipping: money(patientPaid - medicationCost - doctorFee),
    approximatedDose: !program.doses.some((item) => item.id === doseId),
    partnerPricing: input.partnerPricing !== false,
  }
}
