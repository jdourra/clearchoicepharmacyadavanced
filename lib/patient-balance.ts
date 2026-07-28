import "server-only"
import { randomUUID } from "crypto"
import { sql } from "@/lib/db"
import { sendPatientEmail } from "@/lib/ses-mail"
import { SITE_URL } from "@/lib/site-config"
import {
  createBalanceCheckoutSession,
  getPaymentIntentIdFromSession,
  getStripe,
  isStripeConfigured,
} from "@/lib/stripe-server"
import type {
  PatientBalanceRequest,
  PatientLedgerEntry,
} from "@/lib/patient-balance-types"
import type Stripe from "stripe"

export type {
  BalanceRequestStatus,
  PatientBalanceRequest,
  PatientLedgerEntry,
} from "@/lib/patient-balance-types"

function mapRequest(row: Record<string, unknown>): PatientBalanceRequest {
  const amountCents = Number(row.amount_cents ?? 0)
  return {
    id: String(row.id),
    patientId: String(row.patient_id),
    amountCents,
    amount: amountCents / 100,
    description: String(row.description ?? "Balance due"),
    status: String(row.status ?? "pending"),
    paymentUrl: row.payment_url != null ? String(row.payment_url) : null,
    emailedTo: row.emailed_to != null ? String(row.emailed_to) : null,
    stripeCheckoutSessionId:
      row.stripe_checkout_session_id != null ? String(row.stripe_checkout_session_id) : null,
    stripePaymentIntentId:
      row.stripe_payment_intent_id != null ? String(row.stripe_payment_intent_id) : null,
    paidAt: row.paid_at != null ? String(row.paid_at) : null,
    createdAt: String(row.created_at ?? new Date().toISOString()),
  }
}

function mapLedger(row: Record<string, unknown>): PatientLedgerEntry {
  const amountCents = Number(row.amount_cents ?? 0)
  return {
    id: String(row.id),
    patientId: String(row.patient_id),
    amountCents,
    amount: amountCents / 100,
    source: String(row.source ?? "manual"),
    sourceId: row.source_id != null ? String(row.source_id) : null,
    note: row.note != null ? String(row.note) : null,
    stripePaymentIntentId:
      row.stripe_payment_intent_id != null ? String(row.stripe_payment_intent_id) : null,
    createdAt: String(row.created_at ?? new Date().toISOString()),
  }
}

export async function listBalanceRequestsForPatient(patientId: string): Promise<PatientBalanceRequest[]> {
  const rows = await sql(
    `SELECT * FROM patient_balance_requests WHERE patient_id = $1 ORDER BY created_at DESC`,
    [patientId]
  ).catch(() => [])
  return rows.map((r: Record<string, unknown>) => mapRequest(r))
}

export async function listLedgerForPatient(patientId: string): Promise<PatientLedgerEntry[]> {
  const rows = await sql(
    `SELECT * FROM patient_payment_ledger WHERE patient_id = $1 ORDER BY created_at DESC`,
    [patientId]
  ).catch(() => [])
  return rows.map((r: Record<string, unknown>) => mapLedger(r))
}

export async function getPatientPaymentSummary(patientId: string): Promise<{
  totalReceived: number
  pendingRequested: number
  balanceRequests: PatientBalanceRequest[]
  ledger: PatientLedgerEntry[]
}> {
  const [balanceRequests, ledger] = await Promise.all([
    listBalanceRequestsForPatient(patientId),
    listLedgerForPatient(patientId),
  ])

  const totalReceived = ledger.reduce((sum, e) => sum + e.amount, 0)
  const pendingRequested = balanceRequests
    .filter((r) => r.status === "pending")
    .reduce((sum, r) => sum + r.amount, 0)

  return { totalReceived, pendingRequested, balanceRequests, ledger }
}

export async function recordManualPatientPayment(params: {
  patientId: string
  amountDollars: number
  note: string
  stripePaymentIntentId?: string | null
  staffId?: string | null
}): Promise<PatientLedgerEntry> {
  const amountCents = Math.round(params.amountDollars * 100)
  if (!Number.isFinite(amountCents) || amountCents < 1) {
    throw new Error("Amount must be at least $0.01")
  }

  const id = `PAY-${randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()}`
  const rows = await sql(
    `INSERT INTO patient_payment_ledger (
      id, patient_id, amount_cents, source, source_id, note, stripe_payment_intent_id, created_by_staff_id
    ) VALUES ($1, $2, $3, 'manual', NULL, $4, $5, $6)
    RETURNING *`,
    [
      id,
      params.patientId,
      amountCents,
      params.note.trim() || "Prior payment recorded by staff",
      params.stripePaymentIntentId?.trim() || null,
      params.staffId || null,
    ]
  )

  return mapLedger(rows[0] as Record<string, unknown>)
}

