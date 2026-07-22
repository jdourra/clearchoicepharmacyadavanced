import { NextRequest, NextResponse } from "next/server"
import { staffAuth } from "@/lib/auth"
import { reviewClinicalIntake, type IntakeReviewAction } from "@/lib/telehealth/review-intake"

type RouteParams = { params: Promise<{ serviceType: string; id: string }> }

const VALID_ACTIONS: IntakeReviewAction[] = ["approve", "deny", "follow_up"]

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!staff || staff.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { serviceType, id } = await params
    const body = await request.json()
    const action = body.action as IntakeReviewAction
    const note = typeof body.note === "string" ? body.note.trim() : undefined
    const liveVisitRequired = Boolean(body.liveVisitRequired)

    if (!VALID_ACTIONS.includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const result = await reviewClinicalIntake({
      serviceType,
      id,
      action,
      note,
      liveVisitRequired: serviceType === "weight_loss" ? liveVisitRequired : undefined,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error, paymentAction: result.paymentAction }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Review failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
