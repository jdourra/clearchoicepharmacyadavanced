import { NextResponse } from "next/server"
import { staffAuth } from "@/lib/auth"
import { sql } from "@/lib/db"
import { isAdminRole, isClinicianRole } from "@/lib/staff-roles"
import { notifyClinicianQueue } from "@/lib/telehealth/manual-queue"
import { isAdminIntakeServiceType, tableForAdminService } from "@/lib/telehealth/intake-registry"

type RouteParams = { params: Promise<{ serviceType: string; id: string }> }

const TRANSFER_SERVICES = new Set(["mens_health", "trt", "prescription_telemedicine"])

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!staff || (!isAdminRole(staff.role) && !isClinicianRole(staff.role))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { serviceType, id } = await params
    if (!isAdminIntakeServiceType(serviceType) || !TRANSFER_SERVICES.has(serviceType)) {
      return NextResponse.json({ error: "This intake is confirmed from the weight-loss payment button." }, { status: 400 })
    }

    const table = tableForAdminService(serviceType)
    const rows = await sql(`SELECT id, first_name, last_name, email, payment_status, partner_status FROM ${table} WHERE id = $1 LIMIT 1`, [id]).catch(() => [])
    const intake = rows[0] as Record<string, unknown> | undefined
    if (!intake) {
      return NextResponse.json({ error: "Intake not found" }, { status: 404 })
    }

    const paymentStatus = String(intake.payment_status || "")
    if (paymentStatus === "paid_zelle") {
      return NextResponse.json({
        success: true,
        alreadySent: true,
        transactionId: id,
        orderId: id,
        sentAt: null,
      })
    }

    await sql(
      `UPDATE ${table}
       SET payment_status = 'paid_zelle', partner_status = 'queued_for_manual_review'
       WHERE id = $1`,
      [id]
    )

    const name = `${String(intake.first_name || "")} ${String(intake.last_name || "")}`.trim()
    await notifyClinicianQueue({
      submissionId: id,
      subject: `[${serviceType.toUpperCase()} ${id}] Payment received — ${name}`,
      body: `Zelle or Venmo payment was confirmed for ${name} (${String(intake.email || "")}). Review intake ${id} in the admin.`,
    })

    return NextResponse.json({
      success: true,
      alreadySent: false,
      transactionId: id,
      orderId: id,
      sentAt: new Date().toISOString(),
      detail: "Payment confirmed. The intake is ready for review.",
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Could not confirm this payment"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
