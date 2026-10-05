import "server-only"
import { sql } from "@/lib/db"
import { listClinicalIntakes } from "@/lib/telehealth/intake-registry"
import {
  noteIntakeDelayCourtesy,
  sendIntakePatientMessage,
} from "@/lib/intake-patient-message"
import {
  INTAKE_CLINICIAN_DELAY_SUBJECT,
  INTAKE_DELAY_NOTICE_MIN_AGE_MS,
  buildClinicianDelayCourtesyBody,
} from "@/lib/intake-patient-message-copy"

export type IntakeDelayNoticeBatchResult = {
  eligible: number
  emailed: number
  skipped: number
  failed: number
  results: Array<{
    id: string
    serviceType: string
    emailed: boolean
    skipped?: boolean
    error?: string
  }>
}

async function resolveNoticeStaffId(): Promise<string | null> {
  const rows = await sql(
    `SELECT id FROM staff_users
     WHERE is_active = true
     ORDER BY CASE WHEN role = 'admin' THEN 0 ELSE 1 END
     LIMIT 1`
  ).catch(() => [])
  return rows[0]?.id != null ? String(rows[0].id) : null
}

/**
 * Email each pending intake that has been waiting more than one day.
 * One email per patient address. Intakes already marked, or patients who
 * already received this subject, are skipped.
 */
export async function sendDueIntakeDelayNotices(
  staffId?: string
): Promise<IntakeDelayNoticeBatchResult> {
  const senderId = staffId || (await resolveNoticeStaffId()) || ""
  const cutoff = new Date(Date.now() - INTAKE_DELAY_NOTICE_MIN_AGE_MS)
  const waiting = await listClinicalIntakes({
    status: "pending",
    limit: 500,
    createdBefore: cutoff,
  })

  const alreadyHandled = new Set<string>()
  const failedAddresses = new Set<string>()
  const results: IntakeDelayNoticeBatchResult["results"] = []

  for (const intake of waiting) {
    const emailKey = intake.email.trim().toLowerCase()
    if (!emailKey) {
      results.push({
        id: intake.id,
        serviceType: intake.serviceType,
        emailed: false,
        error: "This intake has no patient email.",
      })
      continue
    }

    if (alreadyHandled.has(emailKey)) {
      await noteIntakeDelayCourtesy(intake.serviceType, intake.id)
      results.push({
        id: intake.id,
        serviceType: intake.serviceType,
        emailed: false,
        skipped: true,
      })
      continue
    }

    if (failedAddresses.has(emailKey)) {
      results.push({
        id: intake.id,
        serviceType: intake.serviceType,
        emailed: false,
        error: "Email already failed for this patient in this run.",
      })
      continue
    }

    const result = await sendIntakePatientMessage({
      serviceType: intake.serviceType,
      intakeId: intake.id,
      staffId: senderId,
      subject: INTAKE_CLINICIAN_DELAY_SUBJECT,
      body: buildClinicianDelayCourtesyBody(intake.firstName),
      noteCourtesyHold: true,
      skipIfCourtesyNoted: true,
    })

    if (result.emailed || result.skipped) {
      alreadyHandled.add(emailKey)
    } else {
      failedAddresses.add(emailKey)
    }

    results.push({
      id: intake.id,
      serviceType: intake.serviceType,
      emailed: result.emailed,
      skipped: result.skipped,
      error: result.error,
    })
  }

  return {
    eligible: waiting.length,
    emailed: results.filter((row) => row.emailed).length,
    skipped: results.filter((row) => row.skipped).length,
    failed: results.filter((row) => !row.emailed && !row.skipped).length,
    results,
  }
}
