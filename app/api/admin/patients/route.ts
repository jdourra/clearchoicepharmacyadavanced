import { NextResponse } from "next/server"
import { searchPatientHistory } from "@/lib/admin-patient-history"
import { staffAuth } from "@/lib/auth"
import { canReviewClinicalIntakesStaff } from "@/lib/staff-roles"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!canReviewClinicalIntakesStaff(staff)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const query = new URL(request.url).searchParams.get("q")?.trim() || ""
    const result = await searchPatientHistory(query)
    return NextResponse.json(result, {
      headers: { "Cache-Control": "private, no-store, no-cache, must-revalidate" },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to search patients"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
