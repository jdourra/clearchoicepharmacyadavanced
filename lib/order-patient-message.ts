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

• Pay now on your phone (secure card payment):
  ${payUrl}

• Wait for our pharmacy to call you to collect payment — no action needed. We'll use the phone number on your account.`
}

/** Short message optimized for email/SMS with a direct mobile payment link. */
export function buildMobilePayLinkMessage(
  order: Order,
  overrideAmount?: string,
  baseUrl?: string
): string {
  const root = resolveMessageBaseUrl(baseUrl)
  const payUrl = `${root}/account/orders/${order.id}/pay`
  const total = formatCurrency(resolveOrderTotal(order, overrideAmount))
  const orderRef = order.order_number || order.id

  return `Hi,

Please complete payment for order #${orderRef} so we can process your prescription.

Pay on your phone (${total}):
${payUrl}

Open the link above on your phone to pay securely by card. Once payment is received, we'll continue processing your order.

Questions? Call us at ${PHARMACY_PHONE}.

Clear Choice Pharmacy`
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

export function buildMissingPrescriptionInfoMessage(
  order: Order,
  prescription: { method: string },
  baseUrl?: string
): string {
  const root = resolveMessageBaseUrl(baseUrl)
  const orderRef = order.order_number || order.id
  let action = "Please reply with the information we need so we can continue processing your order."

  switch (prescription.method) {
    case "upload":
      action = `Please upload a clear photo or PDF of your prescription for order #${orderRef}. You can upload it from your account order page or reply to this email with the file attached.`
      break
    case "transfer":
      action = `Please provide the pharmacy name, phone number, and prescription (RX) number(s) for your transfer request on order #${orderRef}.`
      break
    case "eprescribe":
      action = `Please provide your prescribing doctor's name and office phone number so we can follow up on the e-prescription for order #${orderRef}.`
      break
    case "telemedicine":
      action = `Please complete your telemedicine intake so our physician can review your request for order #${orderRef}.`
      break
    default:
      action = `Please contact us with your prescription details for order #${orderRef}.`
  }

  return `Hello,

We're ready to help with order #${orderRef}, but we still need prescription information before we can process it.

${action}

View your order: ${root}/account/orders/${order.id}

Questions? Call us at ${PHARMACY_PHONE}.

Thank you,
Clear Choice Pharmacy`
}
