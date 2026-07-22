import { NextRequest, NextResponse } from "next/server"
import { staffAuth } from "@/lib/auth"
import { reviewClinicalIntake, type IntakeReviewAction } from "@/lib/telehealth/review-intake"
import type { ClinicalRxPayload } from "@/lib/clinical-prescription"

type RouteParams = { params: Promise<{ serviceType: string; id: string }> }

const VALID_ACTIONS: IntakeReviewAction[] = ["approve", "deny", "follow_up"]

function parsePrescription(body: Record<string, unknown>): ClinicalRxPayload | undefined {
  const raw = body.prescription
  if (!raw || typeof raw !== "object") return undefined
  const rx = raw as Record<string, unknown>
  const medicationName = typeof rx.medicationName === "string" ? rx.medicationName : ""
  const strength = typeof rx.strength === "string" ? rx.strength : ""
  const directions = typeof rx.directions === "string" ? rx.directions : ""
  const quantity = typeof rx.quantity === "string" ? rx.quantity : ""
  const refills = typeof rx.refills === "number" ? rx.refills : Number(rx.refills ?? 0)
  const clinicianEsignName =
    typeof rx.clinicianEsignName === "string" ? rx.clinicianEsignName : undefined
  return {
    medicationName,
    strength,
    directions,
    quantity,
    refills: Number.isFinite(refills) ? refills : 0,
    clinicianEsignName,
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!staff || staff.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { serviceType, id } = await params
    const body = (await request.json()) as Record<string, unknown>
    const action = body.action as IntakeReviewAction
    const note = typeof body.note === "string" ? body.note.trim() : undefined
    const liveVisitRequired = Boolean(body.liveVisitRequired)
    const prescription = parsePrescription(body)

    if (!VALID_ACTIONS.includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const result = await reviewClinicalIntake({
      serviceType,
      id,
      action,
      note,
      liveVisitRequired: serviceType === "weight_loss" ? liveVisitRequired : undefined,
      prescription,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, paymentAction: result.paymentAction },
        { status: 400 }
      )
    }

    return NextResponse.json(result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Review failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
