import { NextResponse } from "next/server"
import { staffAuth } from "@/lib/auth"
import { isAdminRole, isClinicianRole } from "@/lib/staff-roles"
import {
  markIntakeShippedAndNotify,
  sendIntakePharmacyPaymentReminder,
  supportsPharmacyFulfillment,
  updateIntakeFulfillmentStatus,
} from "@/lib/intake-pharmacy-fulfillment"
import { isAdminIntakeServiceType } from "@/lib/telehealth/intake-registry"

type RouteParams = { params: Promise<{ serviceType: string; id: string }> }

type FulfillmentAction = "send_payment_reminder" | "mark_preparing" | "mark_shipped"

/**
 * Pharmacy fulfillment actions: payment reminder email, preparing, shipped.
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!staff || (!isAdminRole(staff.role) && !isClinicianRole(staff.role))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { serviceType, id } = await params
    if (!isAdminIntakeServiceType(serviceType) || !supportsPharmacyFulfillment(serviceType)) {
      return NextResponse.json({ error: "Fulfillment not supported for this intake type." }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const action = body.action as FulfillmentAction
    if (!action) {
      return NextResponse.json({ error: "action is required" }, { status: 400 })
    }

    const staffLabel = (staff.full_name || staff.email || "staff").replace(/\s+/g, "_").toLowerCase()

    if (action === "send_payment_reminder") {
      const result = await sendIntakePharmacyPaymentReminder({ serviceType, id })
      if (!result.success) {
        return NextResponse.json({ error: result.error || "Could not send reminder" }, { status: 400 })
      }
      return NextResponse.json({ success: true, emailSent: true })
    }

    if (action === "mark_preparing") {
      const result = await updateIntakeFulfillmentStatus({
        serviceType,
        id,
        nextStatus: "preparing",
        staffLabel,
      })
      if (!result.success) {
        return NextResponse.json({ error: result.error || "Could not update status" }, { status: 400 })
      }
      return NextResponse.json({ success: true, status: result.intake?.status })
    }

    if (action === "mark_shipped") {
      const notifyPatient = body.notifyPatient !== false
      const result = await markIntakeShippedAndNotify({
        serviceType,
        id,
        staffLabel,
        notifyPatient,
      })
      if (!result.success) {
        return NextResponse.json({ error: result.error || "Could not mark shipped" }, { status: 400 })
      }
      return NextResponse.json({
        success: true,
        status: "shipped",
        emailSent: result.emailSent,
        emailError: result.emailError,
        notifyPatient,
      })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Fulfillment action failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
