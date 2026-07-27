export type IntakePaymentStatus =
  | "none"
  | "authorized"
  | "captured"
  | "released"
  | "failed"

export type IntakePatientIdentity = {
  email: string
  firstName: string
  lastName: string
  phone?: string | null
  dateOfBirth?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zip?: string | null
  /** Existing logged-in patient id, if any */
  sessionPatientId?: string | null
}

export function paymentStatusFromHold(
  stripePaymentIntentId: string | null | undefined
): IntakePaymentStatus {
  if (!stripePaymentIntentId?.trim()) return "none"
  return "authorized"
}

export function formatPaymentStatus(status: string | null | undefined): string {
  switch (status) {
    case "authorized":
      return "Authorized (hold)"
    case "captured":
      return "Paid (captured)"
    case "released":
      return "Hold released"
    case "failed":
      return "Payment failed"
    case "none":
      return "No payment"
    default:
      return status?.trim() ? status : "Unknown"
  }
}
