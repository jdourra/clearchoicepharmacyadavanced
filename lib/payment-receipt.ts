import "server-only"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import { sql } from "@/lib/db"
import { ED_PRODUCT_LABELS, calculateEdTotalBilled, type EdBillingPlan } from "@/lib/ed-troche-catalog"
import { PHARMACY_PHONE_DISPLAY } from "@/lib/phone"
import { sendPatientEmailWithPdf } from "@/lib/ses-mail"
import {
  LEGAL_BUSINESS_NAME,
  PHARMACY_ADDRESS_LINE,
  PHARMACY_DBA,
} from "@/lib/site-config"
import { getTrtPrice, getTrtProgram, type TrtBillingPlan } from "@/lib/trt-catalog"
import {
  getClinicalIntakeDetail,
  isAdminIntakeServiceType,
  tableForAdminService,
  type AdminIntakeServiceType,
} from "@/lib/telehealth/intake-registry"
import {
  getWeightLossIntakeHoldQuote,
  getWeightLossProgram,
  type WeightLossBillingPlan,
  type WeightLossDoseId,
} from "@/lib/weight-loss-catalog"

const RECEIPT_SERVICES = new Set<AdminIntakeServiceType>([
  "weight_loss",
  "mens_health",
  "trt",
  "prescription_telemedicine",
])

const PAID = new Set(["captured", "paid_in_person", "paid_zelle", "paid"])

export type PaymentReceiptResult = {
  sent: boolean
  alreadySent: boolean
  sentAt: string | null
  error?: string
}

function ascii(value: string): string {
  return value.replace(/[^\x20-\x7E]/g, "").trim()
}

function money(value: number): string {
  return `$${value.toFixed(2)}`
}

function paymentMethod(status: string): string {
  if (status === "paid_zelle") return "Zelle or Venmo"
  if (status === "paid_in_person") return "Paid at the pharmacy"
  return "Card"
}

function paidAt(row: Record<string, unknown>): Date {
  const raw = row.ola_sent_at || row.updated_at || row.created_at
  const date = raw ? new Date(String(raw)) : new Date()
  return Number.isNaN(date.getTime()) ? new Date() : date
}

function serviceDescription(serviceType: AdminIntakeServiceType, row: Record<string, unknown>): string {
  if (serviceType === "weight_loss") {
    return getWeightLossProgram(String(row.selected_program ?? ""))?.name || "Weight loss program"
  }
  if (serviceType === "trt") {
    return getTrtProgram(String(row.selected_program ?? ""))?.name || "Hormone therapy"
  }
  if (serviceType === "mens_health") {
    const id = String(row.selected_product ?? "")
    return ED_PRODUCT_LABELS[id] || "ED medication"
  }
  return "Prescription order"
}

function serviceAmount(serviceType: AdminIntakeServiceType, row: Record<string, unknown>): number | null {
  if (serviceType === "weight_loss") {
    const plan: WeightLossBillingPlan = row.selected_billing_plan === "quarterly" ? "quarterly" : "monthly"
    const dose = String(row.selected_dose_tier ?? "").trim()
    const kits = Number(row.billing_kit_count)
    const quote = getWeightLossIntakeHoldQuote(
      String(row.selected_program ?? ""),
      plan,
      dose ? (dose as WeightLossDoseId) : undefined,
      { kitsIncluded: Number.isFinite(kits) && kits > 0 ? Math.floor(kits) : undefined }
    )
    return quote && quote.totalBilled > 0 ? quote.totalBilled : null
  }
  if (serviceType === "trt") {
    const plan: TrtBillingPlan = row.selected_billing_plan === "quarterly" ? "quarterly" : "monthly"
    const total = getTrtPrice(String(row.selected_program ?? ""), plan)?.totalBilled ?? 0
    return total > 0 ? total : null
  }
  if (serviceType === "mens_health") {
    const raw = String(row.selected_billing_plan ?? "")
    const plan: EdBillingPlan = raw === "quarterly" || raw === "annual" || raw === "monthly" ? raw : "monthly"
    const total = calculateEdTotalBilled(String(row.selected_product ?? ""), plan)
    return total > 0 ? total : null
  }
  const total = Number(row.total_amount)
  return Number.isFinite(total) && total > 0 ? total : null
}

