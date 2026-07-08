import type { Order } from "@/lib/auth-types"
import { isActiveOrderStatus } from "@/lib/admin-order-buckets"

/** Orders that can be selected for batch processing (active work queue only). */
export function isOrderBatchSelectable(order: Order): boolean {
  return isActiveOrderStatus(order.status)
}

export function buildBatchProcessUrl(customerId: string, orderIds: string[]): string {
  const unique = [...new Set(orderIds)].filter(Boolean)
  if (unique.length === 0) return `/admin/customers/${customerId}`
  return `/admin/customers/${customerId}/process?orders=${unique.join(",")}`
}
