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

/** True when an order is counted in one of the dashboard stat buckets. */
export function isDashboardBucketOrderStatus(status: string): boolean {
  return (
    status === "pending" ||
    status === "processing" ||
    isCompletedOrderStatus(status) ||
    isCancelledOrderStatus(status)
  )
}
