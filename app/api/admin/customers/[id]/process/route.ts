import { NextResponse } from "next/server"
import { admin, staffAuth, orders } from "@/lib/auth"
import { getOrderPrescriptionDetails } from "@/lib/order-prescription-admin"
import type { OrderPrescriptionDetails } from "@/lib/order-prescription"
import type { Order } from "@/lib/auth-types"

export type BatchOrderEntry = {
  order: Order
  prescription: OrderPrescriptionDetails
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!staff || staff.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: customerId } = await params
    const { searchParams } = new URL(request.url)
    const orderIds = (searchParams.get("orders") || "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)

    if (orderIds.length === 0) {
      return NextResponse.json({ error: "No orders specified" }, { status: 400 })
    }

    if (orderIds.length > 20) {
      return NextResponse.json({ error: "Maximum 20 orders per batch" }, { status: 400 })
    }

    const user = await admin.getUserById(customerId)
    if (!user) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    const profile = await admin.getPatientProfileById(customerId)
    const entries: BatchOrderEntry[] = []

    for (const orderId of orderIds) {
      const order = await orders.getOrderById(orderId)
      if (!order || order.patient_id !== customerId) {
        continue
      }
      const prescription = await getOrderPrescriptionDetails(
        order.id,
        order.notes,
        order.prescription_method
      )
      entries.push({ order, prescription })
    }

    if (entries.length === 0) {
      return NextResponse.json({ error: "No valid orders found for this customer" }, { status: 404 })
    }

    entries.sort(
      (a, b) =>
        new Date(b.order.created_at).getTime() - new Date(a.order.created_at).getTime()
    )

    return NextResponse.json({ user, profile, orders: entries })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load batch orders"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
