import { NextResponse } from "next/server"
import { orders, staffAuth } from "@/lib/auth"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!staff || staff.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const method = body.method === "cash" ? "cash" : "phone"

    const existing = await orders.getOrderById(id)
    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (existing.payment_status === "paid") {
      return NextResponse.json({ error: "Order is already marked paid", order: existing }, { status: 400 })
    }

    const order = await orders.markOrderPaidManually(
      id,
      method,
      staff.full_name || staff.email
    )

    if (!order) {
      return NextResponse.json({ error: "Could not mark order paid" }, { status: 500 })
    }

    return NextResponse.json({ success: true, order })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to mark order paid"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
