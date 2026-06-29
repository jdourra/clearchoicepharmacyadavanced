import { NextResponse } from "next/server"
import { staffAuth } from "@/lib/auth"
import {
  getClinicalIntakeDetail,
  isAdminIntakeServiceType,
  SERVICE_LABELS,
  treatmentLabelFromDetail,
} from "@/lib/telehealth/intake-registry"

type RouteParams = { params: Promise<{ serviceType: string; id: string }> }

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!staff || staff.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { serviceType, id } = await params
    if (!isAdminIntakeServiceType(serviceType)) {
      return NextResponse.json({ error: "Invalid service type" }, { status: 400 })
    }

    const detail = await getClinicalIntakeDetail(serviceType, id)
    if (!detail) {
      return NextResponse.json({ error: "Intake not found" }, { status: 404 })
    }

    return NextResponse.json({
      serviceType,
      serviceLabel: SERVICE_LABELS[serviceType],
      treatmentLabel: treatmentLabelFromDetail(serviceType, detail),
      detail,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load intake"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
