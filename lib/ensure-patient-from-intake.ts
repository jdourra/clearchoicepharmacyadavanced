import "server-only"
import { randomBytes } from "crypto"
import { sql } from "@/lib/db"
import {
  paymentStatusFromHold,
  type IntakePatientIdentity,
  type IntakePaymentStatus,
} from "@/lib/intake-payment-status"

export type { IntakePatientIdentity, IntakePaymentStatus }
export { paymentStatusFromHold, formatPaymentStatus } from "@/lib/intake-payment-status"

/**
 * Find or create a patients row for a clinical intake buyer so they appear in Admin → Customers.
 * Uses a random unusable password; the patient can set a real password later via signup/recovery.
 */
export async function ensurePatientFromIntake(
  identity: IntakePatientIdentity
): Promise<{ patientId: string; created: boolean }> {
  const email = identity.email.trim().toLowerCase()
  if (!email) {
    throw new Error("Patient email is required")
  }

  if (identity.sessionPatientId) {
    const byId = await sql("SELECT id FROM patients WHERE id = $1", [identity.sessionPatientId]).catch(
      () => []
    )
    if (byId[0]?.id) {
      return { patientId: String(byId[0].id), created: false }
    }
  }

  const existing = await sql("SELECT id FROM patients WHERE LOWER(email) = $1 LIMIT 1", [email])
  if (existing[0]?.id) {
    return { patientId: String(existing[0].id), created: false }
  }

  const dobRaw = identity.dateOfBirth?.trim() || ""
  const dob = /^\d{4}-\d{2}-\d{2}/.test(dobRaw) ? dobRaw.slice(0, 10) : null

  const randomPassword = randomBytes(24).toString("hex")
  const rows = await sql(
    `INSERT INTO patients (email, password_hash, first_name, last_name, phone, date_of_birth, address_line1, city, state, zip_code)
     VALUES ($1, crypt($2, gen_salt('bf')), $3, $4, $5, $6::date, $7, $8, $9, $10)
     RETURNING id`,
    [
      email,
      randomPassword,
      identity.firstName.trim() || "Patient",
      identity.lastName.trim() || "Customer",
      identity.phone || null,
      dob,
      identity.address || null,
      identity.city || null,
      identity.state || null,
      identity.zip || null,
    ]
  )

  if (!rows[0]?.id) {
    throw new Error("Failed to create patient profile")
  }

  return { patientId: String(rows[0].id), created: true }
}

/** After an intake row is inserted, ensure a customer profile and stamp payment fields. */
export async function linkIntakePatientAndPayment(params: {
  table: string
  intakeId: string
  identity: IntakePatientIdentity
  stripePaymentIntentId?: string | null
}): Promise<{ patientId: string }> {
  const { patientId } = await ensurePatientFromIntake(params.identity)
  const paymentStatus = paymentStatusFromHold(params.stripePaymentIntentId)
  await sql(
    `UPDATE ${params.table}
     SET patient_id = COALESCE(patient_id, $1),
         payment_status = COALESCE(NULLIF(payment_status, ''), $2)
     WHERE id = $3`,
    [patientId, paymentStatus, params.intakeId]
  ).catch((err) => {
    console.warn(
      `[linkIntakePatientAndPayment] Could not update ${params.table} (${params.intakeId}). Run scripts/034_intake_patient_and_payment.sql`,
      err
    )
  })
  return { patientId }
}
