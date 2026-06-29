import { NextResponse } from "next/server"
import { orders } from "@/lib/auth"
import { sql } from "@/lib/db"
import { buildCheckoutLineItems } from "@/lib/order-payment"
import { SITE_URL } from "@/lib/site-config"
import {
  createOrderCheckoutSession,
  isStripeConfigured,
} from "@/lib/stripe-server"
import { getUserIdFromRequest } from "@/lib/server-session"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: "Please sign in to pay for your order." }, { status: 401 })
    }

    const { id } = await params
    const order = await orders.getOrderForPatient(id, userId)
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.payment_status === "paid") {
      return NextResponse.json({ error: "This order is already paid." }, { status: 400 })
    }

    const lineItems = buildCheckoutLineItems(order)
    const totalCents = lineItems.reduce((sum, item) => sum + item.amountCents * item.quantity, 0)
    if (totalCents < 50) {
      return NextResponse.json({ error: "Invalid order total for payment." }, { status: 400 })
    }

    const patients = await sql("SELECT email FROM patients WHERE id = $1", [userId])
    const email = patients[0]?.email ? String(patients[0].email) : ""

    if (!isStripeConfigured()) {
      if (process.env.NODE_ENV === "development") {
        const mockIntent = `dev_mock_pi_order_${Date.now()}`
        await orders.markOrderPaid(order.id, mockIntent)
        return NextResponse.json({
          mode: "development_mock",
          url: `${SITE_URL}/account/orders/${order.id}/pay?success=1`,
        })
      }
      return NextResponse.json(
        { error: "Online payment is not configured. Please call (248) 987-6182." },
        { status: 503 }
      )
    }

    const baseUrl = SITE_URL.replace(/\/$/, "")
    const payPath = `/account/orders/${order.id}/pay`
    const { sessionId, url } = await createOrderCheckoutSession({
      orderId: order.id,
      orderNumber: order.order_number,
      email,
      lineItems,
      successUrl: `${baseUrl}${payPath}?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}${payPath}?canceled=1`,
    })

    await orders.saveCheckoutSession(order.id, sessionId)

    return NextResponse.json({ mode: "stripe", url, sessionId })
  } catch (error) {
    console.error("[orders/checkout]", error)
    return NextResponse.json({ error: "Failed to start checkout" }, { status: 500 })
  }
}
