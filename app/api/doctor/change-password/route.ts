import { NextResponse } from "next/server"
import { staffAuth } from "@/lib/auth"
import { isClinicianRole } from "@/lib/staff-roles"

export async function POST(request: Request) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!staff || !isClinicianRole(staff.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await request.json()) as {
      currentPassword?: string
      newPassword?: string
      confirmPassword?: string
    }

    const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : ""
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : ""
    const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : ""

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required." },
        { status: 400 }
      )
    }
    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "New passwords do not match." }, { status: 400 })
    }

    const result = await staffAuth.changePassword({
      staffId: staff.id,
      currentPassword,
      newPassword,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Could not change password"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
