import { NextRequest, NextResponse } from "next/server"
import { admin, staffAuth } from "@/lib/auth"
import { canReviewClinicalIntakesStaff } from "@/lib/staff-roles"
import {
  createAndSendTherapyCheckIn,
  getTherapyTimelineForPatient,
} from "@/lib/patient-therapy-checkin"

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!canReviewClinicalIntakesStaff(staff)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const user = await admin.getUserById(id)
    if (!user) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    const timeline = await getTherapyTimelineForPatient({
      patientId: id,
      email: user.email,
      patientName: user.name,
    })

    return NextResponse.json({ timeline })
  } catch (error) {
    console.error("[admin/customers/therapy] GET", error)
    return NextResponse.json({ error: "Failed to load therapy timeline" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!canReviewClinicalIntakesStaff(staff)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
    const intakeId = typeof body.intakeId === "string" ? body.intakeId : ""
    const monthIndex = Number(body.monthIndex)
    const forceResend = Boolean(body.forceResend)

    if (!intakeId || !Number.isFinite(monthIndex)) {
      return NextResponse.json({ error: "intakeId and monthIndex are required" }, { status: 400 })
    }

    // Ensure intake belongs to this customer
    const user = await admin.getUserById(id)
    if (!user) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    const result = await createAndSendTherapyCheckIn({
      intakeId,
      monthIndex,
      forceResend,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const timeline = await getTherapyTimelineForPatient({
      patientId: id,
      email: user.email,
      patientName: user.name,
    })

    return NextResponse.json({ success: true, timeline })
  } catch (error) {
    console.error("[admin/customers/therapy] POST", error)
    return NextResponse.json({ error: "Failed to send check-in" }, { status: 500 })
  }
}
