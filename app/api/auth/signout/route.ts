import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getSessionIdFromRequest } from "@/lib/server-session"

export async function POST(request: Request) {
  try {
    const sessionId = getSessionIdFromRequest(request)
    if (sessionId) {
      const { sql } = await import("@/lib/db")
      await sql("DELETE FROM sessions WHERE id = $1", [sessionId])
    }
  } catch {
    // Ignore errors
  }
  const response = NextResponse.json({ success: true })
  response.headers.append("Set-Cookie", auth.buildDeleteCookieHeader())
  return response
}
