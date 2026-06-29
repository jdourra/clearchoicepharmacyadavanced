import { NextResponse } from "next/server"
import { orders } from "@/lib/auth"
import { getOrderPrescriptionDetails } from "@/lib/order-prescription-admin"
import { buildPrescriptionNotes } from "@/lib/order-prescription-notes"
import type { PrescriptionMethod } from "@/lib/order-prescription"
import { getUserIdFromRequest } from "@/lib/server-session"

const VALID_METHODS = new Set<PrescriptionMethod>(["upload", "eprescribe", "transfer"])

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

    const prescription = await getOrderPrescriptionDetails(
      order.id,
      order.notes,
      order.prescription_method
    )

    return NextResponse.json({ order, prescription })
  } catch (error) {
    console.error("[orders/prescription GET]", error)
    return NextResponse.json({ error: "Failed to load order" }, { status: 500 })
  }
}

export async function PATCH(
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

    if (order.status === "cancelled") {
      return NextResponse.json({ error: "This order was cancelled." }, { status: 400 })
    }

    const body = await request.json()
    const prescriptionMethod = String(body.prescriptionMethod || "") as PrescriptionMethod

    if (!VALID_METHODS.has(prescriptionMethod)) {
      return NextResponse.json({ error: "Invalid prescription method" }, { status: 400 })
    }

    const deliveryMethod = order.payment_method || "pickup"

    if (prescriptionMethod === "eprescribe") {
      const doctorName = String(body.doctorName || "").trim()
      const doctorPhone = String(body.doctorPhone || "").trim()
      if (!doctorName || !doctorPhone) {
        return NextResponse.json({ error: "Doctor name and phone are required" }, { status: 400 })
      }
    }

    if (prescriptionMethod === "transfer") {
      const transferRxNumbers = String(body.transferRxNumbers || "").trim()
      const transferPharmacyName = String(body.transferPharmacyName || "").trim()
      const transferPharmacyPhone = String(body.transferPharmacyPhone || "").trim()
      if (!transferRxNumbers || !transferPharmacyName || !transferPharmacyPhone) {
        return NextResponse.json(
          { error: "RX numbers, pharmacy name, and pharmacy phone are required" },
          { status: 400 }
        )
      }
    }

    const notes = buildPrescriptionNotes(prescriptionMethod, {
      deliveryMethod,
      doctorName: body.doctorName,
      doctorPhone: body.doctorPhone,
      transferRxNumbers: body.transferRxNumbers,
      transferPharmacyName: body.transferPharmacyName,
      transferPharmacyPhone: body.transferPharmacyPhone,
    })

    await orders.updateOrderPrescription(order.id, prescriptionMethod, notes)

    const prescription = await getOrderPrescriptionDetails(order.id, notes, prescriptionMethod)
    const updatedOrder = await orders.getOrderForPatient(id, userId)

    return NextResponse.json({ success: true, order: updatedOrder, prescription })
  } catch (error) {
    console.error("[orders/prescription PATCH]", error)
    return NextResponse.json({ error: "Failed to update prescription" }, { status: 500 })
  }
}
