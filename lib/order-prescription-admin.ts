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
    `SELECT id, status, created_at, intake_type, submitted_at, intake_data
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
      intake_type: row.intake_type != null ? String(row.intake_type) : null,
      submitted_at: row.submitted_at != null ? String(row.submitted_at) : null,
      intake_data:
        row.intake_data && typeof row.intake_data === "object"
          ? (row.intake_data as Record<string, unknown>)
          : null,
    }
    if (details.method === "unknown") {
      details.method = "telemedicine"
    }
  }

  return details
}

export async function createTelemedicineIntakeForOrder(
  orderId: string,
  patientId: string | null,
  intakeType?: string | null
): Promise<string | null> {
  const rows = await sql(
    `INSERT INTO prescription_order_intakes (order_id, patient_id, status, intake_type)
     VALUES ($1, $2, 'pending_intake', $3)
     ON CONFLICT (order_id) DO UPDATE SET
       intake_type = COALESCE(EXCLUDED.intake_type, prescription_order_intakes.intake_type),
       updated_at = now()
     RETURNING id`,
    [orderId, patientId, intakeType || null]
  ).catch(() => [])

  return rows.length > 0 ? String(rows[0].id) : null
}

export async function savePrescriptionTelemedicineIntake(
  orderId: string,
  intakeType: string,
  intakeData: Record<string, unknown>
): Promise<boolean> {
  const rows = await sql(
    `UPDATE prescription_order_intakes
     SET intake_type = $2,
         intake_data = $3::jsonb,
         status = 'pending_provider_review',
         submitted_at = NOW(),
         updated_at = NOW()
     WHERE order_id = $1
     RETURNING id`,
    [orderId, intakeType, JSON.stringify(intakeData)]
  ).catch(() => [])

  return rows.length > 0
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
