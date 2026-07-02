import "server-only"
import { sql } from "@/lib/db"
import type { ClinicalServiceType } from "@/lib/telehealth/types"
import { SPECIALTY_INTAKE_STATUS } from "@/lib/specialty-pharmacy-catalog"

export type AdminIntakeServiceType = ClinicalServiceType | "specialty_pharmacy"

export type IntakeListItem = {
  serviceType: AdminIntakeServiceType
  serviceLabel: string
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  state: string | null
  status: string
  treatmentLabel: string
  stripePaymentIntentId: string | null
  createdAt: string
}

export const PENDING_INTAKE_STATUSES = [
  "pending_provider_review",
  "pending_review",
  "provider_follow_up",
] as const

export const SERVICE_LABELS: Record<AdminIntakeServiceType, string> = {
  mens_health: "Men's Health (ED Troches)",
  trt: "TRT",
  weight_loss: "Weight Loss",
  iv_rejuvenation: "IV Rejuvenation",
  rejuvenation_vial: "Rejuvenation Vial",
  specialty_pharmacy: "Specialty Pharmacy",
}

export function isAdminIntakeServiceType(value: string): value is AdminIntakeServiceType {
  return value in SERVICE_LABELS
}

function rowToItem(
  serviceType: AdminIntakeServiceType,
  row: Record<string, unknown>,
  treatmentLabel: string
): IntakeListItem {
  return {
    serviceType,
    serviceLabel: SERVICE_LABELS[serviceType],
    id: String(row.id),
    firstName: String(row.first_name ?? ""),
    lastName: String(row.last_name ?? ""),
    email: String(row.email ?? ""),
    phone: row.phone != null ? String(row.phone) : null,
    state: row.state != null ? String(row.state) : null,
    status: String(row.status ?? ""),
    treatmentLabel,
    stripePaymentIntentId:
      row.stripe_payment_intent_id != null ? String(row.stripe_payment_intent_id) : null,
    createdAt: String(row.created_at ?? new Date().toISOString()),
  }
}

export async function listClinicalIntakes(options?: {
  status?: string
  limit?: number
}): Promise<IntakeListItem[]> {
  const limit = Math.min(options?.limit ?? 100, 200)
  const statusFilter = options?.status

  const pendingOnly = !statusFilter || statusFilter === "pending"
  const statusClause = pendingOnly ? [...PENDING_INTAKE_STATUSES] : [statusFilter]

  const placeholders = statusClause.map((_, i) => `$${i + 1}`).join(", ")

  const queries = await Promise.all([
    sql(
      `SELECT id, first_name, last_name, email, phone, state, status, selected_product, stripe_payment_intent_id, created_at
       FROM patient_intake WHERE status IN (${placeholders}) ORDER BY created_at DESC LIMIT ${limit}`,
      statusClause
    ).catch(() => []),
    sql(
      `SELECT id, first_name, last_name, email, phone, state, status, selected_program, stripe_payment_intent_id, created_at
       FROM trt_intake WHERE status IN (${placeholders}) ORDER BY created_at DESC LIMIT ${limit}`,
      statusClause
    ).catch(() => []),
    sql(
      `SELECT id, first_name, last_name, email, phone, state, status, selected_program, stripe_payment_intent_id, created_at
       FROM weight_loss_intake WHERE status IN (${placeholders}) ORDER BY created_at DESC LIMIT ${limit}`,
      statusClause
    ).catch(() => []),
    sql(
      `SELECT id, first_name, last_name, email, phone, shipping_state AS state, status, selected_vial_title, stripe_payment_intent_id, created_at
       FROM rejuvenation_vial_intakes WHERE status IN (${placeholders}) ORDER BY created_at DESC LIMIT ${limit}`,
      statusClause
    ).catch(() => []),
    sql(
      `SELECT id, first_name, last_name, email, phone, service_state AS state, status, selected_package_title, stripe_payment_intent_id, created_at
       FROM iv_booking_requests WHERE status IN (${placeholders}) ORDER BY created_at DESC LIMIT ${limit}`,
      statusClause
    ).catch(() => []),
    sql(
      `SELECT id, first_name, last_name, email, phone, state, status, selected_medication, created_at
       FROM specialty_intake WHERE status IN (${placeholders}) ORDER BY created_at DESC LIMIT ${limit}`,
      statusClause
    ).catch(() => []),
  ])

  const [mens, trt, weight, vial, iv, specialty] = queries

  const items: IntakeListItem[] = [
    ...mens.map((r: Record<string, unknown>) =>
      rowToItem("mens_health", r, String(r.selected_product ?? "ED Troches"))
    ),
    ...trt.map((r: Record<string, unknown>) =>
      rowToItem("trt", r, String(r.selected_program ?? "TRT"))
    ),
    ...weight.map((r: Record<string, unknown>) =>
      rowToItem("weight_loss", r, String(r.selected_program ?? "Weight Loss"))
    ),
    ...vial.map((r: Record<string, unknown>) =>
      rowToItem("rejuvenation_vial", r, String(r.selected_vial_title ?? "Rejuvenation Vial"))
    ),
    ...iv.map((r: Record<string, unknown>) =>
      rowToItem("iv_rejuvenation", r, String(r.selected_package_title ?? "IV Package"))
    ),
    ...specialty.map((r: Record<string, unknown>) =>
      rowToItem("specialty_pharmacy", r, String(r.selected_medication ?? "Specialty Medication"))
    ),
  ]

  return items
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
}

export async function getClinicalIntakeDetail(
  serviceType: AdminIntakeServiceType,
  id: string
): Promise<Record<string, unknown> | null> {
  const table = tableForAdminService(serviceType)
  const rows = await sql(`SELECT * FROM ${table} WHERE id = $1`, [id]).catch(() => [])
  return rows[0] ?? null
}

function tableForAdminService(serviceType: AdminIntakeServiceType): string {
  switch (serviceType) {
    case "mens_health":
      return "patient_intake"
    case "trt":
      return "trt_intake"
    case "weight_loss":
      return "weight_loss_intake"
    case "rejuvenation_vial":
      return "rejuvenation_vial_intakes"
    case "iv_rejuvenation":
      return "iv_booking_requests"
    case "specialty_pharmacy":
      return "specialty_intake"
  }
}

export function treatmentLabelFromDetail(
  serviceType: AdminIntakeServiceType,
  detail: Record<string, unknown>
): string {
  switch (serviceType) {
    case "mens_health":
      return String(detail.selected_product ?? "ED Troches")
    case "trt":
      return String(detail.selected_program ?? "TRT")
    case "weight_loss":
      return String(detail.selected_program ?? "Weight Loss")
    case "rejuvenation_vial":
      return String(detail.selected_vial_title ?? detail.selected_vial ?? "Rejuvenation Vial")
    case "iv_rejuvenation":
      return String(detail.selected_package_title ?? detail.selected_package ?? "IV Package")
    case "specialty_pharmacy":
      return String(detail.selected_medication ?? "Specialty Medication")
  }
}

export { SPECIALTY_INTAKE_STATUS }
