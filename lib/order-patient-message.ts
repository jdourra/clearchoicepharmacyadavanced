import type { Order, OrderItem } from "@/lib/auth-types"
import { SITE_URL } from "@/lib/site-config"

const PHARMACY_PHONE = "(248) 987-6182"

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`
}

function lineItemCost(item: OrderItem): number {
  return Number(item.price) || 0
}

export function formatOrderMedicationList(items: OrderItem[]): string {
  if (!items.length) return "  (No medications listed)"

  return items
    .map((item) => {
      const cost = lineItemCost(item)
      return `  • ${item.drug_name} — Qty ${item.quantity} — ${formatCurrency(cost)}`
    })
    .join("\n")
}

export function resolveOrderTotal(order: Order, overrideAmount?: string): number {
  const parsed = overrideAmount != null && overrideAmount.trim() !== "" ? parseFloat(overrideAmount) : NaN
  if (!Number.isNaN(parsed)) return parsed
  if (order.total_amount) return order.total_amount
  return order.items.reduce((sum, item) => sum + lineItemCost(item), 0)
}

export function buildMedicationCostSummary(order: Order, overrideAmount?: string): string {
  const lines = formatOrderMedicationList(order.items)
  const total = formatCurrency(resolveOrderTotal(order, overrideAmount))
  return `Your medications:\n${lines}\n\nTotal: ${total}`
}

export function resolveMessageBaseUrl(baseUrl?: string): string {
  if (baseUrl) return baseUrl.replace(/\/$/, "")
  if (typeof window !== "undefined") return window.location.origin
  return SITE_URL.replace(/\/$/, "")
}

export function buildPaymentOptionsText(orderId: string, baseUrl?: string): string {
  const root = resolveMessageBaseUrl(baseUrl)
  const payUrl = `${root}/account/orders/${orderId}/pay`
  return `Choose how to pay:

• Pay now for faster processing (secure card payment):
  ${payUrl}

• Wait for our pharmacy to call you to collect payment — no action needed. We'll use the phone number on your account.`
}

export function buildPrescriptionReadyMessage(
  order: Order,
  overrideAmount?: string,
  baseUrl?: string
): string {
  const summary = buildMedicationCostSummary(order, overrideAmount)
  const paymentOptions = buildPaymentOptionsText(order.id, baseUrl)
  return `Your prescription is ready!

${summary}

${paymentOptions}

Questions? Call us at ${PHARMACY_PHONE}.`
}

export function buildPaymentRequestMessage(
  order: Order,
  overrideAmount?: string,
  baseUrl?: string
): string {
  const summary = buildMedicationCostSummary(order, overrideAmount)
  const paymentOptions = buildPaymentOptionsText(order.id, baseUrl)
  return `Payment request for Order #${order.order_number || order.id}.

${summary}

${paymentOptions}

Questions? Call us at ${PHARMACY_PHONE}.`
}
