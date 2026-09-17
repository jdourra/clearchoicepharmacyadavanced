import { NextResponse } from "next/server"
import { staffAuth } from "@/lib/auth"
import { canReviewClinicalIntakesStaff } from "@/lib/staff-roles"
import { sendIntakePatientMessage } from "@/lib/intake-patient-message"

type RouteParams = { params: Promise<{ serviceType: string; id: string }> }

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!canReviewClinicalIntakesStaff(staff) || !staff) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { serviceType, id } = await params
    const body = (await request.json()) as Record<string, unknown>
    const subject = typeof body.subject === "string" ? body.subject : ""
    const message = typeof body.body === "string" ? body.body : ""
    const noteCourtesyHold = body.noteCourtesyHold !== false

    const result = await sendIntakePatientMessage({
      serviceType,
      intakeId: id,
      staffId: staff.id,
      subject,
      body: message,
      noteCourtesyHold,
    })

    if (!result.success && !result.portalSaved && !result.emailed) {
      return NextResponse.json({ error: result.error || "Failed to send message" }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to send message"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
