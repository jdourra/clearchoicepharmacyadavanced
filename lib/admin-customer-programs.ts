import "server-only"
import { sql } from "@/lib/db"
import { formatPaymentStatus, type IntakePaymentStatus } from "@/lib/intake-payment-status"
import { SERVICE_LABELS, type AdminIntakeServiceType } from "@/lib/telehealth/intake-registry"
import { formatPortalStatus } from "@/lib/patient-portal-types"

export type CustomerClinicalProgram = {
  serviceType: AdminIntakeServiceType
  serviceLabel: string
  id: string
  status: string
  statusLabel: string
  treatmentLabel: string
  paymentStatus: IntakePaymentStatus | string
  paymentStatusLabel: string
  stripePaymentIntentId: string | null
  createdAt: string
  reviewHref: string
}

function mapRow(
  serviceType: AdminIntakeServiceType,
  row: Record<string, unknown>,
  treatmentLabel: string
): CustomerClinicalProgram {
  const paymentStatus = String(row.payment_status ?? "none")
  return {
    serviceType,
    serviceLabel: SERVICE_LABELS[serviceType],
    id: String(row.id),
    status: String(row.status ?? ""),
    statusLabel: formatPortalStatus(String(row.status ?? "")),
    treatmentLabel,
    paymentStatus,
    paymentStatusLabel: formatPaymentStatus(paymentStatus),
    stripePaymentIntentId:
      row.stripe_payment_intent_id != null ? String(row.stripe_payment_intent_id) : null,
    createdAt: String(row.created_at ?? new Date().toISOString()),
    reviewHref: `/admin/intakes/${serviceType}/${row.id}`,
  }
}

/** Clinical intakes linked to a customer by patient_id and/or email. */
export async function listClinicalProgramsForCustomer(params: {
  patientId: string
  email: string
}): Promise<CustomerClinicalProgram[]> {
  const email = params.email.trim().toLowerCase()
  const patientId = params.patientId

  const queries = await Promise.all([
    sql(
      `SELECT id, status, selected_product, stripe_payment_intent_id, payment_status, created_at
       FROM patient_intake
       WHERE patient_id = $1 OR LOWER(email) = $2
       ORDER BY created_at DESC`,
      [patientId, email]
    ).catch(() => []),
    sql(
      `SELECT id, status, selected_program, stripe_payment_intent_id, payment_status, created_at
       FROM trt_intake
       WHERE patient_id = $1 OR LOWER(email) = $2
       ORDER BY created_at DESC`,
      [patientId, email]
    ).catch(() => []),
    sql(
      `SELECT id, status, selected_program, stripe_payment_intent_id, payment_status, created_at
       FROM weight_loss_intake
       WHERE patient_id = $1 OR LOWER(email) = $2
       ORDER BY created_at DESC`,
      [patientId, email]
    ).catch(() => []),
    sql(
      `SELECT id, status, selected_vial_title, stripe_payment_intent_id, payment_status, created_at
       FROM rejuvenation_vial_intakes
       WHERE patient_id = $1 OR LOWER(email) = $2
       ORDER BY created_at DESC`,
      [patientId, email]
    ).catch(() => []),
    sql(
      `SELECT id, status, selected_package_title, stripe_payment_intent_id, payment_status, created_at
       FROM iv_booking_requests
       WHERE patient_id = $1 OR LOWER(email) = $2
       ORDER BY created_at DESC`,
      [patientId, email]
    ).catch(() => []),
    sql(
      `SELECT id, status, selected_medication, payment_status, created_at
       FROM specialty_intake
       WHERE patient_id = $1 OR LOWER(email) = $2
       ORDER BY created_at DESC`,
      [patientId, email]
    ).catch(() => []),
    sql(
      `SELECT id, status, visit_reason, stripe_payment_intent_id, payment_status, created_at
       FROM prescription_telemedicine_intake
       WHERE patient_id = $1 OR LOWER(email) = $2
       ORDER BY created_at DESC`,
      [patientId, email]
    ).catch(() => []),
  ])

  const [mens, trt, weight, vial, iv, specialty, rxTele] = queries

  const items: CustomerClinicalProgram[] = [
    ...mens.map((r: Record<string, unknown>) =>
      mapRow("mens_health", r, String(r.selected_product ?? "ED Troches"))
    ),
    ...trt.map((r: Record<string, unknown>) =>
      mapRow("trt", r, String(r.selected_program ?? "TRT"))
    ),
    ...weight.map((r: Record<string, unknown>) =>
      mapRow("weight_loss", r, String(r.selected_program ?? "Weight Loss"))
    ),
    ...vial.map((r: Record<string, unknown>) =>
      mapRow("rejuvenation_vial", r, String(r.selected_vial_title ?? "Rejuvenation Vial"))
    ),
    ...iv.map((r: Record<string, unknown>) =>
      mapRow("iv_rejuvenation", r, String(r.selected_package_title ?? "IV Package"))
    ),
    ...specialty.map((r: Record<string, unknown>) =>
      mapRow("specialty_pharmacy", { ...r, stripe_payment_intent_id: null }, String(r.selected_medication ?? "Specialty"))
    ),
    ...rxTele.map((r: Record<string, unknown>) =>
      mapRow("prescription_telemedicine", r, String(r.visit_reason ?? "Rx Telemedicine"))
    ),
  ]

  return items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}
