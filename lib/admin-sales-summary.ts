import "server-only"
import { sql } from "@/lib/db"
import { calculateEdTotalBilled, type EdBillingPlan } from "@/lib/ed-troche-catalog"
import { getTrtPrice, type TrtBillingPlan } from "@/lib/trt-catalog"
import {
  getWeightLossIntakeHoldQuote,
  type WeightLossBillingPlan,
  type WeightLossDoseId,
} from "@/lib/weight-loss-catalog"

export type AdminSalesSummary = {
  waitingAmount: number
  waitingCount: number
  paidAmount: number
  paidCount: number
  shippedAmount: number
  shippedCount: number
  missedAmount: number
  missedCount: number
}

const SHIPPED = new Set(["shipped", "delivered", "dispatched", "completed"])
const CLOSED = new Set(["provider_denied", "denied"])

const PAID_INTAKE = new Set(["captured", "paid_in_person", "paid"])

function dollars(value: unknown): number {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount <= 0) return 0
  return Math.round(amount * 100) / 100
}

function isCancelled(status: unknown): boolean {
  const value = String(status ?? "").toLowerCase()
  return value === "cancelled" || value === "canceled"
}

function isPaidIntake(status: unknown): boolean {
  return PAID_INTAKE.has(String(status ?? "").toLowerCase())
}

async function readRows(query: string): Promise<Record<string, unknown>[]> {
  try {
    return await sql(query)
  } catch {
    return []
  }
}

function weightLossAmount(row: Record<string, unknown>): number {
  const plan: WeightLossBillingPlan =
    row.selected_billing_plan === "quarterly" ? "quarterly" : "monthly"
  const dose = String(row.selected_dose_tier ?? "").trim()
  const kits = Number(row.billing_kit_count)
  const quote = getWeightLossIntakeHoldQuote(
    String(row.selected_program ?? ""),
    plan,
    dose ? (dose as WeightLossDoseId) : undefined,
    { kitsIncluded: Number.isFinite(kits) && kits > 0 ? Math.floor(kits) : undefined }
  )
  return dollars(quote?.totalBilled)
}

function trtAmount(row: Record<string, unknown>): number {
  const plan: TrtBillingPlan = row.selected_billing_plan === "quarterly" ? "quarterly" : "monthly"
  return dollars(getTrtPrice(String(row.selected_program ?? ""), plan)?.totalBilled)
}

function edAmount(row: Record<string, unknown>): number {
  const raw = String(row.selected_billing_plan ?? "")
  const plan: EdBillingPlan =
    raw === "quarterly" || raw === "annual" || raw === "monthly" ? raw : "monthly"
  return dollars(calculateEdTotalBilled(String(row.selected_product ?? ""), plan))
}

/**
 * Three steps for every open sale: waiting for payment, paid (not shipped), or shipped.
 * Delivered counts as shipped. Cancelled sales are missed opportunity.
 */
export async function getAdminSalesSummary(): Promise<AdminSalesSummary> {
  const summary: AdminSalesSummary = {
    waitingAmount: 0,
    waitingCount: 0,
    paidAmount: 0,
    paidCount: 0,
    shippedAmount: 0,
    shippedCount: 0,
    missedAmount: 0,
    missedCount: 0,
  }

  const add = (status: unknown, paid: boolean, amount: number) => {
    if (isCancelled(status)) {
      summary.missedCount += 1
      summary.missedAmount += amount
      return
    }
    const normalized = String(status ?? "").toLowerCase()
    if (CLOSED.has(normalized)) return
    if (SHIPPED.has(normalized)) {
      summary.shippedCount += 1
      summary.shippedAmount += amount
      return
    }
    if (paid) {
      summary.paidCount += 1
      summary.paidAmount += amount
      return
    }
    summary.waitingCount += 1
    summary.waitingAmount += amount
  }

  const catalog = await readRows(`SELECT status, payment_status, total_amount FROM orders`)
  for (const row of catalog) {
    add(row.status, String(row.payment_status ?? "") === "paid", dollars(row.total_amount))
  }

  let weightLoss = await readRows(
    `SELECT status, payment_status, selected_program, selected_billing_plan, selected_dose_tier, billing_kit_count
     FROM weight_loss_intake`
  )
  if (weightLoss.length === 0) {
    weightLoss = await readRows(
      `SELECT status, payment_status, selected_program, selected_billing_plan, selected_dose_tier
       FROM weight_loss_intake`
    )
  }
  for (const row of weightLoss) add(row.status, isPaidIntake(row.payment_status), weightLossAmount(row))

  const trt = await readRows(
    `SELECT status, payment_status, selected_program, selected_billing_plan FROM trt_intake`
  )
  for (const row of trt) add(row.status, isPaidIntake(row.payment_status), trtAmount(row))

  const ed = await readRows(
    `SELECT status, payment_status, selected_product, selected_billing_plan FROM patient_intake`
  )
  for (const row of ed) add(row.status, isPaidIntake(row.payment_status), edAmount(row))

  const vials = await readRows(`SELECT status, payment_status, kit_price FROM rejuvenation_vial_intakes`)
  for (const row of vials) add(row.status, isPaidIntake(row.payment_status), dollars(row.kit_price))

  const iv = await readRows(`SELECT status, payment_status, estimated_total FROM iv_booking_requests`)
  for (const row of iv) add(row.status, isPaidIntake(row.payment_status), dollars(row.estimated_total))

  const rx = await readRows(
    `SELECT status, payment_status, total_amount FROM prescription_telemedicine_intake`
  )
  for (const row of rx) add(row.status, isPaidIntake(row.payment_status), dollars(row.total_amount))

  const specialty = await readRows(`SELECT status, payment_status FROM specialty_intake`)
  for (const row of specialty) add(row.status, isPaidIntake(row.payment_status), 0)

  summary.waitingAmount = Math.round(summary.waitingAmount * 100) / 100
  summary.paidAmount = Math.round(summary.paidAmount * 100) / 100
  summary.shippedAmount = Math.round(summary.shippedAmount * 100) / 100
  summary.missedAmount = Math.round(summary.missedAmount * 100) / 100
  return summary
}
