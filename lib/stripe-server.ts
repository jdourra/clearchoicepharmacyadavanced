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

export type CaptureHoldResult = {
  ok: boolean
  /** Money was already taken on an earlier attempt. Do not capture again. */
  alreadyCaptured?: boolean
  amountReceivedCents?: number
  error?: string
}

function holdAlreadyPaid(intent: { status: string; amount_received: number }): boolean {
  return intent.status === "succeeded" && intent.amount_received > 0
}

/**
 * Capture an approval hold. A lower amount releases the unused remainder, and Stripe
 * will reject a second capture. If that already happened, treat the earlier charge as paid.
 */
export async function capturePaymentHold(
  paymentIntentId: string,
  amountCents?: number
): Promise<CaptureHoldResult> {
  if (!isStripeConfigured()) {
    return { ok: paymentIntentId.startsWith("dev_mock_") }
  }
  const stripe = getStripe()
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId)

  if (holdAlreadyPaid(intent)) {
    return {
      ok: true,
      alreadyCaptured: true,
      amountReceivedCents: intent.amount_received,
    }
  }

  if (intent.status !== "requires_capture" || intent.amount_capturable <= 0) {
    return {
      ok: false,
      error:
        "The card hold was released and nothing was charged. Collect payment at the pharmacy.",
    }
  }

  const capturable = intent.amount_capturable
  const requested =
    amountCents != null && amountCents > 0 ? Math.min(amountCents, capturable) : capturable
  const partial = requested < capturable

  try {
    const captured = await stripe.paymentIntents.capture(
      paymentIntentId,
      partial ? { amount_to_capture: requested } : undefined
    )
    return {
      ok: captured.status === "succeeded",
      amountReceivedCents: captured.amount_received,
      error: captured.status === "succeeded" ? undefined : "Stripe did not capture the card hold.",
    }
  } catch (error) {
    const again = await stripe.paymentIntents.retrieve(paymentIntentId).catch(() => null)
    if (again && holdAlreadyPaid(again)) {
      return {
        ok: true,
        alreadyCaptured: true,
        amountReceivedCents: again.amount_received,
      }
    }
    const message = error instanceof Error ? error.message : "Failed to capture payment hold."
    if (message.includes("remainder of the authorized amount has been released")) {
      return {
        ok: false,
        error:
          "The card hold was released and nothing was charged. Collect payment at the pharmacy.",
      }
    }
    return { ok: false, error: message }
  }
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

/** One-time payment link for collecting remaining patient balance. */
export async function createBalanceCheckoutSession(params: {
  balanceRequestId: string
  patientId: string
  email: string
  amountCents: number
  description: string
  successUrl: string
  cancelUrl: string
}): Promise<{ sessionId: string; url: string }> {
  const stripe = getStripe()
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: params.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: params.amountCents,
          product_data: {
            name: params.description.slice(0, 120) || "Balance due",
          },
        },
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      payment_type: "balance_request",
      balance_request_id: params.balanceRequestId,
      patient_id: params.patientId,
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
