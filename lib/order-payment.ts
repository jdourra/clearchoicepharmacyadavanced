import type { Order } from "@/lib/auth-types"

export type OrderCheckoutLineItem = {
  name: string
  quantity: number
  amountCents: number
}

function lineItemCost(item: Order["items"][number]): number {
  return Number(item.price) || 0
}

function resolveOrderTotal(order: Order, overrideAmount?: string): number {
  const parsed = overrideAmount != null && overrideAmount.trim() !== "" ? parseFloat(overrideAmount) : NaN
  if (!Number.isNaN(parsed)) return parsed
  if (order.total_amount) return order.total_amount
  return order.items.reduce((sum, item) => sum + lineItemCost(item), 0)
}

export function isOrderPaid(order: Order): boolean {
  return order.payment_status === "paid"
}

export function buildCheckoutLineItems(order: Order, overrideAmount?: string): OrderCheckoutLineItem[] {
  const items: OrderCheckoutLineItem[] = order.items.map((item) => ({
    name: item.drug_name,
    quantity: 1,
    amountCents: Math.round((Number(item.price) || 0) * 100),
  }))

  const itemSumCents = items.reduce((sum, item) => sum + item.amountCents * item.quantity, 0)
  const totalCents = Math.round(resolveOrderTotal(order, overrideAmount) * 100)
  const remainder = totalCents - itemSumCents

  if (remainder > 0) {
    items.push({
      name: "Delivery & fees",
      quantity: 1,
      amountCents: remainder,
    })
  }

  if (items.length === 0 && totalCents > 0) {
    items.push({
      name: `Order ${order.order_number}`,
      quantity: 1,
      amountCents: totalCents,
    })
  }

  return items.filter((item) => item.amountCents > 0)
}

export function getOrderPayPath(orderId: string): string {
  return `/account/orders/${orderId}/pay`
}

export function getOrderPayUrl(orderId: string, baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}${getOrderPayPath(orderId)}`
}
