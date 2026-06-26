import { NextResponse } from "next/server"
import { staffAuth } from "@/lib/auth"
import { listClinicalIntakes } from "@/lib/telehealth/intake-registry"

export async function GET(request: Request) {
  try {
    const staff = await staffAuth.getCurrentStaff()
    if (!staff || staff.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "pending"
    const intakes = await listClinicalIntakes({ status: status === "all" ? undefined : status })

    return NextResponse.json({ intakes })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load intakes"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
