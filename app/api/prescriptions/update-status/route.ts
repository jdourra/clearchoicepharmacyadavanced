import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { staffAuth } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const staff = await staffAuth.getCurrentStaff()
    if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id, status } = await request.json()
    await sql("UPDATE prescriptions SET status = $1, updated_at = now() WHERE id = $2", [status, id])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
