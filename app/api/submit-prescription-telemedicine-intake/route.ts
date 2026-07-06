import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { savePrescriptionTelemedicineIntake } from "@/lib/order-prescription-admin"
import { getUserIdFromRequest } from "@/lib/server-session"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const orderId = String(body.orderId || "").trim()
    const intakeType = String(body.intakeType || "").trim()
    const payload = body.payload

    if (!orderId || !intakeType || !payload || typeof payload !== "object") {
      return NextResponse.json({ error: "Missing orderId, intakeType, or payload" }, { status: 400 })
    }

    if (intakeType !== "ed_tablet" && intakeType !== "general") {
      return NextResponse.json({ error: "Invalid intake type" }, { status: 400 })
    }

    const userId = await getUserIdFromRequest(request)

    const orders = await sql(
      `SELECT id, patient_id, prescription_method
       FROM orders
       WHERE id = $1
       LIMIT 1`,
      [orderId]
    ).catch(() => [])

    if (orders.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const order = orders[0] as { id: string; patient_id: string | null; prescription_method: string | null }
    if (order.prescription_method !== "telemedicine") {
      return NextResponse.json({ error: "This order does not use telemedicine" }, { status: 400 })
    }

    if (userId && order.patient_id && order.patient_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const saved = await savePrescriptionTelemedicineIntake(orderId, intakeType, payload as Record<string, unknown>)
    if (!saved) {
      return NextResponse.json({ error: "Failed to save intake. Please contact support." }, { status: 500 })
    }

    return NextResponse.json({ success: true, orderId })
  } catch (error) {
    console.error("[submit-prescription-telemedicine-intake]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
