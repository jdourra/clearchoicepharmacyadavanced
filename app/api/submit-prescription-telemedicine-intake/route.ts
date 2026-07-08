import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { savePrescriptionTelemedicineIntake } from "@/lib/order-prescription-admin"
import {
  requireIntakePaymentSubmission,
  type IntakeConsents,
  type IntakePaymentMetadata,
} from "@/lib/intake-payment"
import { verifyPaymentHoldReady } from "@/lib/stripe-server"
import { submitClinicalIntakeToPartner } from "@/lib/telehealth/submit-clinical-intake"
import { STANDARD_INTAKE_STATUS } from "@/lib/telehealth/intake-status"
import { getUserIdFromRequest } from "@/lib/server-session"
import type { RequestedMedicationLine } from "@/lib/prescription-telemedicine-clinical-intake"
import { formatVisitReason, type VisitConditionId } from "@/lib/rx-visit-conditions"

function resolveVisitReason(
  intakeType: string,
  clinical: Record<string, unknown> | undefined
): string | null {
  if (intakeType === "ed_tablet") return "Erectile dysfunction"
  const selected = clinical?.selectedConditions
  if (Array.isArray(selected) && selected.length > 0) {
    return formatVisitReason(
      selected as VisitConditionId[],
      clinical?.otherConditionNotes != null ? String(clinical.otherConditionNotes) : undefined
    )
  }
  if (clinical?.primaryCondition != null) {
    return String(clinical.primaryCondition)
  }
  return null
}

type CheckoutPayload = {
  delivery_method: string
  subtotal: number
  telemedicine_fee: number
  delivery_fee: number
  total: number
  notes?: string
}

async function submitLegacyOrderLinkedIntake(
  orderId: string,
  intakeType: string,
  payload: Record<string, unknown>,
  userId: string | null
) {
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

  const saved = await savePrescriptionTelemedicineIntake(orderId, intakeType, payload)
  if (!saved) {
    return NextResponse.json({ error: "Failed to save intake. Please contact support." }, { status: 500 })
  }

  return NextResponse.json({ success: true, orderId, legacy: true })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const orderId = String(body.orderId || "").trim()
    const intakeType = String(body.intakeType || "").trim()
    const payload = body.payload

    if (!intakeType || !payload || typeof payload !== "object") {
      return NextResponse.json({ error: "Missing intakeType or payload" }, { status: 400 })
    }

    if (intakeType !== "ed_tablet" && intakeType !== "general") {
      return NextResponse.json({ error: "Invalid intake type" }, { status: 400 })
    }

    const userId = await getUserIdFromRequest(request)

    if (orderId) {
      return submitLegacyOrderLinkedIntake(orderId, intakeType, payload as Record<string, unknown>, userId)
    }

    const checkout = body.checkout as CheckoutPayload | undefined
    const requestedMedications = body.requestedMedications as RequestedMedicationLine[] | undefined
    const identity = body.identity as IntakePaymentMetadata | undefined
    const consents = body.consents as IntakeConsents | undefined

    if (!checkout || !requestedMedications?.length) {
      return NextResponse.json(
        { error: "Missing checkout context or requested medications" },
        { status: 400 }
      )
    }

    const patientInfo = (payload as Record<string, unknown>).patientInfo as Record<string, unknown> | undefined
    if (!patientInfo?.firstName || !patientInfo?.lastName || !patientInfo?.email) {
      return NextResponse.json({ error: "Missing required patient information" }, { status: 400 })
    }

    const paymentError = requireIntakePaymentSubmission(consents, identity)
    if (paymentError) {
      return NextResponse.json({ error: paymentError }, { status: 400 })
    }

    const stripeCheck = await verifyPaymentHoldReady(identity?.stripePaymentIntentId || "")
    if (!stripeCheck.ok) {
      return NextResponse.json({ error: stripeCheck.error || "Payment not authorized" }, { status: 400 })
    }

    const submissionId = `CCR-RXTM-${Date.now().toString(36).toUpperCase()}`
    const clinical = (payload as Record<string, unknown>).clinical as Record<string, unknown> | undefined
    const visitReason = resolveVisitReason(intakeType, clinical)

    const partnerResult = await submitClinicalIntakeToPartner({
      serviceType: "mens_health",
      submissionId,
      patient: {
        firstName: String(patientInfo.firstName),
        lastName: String(patientInfo.lastName),
        email: String(patientInfo.email),
        phone: patientInfo.phone != null ? String(patientInfo.phone) : undefined,
      },
      clinicalSummary: `Low-cost Rx telemedicine intake ${submissionId}\nMedications: ${requestedMedications.map((m) => m.name).join(", ")}\nReason: ${visitReason || "—"}`,
    })

    if (!partnerResult.success) {
      return NextResponse.json({ error: partnerResult.error || "Failed to queue intake" }, { status: 502 })
    }

    const rows = await sql(
      `INSERT INTO prescription_telemedicine_intake (
        id, patient_id, first_name, last_name, email, phone, date_of_birth, state, address, city, zip_code,
        intake_type, visit_reason, requested_medications, delivery_method,
        subtotal_amount, telemedicine_fee, delivery_fee, total_amount, order_notes, intake_data,
        status, stripe_payment_intent_id, id_front_key, id_back_key, partner_name, partner_status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
        $12, $13, $14::jsonb, $15,
        $16, $17, $18, $19, $20, $21::jsonb,
        $22, $23, $24, $25, $26, $27
      )
      RETURNING id`,
      [
        submissionId,
        userId,
        String(patientInfo.firstName),
        String(patientInfo.lastName),
        String(patientInfo.email),
        patientInfo.phone != null ? String(patientInfo.phone) : null,
        patientInfo.dateOfBirth != null ? String(patientInfo.dateOfBirth) : null,
        patientInfo.state != null ? String(patientInfo.state) : null,
        patientInfo.address != null ? String(patientInfo.address) : null,
        patientInfo.city != null ? String(patientInfo.city) : null,
        patientInfo.zipCode != null ? String(patientInfo.zipCode) : null,
        intakeType,
        visitReason,
        JSON.stringify(requestedMedications),
        checkout.delivery_method || "pickup",
        checkout.subtotal ?? 0,
        checkout.telemedicine_fee ?? 0,
        checkout.delivery_fee ?? 0,
        checkout.total ?? 0,
        checkout.notes || "",
        JSON.stringify(payload),
        STANDARD_INTAKE_STATUS.pending,
        identity?.stripePaymentIntentId || null,
        identity?.idFrontKey || null,
        identity?.idBackKey || null,
        partnerResult.mode === "api" ? "partner" : "manual",
        partnerResult.mode === "api" ? "submitted" : "manual_queue",
      ]
    )

    if (rows.length === 0) {
      return NextResponse.json({ error: "Failed to save intake" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      submissionId,
      intakeId: submissionId,
    })
  } catch (error) {
    console.error("[submit-prescription-telemedicine-intake]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
