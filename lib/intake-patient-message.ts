import "server-only"
import { sql } from "@/lib/db"
import { messaging } from "@/lib/auth"
import { sendPatientEmail } from "@/lib/ses-mail"
import { SITE_URL } from "@/lib/site-config"
import {
  getClinicalIntakeDetail,
  isAdminIntakeServiceType,
  tableForAdminService,
  type AdminIntakeServiceType,
} from "@/lib/telehealth/intake-registry"
import {
  INTAKE_CLINICIAN_DELAY_SUBJECT,
  INTAKE_COURTESY_STAFF_TAG,
  PRIOR_INTAKE_DELAY_MARKERS,
} from "@/lib/intake-patient-message-copy"

export type SendIntakePatientMessageResult = {
  success: boolean
  emailed: boolean
  portalSaved: boolean
  courtesyNoted: boolean
  skipped?: boolean
  error?: string
  emailError?: string
}

async function resolvePatientId(detail: Record<string, unknown>): Promise<string | null> {
  const direct = detail.patient_id != null ? String(detail.patient_id).trim() : ""
  if (direct) return direct
  const email = String(detail.email ?? "")
    .trim()
    .toLowerCase()
  if (!email) return null
  const rows = await sql("SELECT id FROM patients WHERE LOWER(email) = $1 LIMIT 1", [email]).catch(
    () => []
  )
  return rows[0]?.id != null ? String(rows[0].id) : null
}

function notesAlreadyHaveCourtesy(detail: Record<string, unknown>): boolean {
  const concerns = detail.additional_concerns != null ? String(detail.additional_concerns) : ""
  const extra = detail.additional_notes != null ? String(detail.additional_notes) : ""
  return PRIOR_INTAKE_DELAY_MARKERS.some(
    (marker) => concerns.includes(marker) || extra.includes(marker)
  )
}

async function appendCourtesyStaffNote(
  serviceType: AdminIntakeServiceType,
  intakeId: string,
  current: string | null
): Promise<boolean> {
  if (PRIOR_INTAKE_DELAY_MARKERS.some((marker) => current?.includes(marker))) return true
  const table = tableForAdminService(serviceType)
  const next = current?.trim()
    ? `${current.trim()}\n${INTAKE_COURTESY_STAFF_TAG}`
    : INTAKE_COURTESY_STAFF_TAG
  try {
    await sql(`UPDATE ${table} SET additional_concerns = $2 WHERE id = $1`, [intakeId, next])
    return true
  } catch {
    try {
      await sql(`UPDATE ${table} SET additional_notes = $2 WHERE id = $1`, [intakeId, next])
      return true
    } catch {
      return false
    }
  }
}

export async function sendIntakePatientMessage(params: {
  serviceType: string
  intakeId: string
  staffId: string
  subject: string
  body: string
  noteCourtesyHold?: boolean
  skipIfCourtesyNoted?: boolean
}): Promise<SendIntakePatientMessageResult> {
  if (!isAdminIntakeServiceType(params.serviceType)) {
    return { success: false, emailed: false, portalSaved: false, courtesyNoted: false, error: "Invalid service type" }
  }

  const subject = params.subject.trim()
  const body = params.body.trim()
  if (!subject || !body) {
    return {
      success: false,
      emailed: false,
      portalSaved: false,
      courtesyNoted: false,
      error: "Subject and message are required.",
    }
  }

  const detail = await getClinicalIntakeDetail(params.serviceType, params.intakeId)
  if (!detail) {
    return {
      success: false,
      emailed: false,
      portalSaved: false,
      courtesyNoted: false,
      error: "Intake not found.",
    }
  }

  if (params.skipIfCourtesyNoted && notesAlreadyHaveCourtesy(detail)) {
    return {
      success: true,
      emailed: false,
      portalSaved: false,
      courtesyNoted: true,
      skipped: true,
    }
  }

  const to = String(detail.email ?? "").trim()
  if (!to) {
    return {
      success: false,
      emailed: false,
      portalSaved: false,
      courtesyNoted: false,
      error: "This intake has no patient email.",
    }
  }

  const patientId = await resolvePatientId(detail)
  if (params.skipIfCourtesyNoted && patientId) {
    const prior = await sql(
      `SELECT id FROM messages
       WHERE recipient_type = 'patient' AND recipient_id = $1 AND subject = $2
       LIMIT 1`,
      [patientId, subject]
    ).catch(() => [])
    if (prior.length > 0) {
      const courtesyNoted = await appendCourtesyStaffNote(
        params.serviceType,
        params.intakeId,
        detail.additional_concerns != null
          ? String(detail.additional_concerns)
          : detail.additional_notes != null
            ? String(detail.additional_notes)
            : null
      )
      return {
        success: true,
        emailed: false,
        portalSaved: true,
        courtesyNoted,
        skipped: true,
      }
    }
  }

  const portalUrl = `${SITE_URL.replace(/\/$/, "")}/account`
  const text = `${body}

You can also read this message in your patient portal:
${portalUrl}`

  const emailResult = await sendPatientEmail({ to, subject, text })
  if (!emailResult.success) {
    return {
      success: false,
      emailed: false,
      portalSaved: false,
      courtesyNoted: false,
      error: emailResult.error || "Failed to send email.",
      emailError: emailResult.error,
    }
  }

  let portalSaved = false
  if (patientId && params.staffId) {
    await messaging
      .sendMessage("staff", params.staffId, "patient", patientId, subject, body)
      .then(() => {
        portalSaved = true
      })
      .catch(() => {
        portalSaved = false
      })
  }

  let courtesyNoted = false
  if (params.noteCourtesyHold === true) {
    courtesyNoted = await appendCourtesyStaffNote(
      params.serviceType,
      params.intakeId,
      detail.additional_concerns != null
        ? String(detail.additional_concerns)
        : detail.additional_notes != null
          ? String(detail.additional_notes)
          : null
    )
  }

  return {
    success: true,
    emailed: true,
    portalSaved,
    courtesyNoted,
  }
}

export async function noteIntakeDelayCourtesy(serviceType: string, intakeId: string): Promise<boolean> {
  if (!isAdminIntakeServiceType(serviceType)) return false
  const detail = await getClinicalIntakeDetail(serviceType, intakeId)
  if (!detail || notesAlreadyHaveCourtesy(detail)) return true
  return appendCourtesyStaffNote(
    serviceType,
    intakeId,
    detail.additional_concerns != null
      ? String(detail.additional_concerns)
      : detail.additional_notes != null
        ? String(detail.additional_notes)
        : null
  )
}
