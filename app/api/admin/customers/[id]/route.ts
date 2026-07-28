import { NextResponse } from "next/server"
import { admin, staffAuth, orders } from "@/lib/auth"
import { listClinicalProgramsForCustomer } from "@/lib/admin-customer-programs"
import { getPatientPaymentSummary } from "@/lib/patient-balance"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!staff || staff.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const user = await admin.getUserById(id)
    if (!user) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    const [profile, patientOrders, clinicalPrograms, payments] = await Promise.all([
      admin.getPatientProfileById(id),
      orders.getOrdersForPatient(id),
      listClinicalProgramsForCustomer({ patientId: id, email: user.email }),
      getPatientPaymentSummary(id),
    ])

    return NextResponse.json({
      user,
      profile,
      orders: patientOrders,
      clinicalPrograms,
      payments,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load customer"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
