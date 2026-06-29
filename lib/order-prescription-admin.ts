import "server-only"
import { sql } from "@/lib/db"
import { parseOrderPrescription, type OrderPrescriptionDetails } from "@/lib/order-prescription"

export async function getOrderPrescriptionDetails(
  orderId: string,
  notes?: string | null,
  prescriptionMethod?: string | null
): Promise<OrderPrescriptionDetails> {
  const details = parseOrderPrescription(notes, prescriptionMethod)

  const uploads = await sql(
    `SELECT id, file_name, file_url, status, created_at AS upload_date
     FROM prescription_uploads
     WHERE order_id = $1
     ORDER BY created_at DESC`,
    [orderId]
  ).catch(() => [])

  details.uploads = uploads.map((row: Record<string, unknown>) => ({
    id: String(row.id),
    file_name: row.file_name != null ? String(row.file_name) : null,
    file_url: String(row.file_url),
    status: String(row.status || "pending"),
    upload_date: String(row.upload_date),
  }))

  const intakes = await sql(
    `SELECT id, status, created_at
     FROM prescription_order_intakes
     WHERE order_id = $1
     LIMIT 1`,
    [orderId]
  ).catch(() => [])

  if (intakes.length > 0) {
    const row = intakes[0] as Record<string, unknown>
    details.telemedicineIntake = {
      id: String(row.id),
      status: String(row.status),
      created_at: String(row.created_at),
    }
    if (details.method === "unknown") {
      details.method = "telemedicine"
    }
  }

  return details
}

export async function createTelemedicineIntakeForOrder(
  orderId: string,
  patientId: string | null
): Promise<string | null> {
  const rows = await sql(
    `INSERT INTO prescription_order_intakes (order_id, patient_id, status)
     VALUES ($1, $2, 'pending_provider_review')
     ON CONFLICT (order_id) DO UPDATE SET updated_at = now()
     RETURNING id`,
    [orderId, patientId]
  ).catch(() => [])

  return rows.length > 0 ? String(rows[0].id) : null
}

export async function savePrescriptionUpload(params: {
  orderId: string
  patientId: string | null
  storageKey: string
  fileName: string
}): Promise<void> {
  await sql(
    `INSERT INTO prescription_uploads (order_id, patient_id, file_url, file_name, status)
     VALUES ($1, $2, $3, $4, 'pending')`,
    [params.orderId, params.patientId, params.storageKey, params.fileName]
  )
}
