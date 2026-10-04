import { NextResponse } from "next/server"
import { staffAuth } from "@/lib/auth"
import { canReviewClinicalIntakesStaff } from "@/lib/staff-roles"
import { listClinicalIntakes } from "@/lib/telehealth/intake-registry"
import { sendIntakePatientMessage } from "@/lib/intake-patient-message"
import {
  INTAKE_CLINICIAN_DELAY_SUBJECT,
  buildClinicianDelayCourtesyBody,
} from "@/lib/intake-patient-message-copy"

export async function POST(request: Request) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!canReviewClinicalIntakesStaff(staff) || !staff) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const waiting = await listClinicalIntakes({
      status: "pending",
      limit: 500,
      createdBefore: cutoff,
    })
    const results: Array<{
      id: string
      serviceType: string
      emailed: boolean
      portalSaved: boolean
      skipped?: boolean
      error?: string
    }> = []

    for (const intake of waiting) {
      const result = await sendIntakePatientMessage({
        serviceType: intake.serviceType,
        intakeId: intake.id,
        staffId: staff.id,
        subject: INTAKE_CLINICIAN_DELAY_SUBJECT,
        body: buildClinicianDelayCourtesyBody(intake.firstName),
        noteCourtesyHold: true,
        skipIfCourtesyNoted: true,
      })
      results.push({
        id: intake.id,
        serviceType: intake.serviceType,
        emailed: result.emailed,
        portalSaved: result.portalSaved,
        skipped: result.skipped,
        error: result.error,
      })
    }

    const emailed = results.filter((r) => r.emailed).length
    const skipped = results.filter((r) => r.skipped).length
    const failed = results.filter((r) => !r.emailed && !r.skipped).length

    return NextResponse.json({
      success: failed === 0,
      eligible: waiting.length,
      emailed,
      skipped,
      failed,
      results,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to notify patients"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
