const CLOSED_INTAKE_STATUSES = new Set([
  "cancelled",
  "provider_denied",
  "shipped",
  "completed",
  "dispatched",
])

const PAID_INTAKE_STATUSES = new Set(["captured", "paid_in_person", "paid"])

/** Why an administrator cannot cancel this intake, or null when cancel is allowed. */
export function intakeCancelBlockReason(
  status: string | null | undefined,
  paymentStatus: string | null | undefined
): string | null {
  const current = String(status || "")
  const payment = String(paymentStatus || "")
  if (current === "cancelled") return "This intake is already cancelled."
  if (CLOSED_INTAKE_STATUSES.has(current)) {
    return "This intake is already closed. Cancel is available before it ships."
  }
  if (PAID_INTAKE_STATUSES.has(payment)) {
    return "Payment was already collected. Cancel is available before payment."
  }
  return null
}
