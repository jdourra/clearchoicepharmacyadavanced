import { isOrderPaid } from "@/lib/order-payment"
import { intakeCancelBlockReason } from "@/lib/intake-cancel-rules"

export function canAdminCancelCatalogOrder(order: {
  status: string
  payment_status: string
}): boolean {
  if (order.status === "cancelled") return false
  return !isOrderPaid(order)
}

export function canAdminCancelIntake(
  status: string | null | undefined,
  paymentStatus: string | null | undefined
): boolean {
  return intakeCancelBlockReason(status, paymentStatus) == null
}
