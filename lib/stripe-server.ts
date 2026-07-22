import "server-only"
import Stripe from "stripe"
import type { OrderCheckoutLineItem } from "@/lib/order-payment"
import { getStripeSecretKey, isStripeConfigured } from "@/lib/stripe-env"

export { isStripeConfigured } from "@/lib/stripe-env"

let stripeClient: Stripe | null = null

export function getStripe(): Stripe {
  const key = getStripeSecretKey()
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

export async function capturePaymentHold(
  paymentIntentId: string,
  amountCents?: number
): Promise<boolean> {
  if (!isStripeConfigured()) return paymentIntentId.startsWith("dev_mock_")
  const stripe = getStripe()
  const intent = await stripe.paymentIntents.capture(
    paymentIntentId,
    amountCents != null && amountCents > 0 ? { amount_to_capture: amountCents } : undefined
  )
  return intent.status === "succeeded"
}

/** Release an uncaptured authorization hold after provider denial. */
export async function cancelPaymentHold(paymentIntentId: string): Promise<boolean> {
  if (!isStripeConfigured()) return paymentIntentId.startsWith("dev_mock_")
  const stripe = getStripe()
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId)
  if (intent.status === "canceled") return true
  if (intent.status === "succeeded") return false
  const cancelled = await stripe.paymentIntents.cancel(paymentIntentId)
  return cancelled.status === "canceled"
}

/** Immediate capture for prescription order checkout. */
export async function createOrderCheckoutSession(params: {
  orderId: string
  orderNumber: string
  email: string
  lineItems: OrderCheckoutLineItem[]
  successUrl: string
  cancelUrl: string
}): Promise<{ sessionId: string; url: string }> {
  const stripe = getStripe()
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: params.email,
    line_items: params.lineItems.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "usd",
        unit_amount: item.amountCents,
        product_data: { name: item.name },
      },
    })),
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      order_id: params.orderId,
      order_number: params.orderNumber,
      payment_type: "prescription_order",
    },
  })

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL")
  }

  return { sessionId: session.id, url: session.url }
}

export async function retrieveCheckoutSession(sessionId: string) {
  const stripe = getStripe()
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent"],
  })
}

export function getPaymentIntentIdFromSession(
  session: Stripe.Checkout.Session
): string | null {
  if (!session.payment_intent) return null
  if (typeof session.payment_intent === "string") return session.payment_intent
  return session.payment_intent.id
}
