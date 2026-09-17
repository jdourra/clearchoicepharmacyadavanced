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
import { INTAKE_COURTESY_STAFF_TAG } from "@/lib/intake-patient-message-copy"

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
  return concerns.includes("courtesy_10pct_if_approved") || extra.includes("courtesy_10pct_if_approved")
}

async function appendCourtesyStaffNote(
  serviceType: AdminIntakeServiceType,
  intakeId: string,
  current: string | null
): Promise<boolean> {
  if (current?.includes("courtesy_10pct_if_approved")) return true
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

  const portalUrl = `${SITE_URL.replace(/\/$/, "")}/account`
  const text = `${body}

You can also read this message in your patient portal:
${portalUrl}`

  const emailResult = await sendPatientEmail({ to, subject, text })

  let portalSaved = false
  const patientId = await resolvePatientId(detail)
  if (patientId) {
    await messaging.sendMessage(
      "staff",
      params.staffId,
      "patient",
      patientId,
      subject,
      body
    )
    portalSaved = true
  }

  let courtesyNoted = false
  if (params.noteCourtesyHold !== false) {
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

  if (!emailResult.success) {
    return {
      success: portalSaved,
      emailed: false,
      portalSaved,
      courtesyNoted,
      error: portalSaved
        ? "Saved to the patient portal, but email failed."
        : emailResult.error || "Failed to send email.",
      emailError: emailResult.error,
    }
  }

  return {
    success: true,
    emailed: true,
    portalSaved,
    courtesyNoted,
  }
}
