import { NextResponse } from "next/server"
import { staffAuth } from "@/lib/auth"

export async function GET() {
  try {
    const staff = await staffAuth.getCurrentStaff()
    if (!staff || staff.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ staff })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
