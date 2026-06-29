import { NextResponse } from "next/server"
import { orders } from "@/lib/auth"
import { getPaymentIntentIdFromSession, getStripe } from "@/lib/stripe-server"

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 })
  }

  const body = await request.text()
  const signature = request.headers.get("stripe-signature")
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event
  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error("[stripe/webhook] signature verification failed", error)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object
      const orderId = session.metadata?.order_id
      if (orderId && session.payment_status === "paid") {
        const paymentIntentId = getPaymentIntentIdFromSession(session)
        if (paymentIntentId) {
          await orders.markOrderPaid(orderId, paymentIntentId, session.id)
        }
      }
    }

    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object
      const orderId = intent.metadata?.order_id
      if (orderId) {
        await orders.markOrderPaid(orderId, intent.id)
      }
    }
  } catch (error) {
    console.error("[stripe/webhook] handler error", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
