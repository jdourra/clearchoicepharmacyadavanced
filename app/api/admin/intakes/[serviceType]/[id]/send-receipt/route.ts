import { NextResponse } from "next/server"
import { staffAuth } from "@/lib/auth"
import { canEmailPaymentReceipt, emailPaymentReceipt } from "@/lib/payment-receipt"
import { isAdminRole, isClinicianRole } from "@/lib/staff-roles"

type RouteParams = { params: Promise<{ serviceType: string; id: string }> }

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!staff || (!isAdminRole(staff.role) && !isClinicianRole(staff.role))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { serviceType, id } = await params
    if (!canEmailPaymentReceipt(serviceType)) {
      return NextResponse.json({ error: "Receipts are not sent for this intake." }, { status: 400 })
    }

    let resend = false
    try {
      const body = await request.json()
      resend = body?.resend === true
    } catch {
      resend = false
    }

    const receipt = await emailPaymentReceipt({ serviceType, intakeId: id, resend })
    if (!receipt.sent) {
      return NextResponse.json({ error: receipt.error || "Could not email the receipt.", receipt }, { status: 400 })
    }
    return NextResponse.json({ success: true, receipt })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Could not email the receipt"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
