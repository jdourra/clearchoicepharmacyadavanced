const PAID_INTAKE_STATUSES = new Set(["captured", "paid_in_person", "paid"])

/** Why an administrator cannot cancel this intake, or null when cancel is allowed. */
export function intakeCancelBlockReason(
  status: string | null | undefined,
  paymentStatus: string | null | undefined
): string | null {
  const current = String(status || "")
  const payment = String(paymentStatus || "")
  if (current === "cancelled") return "This intake is already cancelled."
  if (PAID_INTAKE_STATUSES.has(payment)) {
    return "Payment was already collected. Cancel unpaid orders when the patient changes their mind or does not pay."
  }
  return null
}
