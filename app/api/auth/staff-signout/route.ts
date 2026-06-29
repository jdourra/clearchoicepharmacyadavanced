import { NextResponse } from "next/server"
import { staffAuth } from "@/lib/auth"

export async function POST() {
  try {
    await staffAuth.signOut()
  } catch {
    // Ignore errors
  }

  const response = NextResponse.json({ success: true })
  response.headers.append("Set-Cookie", staffAuth.buildDeleteCookieHeader())
  return response
}
