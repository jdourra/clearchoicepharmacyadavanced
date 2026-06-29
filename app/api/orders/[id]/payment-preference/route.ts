import { NextResponse } from "next/server"
import { orders } from "@/lib/auth"
import { getUserIdFromRequest } from "@/lib/server-session"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 })
    }

    const { id } = await params
    const order = await orders.getOrderForPatient(id, userId)
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.payment_status === "paid") {
      return NextResponse.json({ error: "This order is already paid." }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const preference = body.preference === "pay_now" ? "pay_now" : "pay_by_phone"

    await orders.setPaymentPreference(id, preference)

    return NextResponse.json({
      success: true,
      preference,
      message:
        preference === "pay_by_phone"
          ? "We'll call you to collect payment. Your order will be processed after payment is received."
          : "Continue to secure card payment for faster processing.",
    })
  } catch (error) {
    console.error("[orders/payment-preference]", error)
    return NextResponse.json({ error: "Failed to save payment preference" }, { status: 500 })
  }
}
