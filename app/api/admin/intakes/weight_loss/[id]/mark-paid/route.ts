import { NextResponse } from "next/server"
import { staffAuth } from "@/lib/auth"
import { sql } from "@/lib/db"
import { isAdminRole, isClinicianRole } from "@/lib/staff-roles"
import { STANDARD_INTAKE_STATUS } from "@/lib/telehealth/intake-status"

const PAID_STATUSES = new Set(["captured", "paid_in_person"])

type RouteParams = { params: Promise<{ id: string }> }

/**
 * Pharmacy marks a weight-loss intake paid after collecting payment
 * on the in-store terminal, by phone, or cash. No card data is stored.
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!staff || (!isAdminRole(staff.role) && !isClinicianRole(staff.role))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const method =
      body.method === "cash" || body.method === "phone" || body.method === "terminal"
        ? body.method
        : "terminal"

    const rows = await sql(
      `SELECT id, status, payment_status, stripe_payment_intent_id
       FROM weight_loss_intake WHERE id = $1 LIMIT 1`,
      [id]
    ).catch(() => [])

    const intake = rows[0] as
      | {
          id: string
          status: string
          payment_status: string | null
          stripe_payment_intent_id: string | null
        }
      | undefined

    if (!intake) {
      return NextResponse.json({ error: "Intake not found" }, { status: 404 })
    }

    if (intake.stripe_payment_intent_id) {
      return NextResponse.json(
        {
          error:
            "This intake has an online Stripe hold. Capture or release it from the doctor review actions instead.",
        },
        { status: 400 }
      )
    }

    if (PAID_STATUSES.has(String(intake.payment_status || ""))) {
      return NextResponse.json(
        { error: "Intake is already marked paid", paymentStatus: intake.payment_status },
        { status: 400 }
      )
    }

    const status = String(intake.status || "")
    const allowedClinical = new Set<string>([
      STANDARD_INTAKE_STATUS.approved,
      STANDARD_INTAKE_STATUS.preparing,
      STANDARD_INTAKE_STATUS.shipped,
      STANDARD_INTAKE_STATUS.completed,
    ])
    if (!allowedClinical.has(status)) {
      return NextResponse.json(
        {
          error:
            "Mark paid only after clinician approval (Rx at pharmacy or later fulfillment status).",
        },
        { status: 400 }
      )
    }

    const staffLabel = (staff.full_name || staff.email || "staff").replace(/\s+/g, "_").toLowerCase()
    const partnerStatus = `paid_${method}_by_${staffLabel}`

    const updated = await sql(
      `UPDATE weight_loss_intake
       SET payment_status = $1,
           partner_status = $2,
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, payment_status, partner_status, status`,
      ["paid_in_person", partnerStatus, id]
    ).catch(() => [])

    if (!updated[0]) {
      return NextResponse.json({ error: "Could not mark intake paid" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      paymentStatus: "paid_in_person",
      method,
      intake: updated[0],
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to mark intake paid"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
