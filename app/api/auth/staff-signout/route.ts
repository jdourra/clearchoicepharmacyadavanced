import { NextResponse } from "next/server"
import { staffAuth } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || ""
    const sessionMatch = cookieHeader.match(/staff_session_id=([^;]+)/)
    const sessionId = sessionMatch?.[1] || null
    if (sessionId) {
      const { sql } = await import("@/lib/db")
      await sql("DELETE FROM sessions WHERE id = $1", [sessionId])
    }
  } catch {
    // Ignore errors
  }
  return NextResponse.json({ success: true })
}
