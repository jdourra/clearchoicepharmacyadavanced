import { NextResponse } from "next/server"
import { staffAuth } from "@/lib/auth"
import { sql } from "@/lib/db"
import { parseGlp1Protocol, protocolQuestionPairs } from "@/lib/glp1-intake-protocol"
import { handoffWeightLossToOla } from "@/lib/ola/weight-loss-handoff"
import { isAdminRole, isClinicianRole } from "@/lib/staff-roles"
import { STANDARD_INTAKE_STATUS } from "@/lib/telehealth/intake-status"
import { getWeightLossDose } from "@/lib/weight-loss-catalog"

type RouteParams = { params: Promise<{ id: string }> }

function isoDate(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10)
  }
  const text = String(value ?? "")
  return text.match(/^(\d{4}-\d{2}-\d{2})/)?.[1] || text
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!staff || (!isAdminRole(staff.role) && !isClinicianRole(staff.role))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await sql(`ALTER TABLE weight_loss_intake ADD COLUMN IF NOT EXISTS protocol_answers JSONB`, []).catch(() => [])
    await sql(`ALTER TABLE weight_loss_intake ADD COLUMN IF NOT EXISTS gender TEXT`, []).catch(() => [])
    await sql(`ALTER TABLE weight_loss_intake ADD COLUMN IF NOT EXISTS visit_schedule JSONB`, []).catch(() => [])
    await sql(`ALTER TABLE weight_loss_intake ADD COLUMN IF NOT EXISTS partner_case_id TEXT`, []).catch(() => [])
    await sql(`ALTER TABLE weight_loss_intake ADD COLUMN IF NOT EXISTS ola_patient_guid TEXT`, []).catch(() => [])
    await sql(`ALTER TABLE weight_loss_intake ADD COLUMN IF NOT EXISTS ola_sent_at TIMESTAMPTZ`, []).catch(() => [])

    const rows = await sql(`SELECT * FROM weight_loss_intake WHERE id = $1 LIMIT 1`, [id]).catch(() => [])
    const intake = rows[0] as Record<string, unknown> | undefined
    if (!intake) {
      return NextResponse.json({ error: "Intake not found" }, { status: 404 })
    }

    const status = String(intake.status || "")
    if (status === STANDARD_INTAKE_STATUS.denied || status === STANDARD_INTAKE_STATUS.cancelled) {
      return NextResponse.json({ error: "This intake is closed and was not sent." }, { status: 400 })
    }

    const existingOrder = String(intake.partner_case_id || "")
    if (String(intake.partner_status || "") === "sent_to_clinician_network" && existingOrder) {
      return NextResponse.json({
        success: true,
        alreadySent: true,
        transactionId: id,
        orderId: existingOrder,
        sentAt: intake.ola_sent_at ? new Date(String(intake.ola_sent_at)).toISOString() : null,
      })
    }

    const gender = intake.gender
    if (gender !== "male" && gender !== "female" && gender !== "other") {
      return NextResponse.json(
        { error: "Sex assigned at birth was not saved on this intake, so it cannot be sent." },
        { status: 400 }
      )
    }

    const protocol = parseGlp1Protocol(intake.protocol_answers)
    const billingPlan = String(intake.selected_billing_plan || "") === "quarterly" ? "quarterly" : "monthly"
    const program = String(intake.selected_program || "")
    const dose = getWeightLossDose(program, String(intake.selected_dose_tier || ""))
    const bmi = Number(intake.bmi)
    const visitRaw = asRecord(intake.visit_schedule)
    const schedule =
      visitRaw &&
      typeof visitRaw.scheduleStart === "string" &&
      typeof visitRaw.scheduleEnd === "string" &&
      typeof visitRaw.providerGuid === "string"
        ? {
            scheduleStart: visitRaw.scheduleStart,
            scheduleEnd: visitRaw.scheduleEnd,
            providerGuid: visitRaw.providerGuid,
          }
        : null

    const handoff = await handoffWeightLossToOla(
      {
        submissionId: id,
        firstName: String(intake.first_name || ""),
        lastName: String(intake.last_name || ""),
        email: String(intake.email || ""),
        phone: String(intake.phone || ""),
        dateOfBirth: isoDate(intake.date_of_birth),
        gender,
        address: String(intake.address || ""),
        city: String(intake.city || ""),
        state: String(intake.state || ""),
        zipCode: String(intake.zip_code || ""),
        program,
        billingPlan,
        doseLabel: dose?.label || String(intake.selected_dose_tier || ""),
        allergies: String(intake.allergies || ""),
        paymentOnFile: true,
        paymentNote: "Paid by Zelle to Clear Choice Pharmacy. Staff confirmed the payment before this consult was sent.",
        questions: [
          { question: "Program", answer: program },
          { question: "Billing plan", answer: billingPlan },
          { question: "Height inches", answer: String(intake.height_inches ?? "") },
          { question: "Weight lbs", answer: String(intake.weight_lbs ?? "") },
          ...protocolQuestionPairs(protocol, {
            sex: gender,
            threeMonth: billingPlan === "quarterly",
            bmi: Number.isFinite(bmi) && bmi > 0 ? bmi : null,
          }),
        ],
        schedule,
        idFrontKey: typeof intake.id_front_key === "string" ? intake.id_front_key : null,
        idBackKey: typeof intake.id_back_key === "string" ? intake.id_back_key : null,
        medicationPhotoKeys: protocol.medicationPhotoKeys,
        existingPatientGuid: typeof intake.ola_patient_guid === "string" ? intake.ola_patient_guid : null,
      },
      { staffConfirmedPayment: true }
    )

    const sentAt = new Date().toISOString()
    if (handoff.partnerStatus !== "sent_to_clinician_network" || !handoff.partnerCaseId) {
      if (handoff.patientGuid) {
        await sql(
          `UPDATE weight_loss_intake
           SET ola_patient_guid = $2, partner_status = $3, updated_at = NOW()
           WHERE id = $1`,
          [id, handoff.patientGuid, handoff.partnerStatus]
        ).catch(() => [])
      }
      return NextResponse.json({ error: handoff.detail }, { status: 502 })
    }

    await sql(
      `UPDATE weight_loss_intake
       SET payment_status = 'paid_zelle',
           partner_name = $2,
           partner_status = $3,
           partner_case_id = $4,
           ola_patient_guid = $5,
           ola_sent_at = $6::timestamptz,
           updated_at = NOW()
       WHERE id = $1`,
      [id, handoff.partnerName, handoff.partnerStatus, handoff.partnerCaseId, handoff.patientGuid, sentAt]
    )

    return NextResponse.json({
      success: true,
      alreadySent: false,
      transactionId: id,
      orderId: handoff.partnerCaseId,
      sentAt,
      detail: handoff.detail,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Could not send this intake"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
