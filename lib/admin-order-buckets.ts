import type { Order } from "@/lib/auth-types"
import { isOrderPaid } from "@/lib/order-payment"

/** Order statuses counted in the admin dashboard "Completed" bucket and ?status=completed filter. */
export const COMPLETED_ORDER_STATUSES = ["ready", "shipped", "delivered"] as const

/** Orders shown in the default admin work queue (pending through ready). */
export const ACTIVE_ORDER_STATUSES = ["pending", "pending_rx", "processing", "ready"] as const

/** Statuses that remove an order from the active work queue after processing. */
export const QUEUE_EXIT_STATUSES = ["shipped", "delivered", "cancelled"] as const

export const ADMIN_ORDERS_QUEUE_PATH = "/admin/orders"

export const CANCELLED_ORDER_STATUS = "cancelled"

export function isCompletedOrderStatus(status: string): boolean {
  return (COMPLETED_ORDER_STATUSES as readonly string[]).includes(status)
}

export function isActiveOrderStatus(status: string): boolean {
  return (ACTIVE_ORDER_STATUSES as readonly string[]).includes(status)
}

export function exitsActiveQueue(status: string): boolean {
  return (QUEUE_EXIT_STATUSES as readonly string[]).includes(status)
}

export function isCancelledOrderStatus(status: string): boolean {
  return status === CANCELLED_ORDER_STATUS
}

/** Paid catalog orders that can be marked processing and emailed. */
export function canMarkCatalogOrderProcessing(order: {
  status: string
  payment_status?: string | null
}): boolean {
  return (
    isOrderPaid({ payment_status: order.payment_status ?? "" } as Order) &&
    (order.status === "pending" ||
      order.status === "pending_rx" ||
      order.status === "processing" ||
      order.status === "ready")
  )
}

/** Paid catalog orders the pharmacy can mark shipped (processing or ready). */
export function canMarkCatalogOrderShipped(order: {
  status: string
  payment_status?: string | null
}): boolean {
  return (
    isOrderPaid({ payment_status: order.payment_status ?? "" } as Order) &&
    (order.status === "processing" || order.status === "ready")
  )
}

type CatalogMoneyOrder = {
  status: string
  payment_status?: string | null
  total_amount?: number | null
}

/** Paid catalog order that was not cancelled. This is the only revenue bucket. */
export function isSoldCatalogOrder(order: CatalogMoneyOrder): boolean {
  return !isCancelledOrderStatus(order.status) && order.payment_status === "paid"
}

/**
 * Open catalog order with no payment. Shipped and delivered stay in those
 * tiles even when payment was never recorded.
 */
export function isUnpaidCatalogOrder(order: CatalogMoneyOrder): boolean {
  if (isCancelledOrderStatus(order.status)) return false
  if (order.status === "shipped" || order.status === "delivered") return false
  return order.payment_status !== "paid"
}

/** Paid orders packed or in progress and not yet marked shipped. */
export function isReadyToShipCatalogOrder(order: CatalogMoneyOrder): boolean {
  return order.payment_status === "paid" && (order.status === "processing" || order.status === "ready")
}

export function soldCatalogRevenue(orders: CatalogMoneyOrder[]): number {
  return orders.reduce((sum, order) => {
    if (!isSoldCatalogOrder(order)) return sum
    return sum + (Number(order.total_amount) || 0)
  }, 0)
}
