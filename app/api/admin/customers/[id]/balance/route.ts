import { NextResponse } from "next/server"
import { admin, staffAuth } from "@/lib/auth"
import {
  createAndEmailBalanceRequest,
  getPatientPaymentSummary,
  recordManualPatientPayment,
} from "@/lib/patient-balance"

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: RouteParams) {
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

    const summary = await getPatientPaymentSummary(id)
    return NextResponse.json(summary)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load payments"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: RouteParams) {
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

    const body = (await request.json()) as Record<string, unknown>
    const action = String(body.action || "request")
    const amount = Number(body.amount)
    const description = typeof body.description === "string" ? body.description : ""
    const note = typeof body.note === "string" ? body.note : ""
    const stripePaymentIntentId =
      typeof body.stripePaymentIntentId === "string" ? body.stripePaymentIntentId : null

    if (action === "record") {
      const entry = await recordManualPatientPayment({
        patientId: id,
        amountDollars: amount,
        note: note || description || "Prior payment recorded by staff",
        stripePaymentIntentId,
        staffId: staff.id,
      })
      const summary = await getPatientPaymentSummary(id)
      return NextResponse.json({ success: true, entry, ...summary })
    }

    const result = await createAndEmailBalanceRequest({
      patientId: id,
      patientEmail: user.email,
      patientName: user.name,
      amountDollars: amount,
      description: description || "Remaining balance due",
      staffId: staff.id,
    })

    const summary = await getPatientPaymentSummary(id)
    return NextResponse.json({
      success: true,
      request: result.request,
      emailSent: result.emailSent,
      emailError: result.emailError,
      paymentUrl: result.request.paymentUrl,
      ...summary,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to process payment request"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
