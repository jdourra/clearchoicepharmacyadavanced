import "server-only"
import { sql } from "@/lib/db"
import { calculateEdTotalBilled, type EdBillingPlan } from "@/lib/ed-troche-catalog"
import { weightLossOrderProfit, type WeightLossProfit } from "@/lib/glp-order-profit"
import { getTrtPrice, type TrtBillingPlan } from "@/lib/trt-catalog"
import { SERVICE_LABELS, type AdminIntakeServiceType } from "@/lib/telehealth/intake-registry"

const PAID = new Set(["captured", "paid_in_person", "paid_zelle", "paid"])
const CLOSED = new Set(["cancelled", "canceled", "provider_denied", "denied"])

export type PatientHistoryOrder = {
  serviceType: AdminIntakeServiceType
  serviceLabel: string
  id: string
  treatmentLabel: string
  status: string
  paymentStatus: string | null
  createdAt: string
  patientPaid: number | null
  profit: WeightLossProfit | null
  countedInTotal: boolean
}

export type PatientHistoryGroup = {
  key: string
  name: string
  email: string
  phone: string | null
  orders: PatientHistoryOrder[]
  collectedProfit: number
}

function text(value: unknown): string {
  return value == null ? "" : String(value).trim()
}

function moneyOrNull(value: number): number | null {
  return Number.isFinite(value) && value > 0 ? Math.round(value * 100) / 100 : null
}

function likePattern(query: string): string {
  const cleaned = query.trim().toLowerCase().replace(/[%_\\]/g, "")
  return `%${cleaned}%`
}

async function rows(query: string, params: unknown[]): Promise<Record<string, unknown>[]> {
  try {
    return await sql(query, params)
  } catch {
    return []
  }
}

function orderFromRow(
  serviceType: AdminIntakeServiceType,
  row: Record<string, unknown>,
  treatmentLabel: string,
  patientPaid: number | null,
  profit: WeightLossProfit | null
): PatientHistoryOrder {
  const status = text(row.status)
  const paymentStatus = text(row.payment_status) || null
  const countedInTotal = Boolean(
    profit && PAID.has(String(paymentStatus ?? "").toLowerCase()) && !CLOSED.has(status.toLowerCase())
  )
  return {
    serviceType,
    serviceLabel: SERVICE_LABELS[serviceType],
    id: text(row.id),
    treatmentLabel,
    status,
    paymentStatus,
    createdAt: text(row.created_at) || new Date(0).toISOString(),
    patientPaid: profit?.patientPaid ?? patientPaid,
    profit,
    countedInTotal,
  }
}

async function weightLossOrders(like: string | null) {
  const where = like
    ? `WHERE lower(coalesce(first_name, '') || ' ' || coalesce(last_name, '')) LIKE $1
        OR lower(coalesce(email, '')) LIKE $1`
    : ""
  const params = like ? [like] : []
  const limit = like ? 200 : 80
  const select = `id, first_name, last_name, email, phone, state, status, payment_status, created_at,
            selected_program, selected_billing_plan, selected_dose_tier, partner_case_id`
  let found = await rows(
    `SELECT ${select}, billing_kit_count
     FROM weight_loss_intake ${where}
     ORDER BY created_at DESC
     LIMIT ${limit}`,
    params
  )
  if (found.length === 0) {
    found = await rows(
      `SELECT ${select}
       FROM weight_loss_intake ${where}
       ORDER BY created_at DESC
       LIMIT ${limit}`,
      params
    )
  }
  return found.map((row) => {
    const programId = text(row.selected_program)
    const partnerPricing = Boolean(text(row.partner_case_id)) || text(row.payment_status) === "paid_zelle"
    const profit = weightLossOrderProfit({
      programId,
      doseId: text(row.selected_dose_tier),
      billingPlan: text(row.selected_billing_plan),
      kitCount: row.billing_kit_count == null ? null : Number(row.billing_kit_count),
      state: text(row.state) || null,
      partnerPricing,
    })
    const medication =
      programId === "tirzepatide" ? "Tirzepatide" : programId === "semaglutide" ? "Semaglutide" : "Weight loss"
    const label = profit ? `${medication} · ${profit.doseLabel}` : medication
    return attachIdentity(row, orderFromRow("weight_loss", row, label, profit?.patientPaid ?? null, profit))
  })
}

function attachIdentity(row: Record<string, unknown>, order: PatientHistoryOrder): PatientHistoryOrder & {
  firstName: string
  lastName: string
  email: string
  phone: string | null
} {
  return {
    ...order,
    firstName: text(row.first_name),
    lastName: text(row.last_name),
    email: text(row.email),
    phone: text(row.phone) || null,
  }
}

