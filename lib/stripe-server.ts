import "server-only"
import Stripe from "stripe"

let stripeClient: Stripe | null = null

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured")
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key)
  }
  return stripeClient
}

/** Authorization hold — capture only after provider approval. */
export async function createPaymentHold(params: {
  amountCents: number
  email: string
  metadata?: Record<string, string>
}): Promise<{ paymentIntentId: string; clientSecret: string }> {
  const stripe = getStripe()
  const intent = await stripe.paymentIntents.create({
    amount: params.amountCents,
    currency: "usd",
    capture_method: "manual",
    automatic_payment_methods: { enabled: true },
    receipt_email: params.email,
    metadata: params.metadata ?? {},
  })

  if (!intent.client_secret) {
    throw new Error("Stripe did not return a client secret")
  }

  return {
    paymentIntentId: intent.id,
    clientSecret: intent.client_secret,
  }
}

export async function verifyPaymentHoldReady(paymentIntentId: string): Promise<{
  ok: boolean
  last4?: string | null
  error?: string
}> {
  if (!isStripeConfigured()) {
    if (paymentIntentId.startsWith("dev_mock_")) {
      return { ok: true, last4: "4242" }
    }
    return { ok: false, error: "Payment processing is not configured" }
  }

  const stripe = getStripe()
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId)

  if (intent.status === "requires_capture" || intent.status === "succeeded") {
    const last4 =
      intent.payment_method && typeof intent.payment_method === "object"
        ? intent.payment_method.card?.last4 ?? null
        : null
    return { ok: true, last4 }
  }

  if (intent.status === "requires_payment_method" || intent.status === "requires_confirmation") {
    return { ok: false, error: "Payment authorization is incomplete. Please confirm your card." }
  }

  return { ok: false, error: `Payment is not authorized (status: ${intent.status})` }
}

export async function capturePaymentHold(paymentIntentId: string): Promise<boolean> {
  if (!isStripeConfigured()) return paymentIntentId.startsWith("dev_mock_")
  const stripe = getStripe()
  const intent = await stripe.paymentIntents.capture(paymentIntentId)
  return intent.status === "succeeded"
}
