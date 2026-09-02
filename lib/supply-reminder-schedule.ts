/** Days before supply runs out to send the refill reminder email. */
export const REFILL_REMINDER_LEAD_DAYS = 7

export type RefillReminderServiceType = "order" | "weight_loss" | "mens_health" | "trt"

/** Four-week month used for 1-month kit cycles (reminder at day 21). */
export const ONE_MONTH_SUPPLY_DAYS = 28

/** Eight-week cycle for weight-loss 60-day / 2-kit supply (reminder at week 7). */
export const TWO_MONTH_SUPPLY_DAYS = 56

const DEFAULT_CASH_PAY_DAYS_SUPPLY = 30

/**
 * Total supply period in days for one fulfillment cycle.
 * Reminder fires at: supplyPeriodDays - REFILL_REMINDER_LEAD_DAYS.
 */
export function getSupplyPeriodDays(params: {
  serviceType: RefillReminderServiceType
  billingPlan?: string | null
  /** Cash-pay: days_supply × quantity (already computed). */
  orderSupplyDays?: number | null
}): number {
  const plan = String(params.billingPlan || "monthly").toLowerCase()

  if (params.serviceType === "weight_loss" && plan === "quarterly") {
    return TWO_MONTH_SUPPLY_DAYS
  }

  if (params.orderSupplyDays != null && params.orderSupplyDays > 0) {
    return params.orderSupplyDays
  }

  // ED, TRT, weight-loss monthly, and default cash-pay unit counts → ~1 month.
  return ONE_MONTH_SUPPLY_DAYS
}

export function getReminderDaysAfterFulfillment(supplyPeriodDays: number): number {
  return Math.max(0, supplyPeriodDays - REFILL_REMINDER_LEAD_DAYS)
}

export function formatSupplyLabel(supplyPeriodDays: number): string {
  if (supplyPeriodDays >= TWO_MONTH_SUPPLY_DAYS) {
    return "2-month supply"
  }
  if (supplyPeriodDays >= ONE_MONTH_SUPPLY_DAYS) {
    return "1-month supply"
  }
  return `${supplyPeriodDays}-day supply`
}

export function defaultCashPaySupplyDays(quantity: number): number {
  const qty = Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1
  return qty * DEFAULT_CASH_PAY_DAYS_SUPPLY
}
