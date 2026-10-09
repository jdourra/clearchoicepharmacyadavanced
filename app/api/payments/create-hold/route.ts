import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createPaymentHold, isStripeConfigured } from "@/lib/stripe-server"
import { getStripePublishableKey, stripeConfigStatus, stripeKeysMismatch } from "@/lib/stripe-env"

function paymentSetupError(error: unknown): string {
  if (error instanceof Stripe.errors.StripeError && error.message) return error.message
  if (error instanceof Error && error.message) return error.message
  return "Failed to initialize payment authorization"
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const amount = Number(body.amount)
    const email = String(body.email || "").trim()
    const serviceType = String(body.serviceType || "clinical")

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    if (!Number.isFinite(amount) || amount < 1) {
      return NextResponse.json({ error: "Invalid payment amount" }, { status: 400 })
    }

    const amountCents = Math.round(amount * 100)

    if (stripeKeysMismatch()) {
      console.error("[payments/create-hold] Stripe keys are from different accounts:", stripeConfigStatus().issues)
      return NextResponse.json(
        {
          error:
            "Online card authorization is temporarily unavailable. Please call (248) 987-6182 to complete your order.",
        },
        { status: 503 }
      )
    }

    if (!isStripeConfigured()) {
      if (process.env.NODE_ENV === "development") {
        const mockId = `dev_mock_pi_${Date.now()}`
        return NextResponse.json({
          paymentIntentId: mockId,
          clientSecret: null,
          mode: "development_mock",
          message: "Stripe not configured — using development mock authorization.",
        })
      }

      console.error("[payments/create-hold] Stripe not configured:", stripeConfigStatus().issues)
      return NextResponse.json(
        {
          error:
            "Payment processing is not configured. Please call (248) 987-6182 to complete your booking.",
        },
        { status: 503 }
      )
    }

    if (!getStripePublishableKey()) {
      console.error("[payments/create-hold] Stripe publishable key missing:", stripeConfigStatus().issues)
      return NextResponse.json(
        {
          error:
            "Payment form is not fully configured. Please call (248) 987-6182 to complete your booking.",
        },
        { status: 503 }
      )
    }

    const { paymentIntentId, clientSecret } = await createPaymentHold({
      amountCents,
      email,
      metadata: { serviceType },
    })

    return NextResponse.json({
      paymentIntentId,
      clientSecret,
      mode: "stripe",
    })
  } catch (error) {
    console.error("[payments/create-hold]", error)
    return NextResponse.json({ error: paymentSetupError(error) }, { status: 500 })
  }
}
