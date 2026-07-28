export type BalanceRequestStatus = "pending" | "paid" | "cancelled" | "expired"

export type PatientBalanceRequest = {
  id: string
  patientId: string
  amountCents: number
  amount: number
  description: string
  status: BalanceRequestStatus | string
  paymentUrl: string | null
  emailedTo: string | null
  stripeCheckoutSessionId: string | null
  stripePaymentIntentId: string | null
  paidAt: string | null
  createdAt: string
}

export type PatientLedgerEntry = {
  id: string
  patientId: string
  amountCents: number
  amount: number
  source: string
  sourceId: string | null
  note: string | null
  stripePaymentIntentId: string | null
  createdAt: string
}
