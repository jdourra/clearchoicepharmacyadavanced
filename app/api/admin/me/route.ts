import { NextResponse } from "next/server"
import { staffAuth } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!staff || staff.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ staff })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
