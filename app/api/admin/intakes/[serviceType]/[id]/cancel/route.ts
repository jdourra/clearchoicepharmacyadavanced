import { NextResponse } from "next/server"
import { staffAuth } from "@/lib/auth"
import { cancelClinicalIntakeForPatientRequest } from "@/lib/intake-admin-cancel"
import { isAdminRole } from "@/lib/staff-roles"

type RouteParams = { params: Promise<{ serviceType: string; id: string }> }

/** Pharmacy administrator cancels an intake the patient asked to stop, before payment or shipment. */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!staff || !isAdminRole(staff.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { serviceType, id } = await params
    const staffLabel = (staff.full_name || staff.email || "admin").replace(/\s+/g, "_").toLowerCase()
    const result = await cancelClinicalIntakeForPatientRequest({ serviceType, id, staffLabel })
    if (!result.success) {
      return NextResponse.json({ error: result.error || "Could not cancel intake" }, { status: 400 })
    }
    return NextResponse.json(result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Could not cancel intake"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
