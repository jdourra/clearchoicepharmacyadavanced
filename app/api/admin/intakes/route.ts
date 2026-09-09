import { NextResponse } from "next/server"
import { staffAuth } from "@/lib/auth"
import { canReviewClinicalIntakesStaff } from "@/lib/staff-roles"
import { listClinicalIntakes } from "@/lib/telehealth/intake-registry"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!canReviewClinicalIntakesStaff(staff)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "pending"
    const intakes = await listClinicalIntakes({ status })

    return NextResponse.json(
      { intakes, fetchedAt: new Date().toISOString() },
      {
        headers: {
          "Cache-Control": "private, no-store, no-cache, must-revalidate",
        },
      }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load intakes"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
