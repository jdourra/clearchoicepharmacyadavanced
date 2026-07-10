import { NextResponse } from "next/server"
import { orders } from "@/lib/auth"
import { createTelemedicineIntakeForOrder } from "@/lib/order-prescription-admin"
import { resolveTelemedicineIntakeRouteFromOrderItems } from "@/lib/prescription-telemedicine"
import { getUserIdFromRequest } from "@/lib/server-session"

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request)
    const body = await request.json()
    const { items, total_amount, delivery_method, notes, prescription_method, payment_preference } = body
    const orderItems = (items || []).map((item: any) => ({
      drug_name: item.medication_name || item.drug_name || "Unknown",
      quantity: item.quantity || 1,
      price: item.unit_price || item.price || 0,
    }))
    const method = prescription_method ? String(prescription_method) : null
    const order = await orders.createOrder(
      userId,
      orderItems,
      total_amount || 0,
      delivery_method || "pickup",
      notes || "",
      method
    )

    if (!order) {
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
    }

    // Telemedicine always requires card payment at intake — do not set pay_by_phone here.
    if (method !== "telemedicine") {
      const preference = payment_preference === "pay_now" ? "pay_now" : "pay_by_phone"
      await orders.setPaymentPreference(order.id, preference)
      order.payment_preference = preference
      if (preference === "pay_by_phone") {
        order.payment_method = "phone"
      }
    }

    if (method === "telemedicine") {
      const route = resolveTelemedicineIntakeRouteFromOrderItems(orderItems)
      const intakeType =
        route.type === "ed_troche" ? "ed_troche" : route.type === "ed_tablet" ? "ed_tablet" : "general"
      await createTelemedicineIntakeForOrder(order.id, userId, intakeType)
    }

    return NextResponse.json({ order })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request)
    if (!userId) return NextResponse.json({ orders: [] })
    const userOrders = await orders.getOrdersForPatient(userId)
    return NextResponse.json({ orders: userOrders })
  } catch {
    return NextResponse.json({ orders: [] })
  }
}
