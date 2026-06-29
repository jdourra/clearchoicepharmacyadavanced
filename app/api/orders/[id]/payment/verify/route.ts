import { NextResponse } from "next/server"
import { orders } from "@/lib/auth"
import {
  getPaymentIntentIdFromSession,
  isStripeConfigured,
  retrieveCheckoutSession,
} from "@/lib/stripe-server"
import { getUserIdFromRequest } from "@/lib/server-session"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const order = await orders.getOrderForPatient(id, userId)
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")

    if (sessionId && isStripeConfigured() && order.payment_status !== "paid") {
      const session = await retrieveCheckoutSession(sessionId)
      if (
        session.payment_status === "paid" &&
        session.metadata?.order_id === order.id
      ) {
        const paymentIntentId = getPaymentIntentIdFromSession(session)
        if (paymentIntentId) {
          await orders.markOrderPaid(order.id, paymentIntentId, session.id)
        }
      }
    }

    const refreshed = await orders.getOrderForPatient(id, userId)
    return NextResponse.json({ order: refreshed })
  } catch (error) {
    console.error("[orders/payment/verify]", error)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}