export async function createAndEmailBalanceRequest(params: {
  patientId: string
  patientEmail: string
  patientName: string
  amountDollars: number
  description: string
  staffId?: string | null
}): Promise<{ request: PatientBalanceRequest; emailSent: boolean; emailError?: string }> {
  if (!isStripeConfigured()) {
    throw new Error("Stripe is not configured on this server.")
  }

  const amountCents = Math.round(params.amountDollars * 100)
  if (!Number.isFinite(amountCents) || amountCents < 1) {
    throw new Error("Amount must be at least $0.01")
  }

  const email = params.patientEmail.trim().toLowerCase()
  if (!email) throw new Error("Patient email is required")

  const description = params.description.trim() || "Balance due — Clear Choice Pharmacy"
  const id = `BAL-${randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()}`

  const { sessionId, url } = await createBalanceCheckoutSession({
    balanceRequestId: id,
    patientId: params.patientId,
    email,
    amountCents,
    description,
    successUrl: `${SITE_URL}/pay/balance/success?request=${encodeURIComponent(id)}`,
    cancelUrl: `${SITE_URL}/pay/balance/cancel?request=${encodeURIComponent(id)}`,
  })

  const rows = await sql(
    `INSERT INTO patient_balance_requests (
      id, patient_id, amount_cents, description, status,
      stripe_checkout_session_id, payment_url, emailed_to, created_by_staff_id
    ) VALUES ($1, $2, $3, $4, 'pending', $5, $6, $7, $8)
    RETURNING *`,
    [id, params.patientId, amountCents, description, sessionId, url, email, params.staffId || null]
  )

  const request = mapRequest(rows[0] as Record<string, unknown>)
  const amountLabel = `$${(amountCents / 100).toFixed(2)}`

  const emailResult = await sendPatientEmail({
    to: email,
    subject: `Payment request from Clear Choice Pharmacy — ${amountLabel}`,
    text: [
      `Hello ${params.patientName || "there"},`,
      "",
      `Clear Choice Pharmacy is requesting a payment of ${amountLabel}.`,
      "",
      `Reason: ${description}`,
      "",
      "Please pay securely using this link:",
      url,
      "",
      "If you have questions, reply to this email or call (248) 987-6182.",
      "",
      "Clear Choice Pharmacy",
      "40890 Grand River Ave, Novi, MI 48375",
    ].join("\n"),
    html: `
      <p>Hello ${escapeHtml(params.patientName || "there")},</p>
      <p>Clear Choice Pharmacy is requesting a payment of <strong>${amountLabel}</strong>.</p>
      <p><strong>Reason:</strong> ${escapeHtml(description)}</p>
      <p><a href="${url}" style="display:inline-block;background:#0f766e;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:600;">Pay ${amountLabel} now</a></p>
      <p style="font-size:13px;color:#555;">Or open this link:<br/><a href="${url}">${url}</a></p>
      <p>Questions? Reply to this email or call (248) 987-6182.</p>
      <p>Clear Choice Pharmacy<br/>40890 Grand River Ave, Novi, MI 48375</p>
    `,
  })

  return {
    request,
    emailSent: emailResult.success,
    emailError: emailResult.error,
  }
}

export async function markBalanceRequestPaidFromSession(
  session: Stripe.Checkout.Session
): Promise<boolean> {
  const requestId = session.metadata?.balance_request_id
  if (!requestId || session.payment_status !== "paid") return false

  const paymentIntentId = getPaymentIntentIdFromSession(session)
  const existing = await sql(
    `SELECT * FROM patient_balance_requests WHERE id = $1 LIMIT 1`,
    [requestId]
  ).catch(() => [])

  if (!existing[0]) return false
  const row = existing[0] as Record<string, unknown>
  if (String(row.status) === "paid") return true

  await sql(
    `UPDATE patient_balance_requests
     SET status = 'paid',
         stripe_payment_intent_id = COALESCE($2, stripe_payment_intent_id),
         paid_at = NOW(),
         updated_at = NOW()
     WHERE id = $1`,
    [requestId, paymentIntentId]
  )

  const existingLedger = await sql(
    `SELECT id FROM patient_payment_ledger WHERE source = 'balance_request' AND source_id = $1 LIMIT 1`,
    [requestId]
  ).catch(() => [])

  if (existingLedger.length === 0) {
    const ledgerId = `PAY-${randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()}`
    await sql(
      `INSERT INTO patient_payment_ledger (
        id, patient_id, amount_cents, source, source_id, note, stripe_payment_intent_id
      ) VALUES ($1, $2, $3, 'balance_request', $4, $5, $6)`,
      [
        ledgerId,
        String(row.patient_id),
        Number(row.amount_cents),
        requestId,
        String(row.description ?? "Balance payment"),
        paymentIntentId,
      ]
    )
  }

  return true
}

export async function syncBalanceRequestFromStripe(requestId: string): Promise<PatientBalanceRequest | null> {
  const rows = await sql(`SELECT * FROM patient_balance_requests WHERE id = $1 LIMIT 1`, [requestId]).catch(
    () => []
  )
  if (!rows[0]) return null
  const request = mapRequest(rows[0] as Record<string, unknown>)
  if (request.status === "paid" || !request.stripeCheckoutSessionId || !isStripeConfigured()) {
    return request
  }

  const stripe = getStripe()
  const session = await stripe.checkout.sessions.retrieve(request.stripeCheckoutSessionId, {
    expand: ["payment_intent"],
  })
  if (session.payment_status === "paid") {
    await markBalanceRequestPaidFromSession(session)
    const refreshed = await sql(`SELECT * FROM patient_balance_requests WHERE id = $1 LIMIT 1`, [requestId])
    return refreshed[0] ? mapRequest(refreshed[0] as Record<string, unknown>) : request
  }
  return request
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