async function otherOrders(like: string): Promise<Array<ReturnType<typeof attachIdentity>>> {
  const params = [like]
  const where = `WHERE lower(coalesce(first_name, '') || ' ' || coalesce(last_name, '')) LIKE $1
      OR lower(coalesce(email, '')) LIKE $1`
  const [mens, trt, vials, iv, specialty, rx] = await Promise.all([
    rows(
      `SELECT id, first_name, last_name, email, phone, status, payment_status, created_at, selected_product, selected_billing_plan
       FROM patient_intake ${where} ORDER BY created_at DESC LIMIT 100`,
      params
    ),
    rows(
      `SELECT id, first_name, last_name, email, phone, status, payment_status, created_at, selected_program, selected_billing_plan
       FROM trt_intake ${where} ORDER BY created_at DESC LIMIT 100`,
      params
    ),
    rows(
      `SELECT id, first_name, last_name, email, phone, status, payment_status, created_at, selected_vial_title, kit_price
       FROM rejuvenation_vial_intakes ${where} ORDER BY created_at DESC LIMIT 100`,
      params
    ),
    rows(
      `SELECT id, first_name, last_name, email, phone, status, payment_status, created_at, selected_package_title, estimated_total
       FROM iv_booking_requests ${where} ORDER BY created_at DESC LIMIT 100`,
      params
    ),
    rows(
      `SELECT id, first_name, last_name, email, phone, status, payment_status, created_at, selected_medication
       FROM specialty_intake ${where} ORDER BY created_at DESC LIMIT 100`,
      params
    ),
    rows(
      `SELECT id, first_name, last_name, email, phone, status, payment_status, created_at, total_amount, visit_reason
       FROM prescription_telemedicine_intake ${where} ORDER BY created_at DESC LIMIT 100`,
      params
    ),
  ])

  return [
    ...mens.map((row) => {
      const planRaw = text(row.selected_billing_plan)
      const plan: EdBillingPlan =
        planRaw === "quarterly" || planRaw === "annual" || planRaw === "monthly" ? planRaw : "monthly"
      return attachIdentity(
        row,
        orderFromRow(
          "mens_health",
          row,
          text(row.selected_product) || "ED troches",
          moneyOrNull(calculateEdTotalBilled(text(row.selected_product), plan)),
          null
        )
      )
    }),
    ...trt.map((row) => {
      const plan: TrtBillingPlan = row.selected_billing_plan === "quarterly" ? "quarterly" : "monthly"
      return attachIdentity(
        row,
        orderFromRow(
          "trt",
          row,
          text(row.selected_program) || "TRT",
          moneyOrNull(getTrtPrice(text(row.selected_program), plan)?.totalBilled ?? 0),
          null
        )
      )
    }),
    ...vials.map((row) =>
      attachIdentity(
        row,
        orderFromRow(
          "rejuvenation_vial",
          row,
          text(row.selected_vial_title) || "Rejuvenation vial",
          moneyOrNull(Number(row.kit_price)),
          null
        )
      )
    ),
    ...iv.map((row) =>
      attachIdentity(
        row,
        orderFromRow(
          "iv_rejuvenation",
          row,
          text(row.selected_package_title) || "IV package",
          moneyOrNull(Number(row.estimated_total)),
          null
        )
      )
    ),
    ...specialty.map((row) =>
      attachIdentity(
        row,
        orderFromRow("specialty_pharmacy", row, text(row.selected_medication) || "Specialty medication", null, null)
      )
    ),
    ...rx.map((row) =>
      attachIdentity(
        row,
        orderFromRow(
          "prescription_telemedicine",
          row,
          text(row.visit_reason) || "Telemedicine prescription",
          moneyOrNull(Number(row.total_amount)),
          null
        )
      )
    ),
  ]
}

export async function searchPatientHistory(query: string): Promise<{
  query: string
  patients: PatientHistoryGroup[]
}> {
  const trimmed = query.trim()
  const like = trimmed.length >= 2 ? likePattern(trimmed) : null
  const weight = await weightLossOrders(like)
  const rest = like ? await otherOrders(like) : []
  const all = [...weight, ...rest]

  const groups = new Map<string, PatientHistoryGroup & { orders: PatientHistoryOrder[] }>()
  for (const item of all) {
    const email = item.email.toLowerCase()
    const name = `${item.firstName} ${item.lastName}`.trim() || "Unknown patient"
    const key = email || name.toLowerCase()
    const existing = groups.get(key)
    const order: PatientHistoryOrder = {
      serviceType: item.serviceType,
      serviceLabel: item.serviceLabel,
      id: item.id,
      treatmentLabel: item.treatmentLabel,
      status: item.status,
      paymentStatus: item.paymentStatus,
      createdAt: item.createdAt,
      patientPaid: item.patientPaid,
      profit: item.profit,
      countedInTotal: item.countedInTotal,
    }
    if (!existing) {
      groups.set(key, {
        key,
        name,
        email: item.email,
        phone: item.phone,
        orders: [order],
        collectedProfit: order.countedInTotal ? order.profit?.profit ?? 0 : 0,
      })
      continue
    }
    existing.orders.push(order)
    if (!existing.phone && item.phone) existing.phone = item.phone
    if (existing.name === "Unknown patient" && name !== "Unknown patient") existing.name = name
    if (order.countedInTotal && order.profit) {
      existing.collectedProfit = Math.round((existing.collectedProfit + order.profit.profit) * 100) / 100
    }
  }

  const patients = [...groups.values()]
    .map((group) => ({
      ...group,
      orders: group.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    }))
    .sort((a, b) => new Date(b.orders[0]?.createdAt ?? 0).getTime() - new Date(a.orders[0]?.createdAt ?? 0).getTime())
    .slice(0, like ? 50 : 30)

  return { query: trimmed, patients }
}
