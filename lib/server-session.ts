// Server-side: extract session ID from request
// Checks Authorization header first (works in iframes), then falls back to cookies

import { sql } from "@/lib/db"

export function getSessionIdFromRequest(request: Request): string | null {
  // 1. Authorization: Bearer <sessionId>
  const authHeader = request.headers.get("authorization") || ""
  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim()
    if (token && token !== "null" && token !== "undefined") return token
  }
  // 2. Cookie fallback
  const cookieHeader = request.headers.get("cookie") || ""
  const match = cookieHeader.match(/session_id=([^;]+)/)
  return match?.[1] || null
}

export async function getUserIdFromRequest(request: Request): Promise<string | null> {
  const sessionId = getSessionIdFromRequest(request)
  if (!sessionId) return null
  const rows = await sql("SELECT user_id FROM sessions WHERE id = $1 AND expires_at > now()", [sessionId])
  return rows.length > 0 ? rows[0].user_id : null
}
