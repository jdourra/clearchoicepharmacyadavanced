import "server-only"
import { orders } from "@/lib/auth"
import type { OrderItem } from "@/lib/auth-types"
import { sql } from "@/lib/db"

export type RequestedMedicationLine = {
  name: string
  strength?: string
  form?: string
  quantity: number
  unit_price?: number
}

export async function createPharmacyOrderFromPrescriptionTelemedicineIntake(
  intakeId: string
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  const rows = await sql(
    `SELECT *
     FROM prescription_telemedicine_intake
     WHERE id = $1
     LIMIT 1`,
    [intakeId]
  ).catch(() => [])

  if (rows.length === 0) {
    return { success: false, error: "Intake not found" }
  }

  const intake = rows[0] as Record<string, unknown>

  if (intake.order_id) {
    return { success: true, orderId: String(intake.order_id) }
  }

  const meds = intake.requested_medications
  if (!Array.isArray(meds) || meds.length === 0) {
    return { success: false, error: "No medications on this intake" }
  }

  const items: OrderItem[] = meds.map((raw) => {
    const m = raw as Record<string, unknown>
    const qty = Number(m.quantity) || 1
    const unitPrice = Number(m.unit_price ?? m.price) || 0
    return {
      drug_name: String(m.name || "Medication"),
      quantity: qty,
      price: unitPrice,
    }
  })

  const patientId = intake.patient_id != null ? String(intake.patient_id) : null
  const total = Number(intake.total_amount) || 0
  const deliveryMethod = String(intake.delivery_method || "pickup")
  const notes = intake.order_notes != null ? String(intake.order_notes) : ""

  const order = await orders.createOrder(
    patientId,
    items,
    total,
    deliveryMethod,
    notes,
    "telemedicine"
  )

  if (!order) {
    return { success: false, error: "Failed to create pharmacy order" }
  }

  const stripeId =
    intake.stripe_payment_intent_id != null ? String(intake.stripe_payment_intent_id) : null
  if (stripeId) {
    await orders.markOrderPaid(order.id, stripeId)
  }

  await sql(
    `UPDATE prescription_telemedicine_intake
     SET order_id = $2, updated_at = NOW()
     WHERE id = $1`,
    [intakeId, order.id]
  ).catch(() => [])

  return { success: true, orderId: order.id }
}