async function buildReceiptPdf(params: {
  patientName: string
  email: string
  intakeId: string
  description: string
  amount: number | null
  method: string
  paidOn: Date
}): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  const page = pdf.addPage([612, 792])
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  let y = 744
  const draw = (text: string, opts?: { size?: number; bold?: boolean }) => {
    const size = opts?.size ?? 11
    page.drawText(ascii(text) || " ", {
      x: 48,
      y,
      size,
      font: opts?.bold ? bold : font,
      color: rgb(0.1, 0.1, 0.12),
    })
    y -= size + 8
  }

  draw(PHARMACY_DBA, { size: 18, bold: true })
  draw(LEGAL_BUSINESS_NAME)
  draw(PHARMACY_ADDRESS_LINE)
  draw(PHARMACY_PHONE_DISPLAY)
  y -= 10
  draw("PAYMENT RECEIPT", { size: 14, bold: true })
  draw(`Receipt date: ${params.paidOn.toLocaleString("en-US", { timeZone: "America/Detroit" })}`)
  draw(`Reference: ${params.intakeId}`)
  y -= 8
  draw("PAID BY", { size: 12, bold: true })
  draw(params.patientName || "Patient")
  draw(params.email)
  y -= 8
  draw("PAYMENT", { size: 12, bold: true })
  draw(params.description)
  draw(params.amount == null ? "Amount: confirmed with the pharmacy" : `Amount: ${money(params.amount)}`)
  draw("This amount is the price on the intake.")
  draw(`Method: ${params.method}`)
  draw("The payment shows as Optimeds Pharmacy LLC.")
  y -= 8
  draw("If treatment is not approved, this payment is refunded.")
  draw("This confirms payment. It is not a prescription.")
  draw("It does not mean treatment was approved.")
  return pdf.save()
}

export function canEmailPaymentReceipt(serviceType: string): serviceType is AdminIntakeServiceType {
  return isAdminIntakeServiceType(serviceType) && RECEIPT_SERVICES.has(serviceType)
}

export async function emailPaymentReceipt(params: {
  serviceType: AdminIntakeServiceType
  intakeId: string
  resend?: boolean
}): Promise<PaymentReceiptResult> {
  const row = await getClinicalIntakeDetail(params.serviceType, params.intakeId)
  if (!row) return { sent: false, alreadySent: false, sentAt: null, error: "Intake not found." }

  const paymentStatus = String(row.payment_status ?? "")
  if (!PAID.has(paymentStatus)) {
    return { sent: false, alreadySent: false, sentAt: null, error: "This intake is not marked paid." }
  }

  const existing = row.receipt_sent_at ? new Date(String(row.receipt_sent_at)).toISOString() : null
  if (existing && !params.resend) {
    return { sent: false, alreadySent: true, sentAt: existing }
  }

  const email = String(row.email ?? "")
  const patientName = `${String(row.first_name ?? "")} ${String(row.last_name ?? "")}`.trim()
  const when = paidAt(row)
  const amount = serviceAmount(params.serviceType, row)
  const description = serviceDescription(params.serviceType, row)
  const method = paymentMethod(paymentStatus)
  const pdf = await buildReceiptPdf({
    patientName,
    email,
    intakeId: params.intakeId,
    description,
    amount,
    method,
    paidOn: when,
  })
  const result = await sendPatientEmailWithPdf({
    to: email,
    subject: `Payment receipt ${params.intakeId} | Clear Choice Pharmacy`,
    filename: `receipt-${params.intakeId}.pdf`,
    pdf,
    text: `Hi ${patientName || "there"},

Attached is your payment receipt for ${description}.
Reference: ${params.intakeId}
${amount == null ? "Amount: confirmed with the pharmacy" : `Amount: ${money(amount)}`}
This amount is the price on the intake.
Method: ${method}

If treatment is not approved, this payment is refunded. This receipt confirms payment. It is not a prescription.

Questions? Call ${PHARMACY_PHONE_DISPLAY} or reply to this email.

— Clear Choice Pharmacy`,
  })
  if (!result.success) {
    return { sent: false, alreadySent: false, sentAt: existing, error: result.error || "Could not email the receipt." }
  }

  const table = tableForAdminService(params.serviceType)
  const sentAt = new Date().toISOString()
  try {
    await sql(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS receipt_sent_at TIMESTAMPTZ`, [])
    await sql(`UPDATE ${table} SET receipt_sent_at = $2::timestamptz WHERE id = $1`, [params.intakeId, sentAt])
  } catch (error) {
    console.error("[payment-receipt] could not record receipt_sent_at:", error)
  }
  return { sent: true, alreadySent: false, sentAt }
}
