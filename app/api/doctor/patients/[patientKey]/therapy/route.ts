import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { staffAuth } from "@/lib/auth"
import { canReviewClinicalIntakesStaff } from "@/lib/staff-roles"
import {
  createAndSendTherapyCheckIn,
  getTherapyTimelineForPatient,
} from "@/lib/patient-therapy-checkin"

type RouteParams = { params: Promise<{ patientKey: string }> }

/** patientKey = patient UUID or email (encoded). */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!canReviewClinicalIntakesStaff(staff)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { patientKey } = await params
    const key = decodeURIComponent(patientKey)
    const isEmail = key.includes("@")

    let patientId: string | null = isEmail ? null : key
    let email: string | null = isEmail ? key.toLowerCase() : null
    let patientName: string | null = null

    if (patientId) {
      const users = await sql(
        `SELECT id, email, first_name, last_name FROM patients WHERE id = $1 LIMIT 1`,
        [patientId]
      ).catch(() => [])
      if (users[0]) {
        email = String(users[0].email ?? "")
        patientName = `${users[0].first_name ?? ""} ${users[0].last_name ?? ""}`.trim()
      }
    }

    const timeline = await getTherapyTimelineForPatient({
      patientId,
      email,
      patientName,
    })

    return NextResponse.json({ timeline })
  } catch (error) {
    console.error("[doctor/patients/therapy] GET", error)
    return NextResponse.json({ error: "Failed to load therapy timeline" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!canReviewClinicalIntakesStaff(staff)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    void params
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
    const intakeId = typeof body.intakeId === "string" ? body.intakeId : ""
    const monthIndex = Number(body.monthIndex)
    const forceResend = Boolean(body.forceResend)

    if (!intakeId || !Number.isFinite(monthIndex)) {
      return NextResponse.json({ error: "intakeId and monthIndex are required" }, { status: 400 })
    }

    const result = await createAndSendTherapyCheckIn({
      intakeId,
      monthIndex,
      forceResend: forceResend || true,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const intakeRows = await sql(
      `SELECT patient_id, email, first_name, last_name FROM weight_loss_intake WHERE id = $1`,
      [intakeId]
    ).catch(() => [])
    const intake = intakeRows[0] as Record<string, unknown> | undefined

    const timeline = await getTherapyTimelineForPatient({
      patientId: intake?.patient_id != null ? String(intake.patient_id) : null,
      email: intake?.email != null ? String(intake.email) : null,
      patientName: intake
        ? `${intake.first_name ?? ""} ${intake.last_name ?? ""}`.trim()
        : null,
    })

    return NextResponse.json({ success: true, timeline })
  } catch (error) {
    console.error("[doctor/patients/therapy] POST", error)
    return NextResponse.json({ error: "Failed to send check-in" }, { status: 500 })
  }
}
