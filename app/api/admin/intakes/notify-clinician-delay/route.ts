import { NextResponse } from "next/server"
import { staffAuth } from "@/lib/auth"
import { canReviewClinicalIntakesStaff } from "@/lib/staff-roles"
import { sendDueIntakeDelayNotices } from "@/lib/intake-delay-notice"

export async function POST(request: Request) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!canReviewClinicalIntakesStaff(staff) || !staff) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await sendDueIntakeDelayNotices(staff.id)
    return NextResponse.json({
      success: result.failed === 0,
      ...result,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to notify patients"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
