import { NextResponse } from "next/server"
import { getAdminSalesSummary } from "@/lib/admin-sales-summary"
import { staffAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!staff || staff.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const summary = await getAdminSalesSummary()
    return NextResponse.json(summary, {
      headers: { "Cache-Control": "private, no-store, no-cache, must-revalidate" },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load sales summary"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
