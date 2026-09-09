import { NextRequest, NextResponse } from "next/server"
import {
  getTherapyCheckInByToken,
  submitTherapyCheckInResponse,
} from "@/lib/patient-therapy-checkin"
import { sql } from "@/lib/db"

type RouteParams = { params: Promise<{ token: string }> }

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params
    const row = await getTherapyCheckInByToken(token)
    if (!row) {
      return NextResponse.json({ error: "Invalid check-in link" }, { status: 404 })
    }

    const intakes = await sql(
      `SELECT first_name, selected_program, selected_dose_tier FROM weight_loss_intake WHERE id = $1`,
      [String(row.intake_id)]
    ).catch(() => [])
    const intake = intakes[0] as Record<string, unknown> | undefined

    return NextResponse.json({
      checkIn: {
        monthLabel: row.month_label,
        respondedAt: row.responded_at,
        tolerating: row.tolerating,
        weightLostLbs: row.weight_lost_lbs,
        sideEffects: row.side_effects,
        notes: row.notes,
      },
      patientFirstName: intake?.first_name ?? null,
      program: intake?.selected_program ?? null,
    })
  } catch (error) {
    console.error("[therapy-checkin GET]", error)
    return NextResponse.json({ error: "Failed to load check-in" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
    const tolerating = body.tolerating === true || body.tolerating === "true" || body.tolerating === "yes"
    const notTolerating =
      body.tolerating === false || body.tolerating === "false" || body.tolerating === "no"
    if (!tolerating && !notTolerating) {
      return NextResponse.json({ error: "Please indicate whether you are tolerating therapy." }, { status: 400 })
    }

    const weightRaw = body.weightLostLbs
    const weightLostLbs =
      weightRaw === "" || weightRaw == null
        ? null
        : Number.isFinite(Number(weightRaw))
          ? Number(weightRaw)
          : null

    const result = await submitTherapyCheckInResponse({
      token,
      tolerating,
      weightLostLbs,
      sideEffects: typeof body.sideEffects === "string" ? body.sideEffects : undefined,
      notes: typeof body.notes === "string" ? body.notes : undefined,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[therapy-checkin POST]", error)
    return NextResponse.json({ error: "Failed to save check-in" }, { status: 500 })
  }
}
