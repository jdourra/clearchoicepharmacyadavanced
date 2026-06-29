import { NextResponse } from "next/server"
import { admin, staffAuth, orders } from "@/lib/auth"
import { getOrderPrescriptionDetails } from "@/lib/order-prescription-admin"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!staff || staff.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { id } = await params
    const order = await orders.getOrderById(id)
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
    const prescription = await getOrderPrescriptionDetails(
      order.id,
      order.notes,
      order.prescription_method
    )
    const patient = order.patient_id
      ? await admin.getPatientProfileById(order.patient_id)
      : null
    return NextResponse.json({ order, prescription, patient })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!staff || staff.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { id } = await params
    const { status } = await request.json()
    const success = await orders.updateOrderStatus(id, status)
    return NextResponse.json({ success })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
