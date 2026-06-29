import { NextResponse } from "next/server"
import { staffAuth } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    const { staff, sessionId } = await staffAuth.signIn(email, password)

    const response = NextResponse.json({ staff, sessionId })
    response.headers.append("Set-Cookie", staffAuth.buildCookieHeader(sessionId))
    return response
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Invalid email or password"
    return NextResponse.json({ error: message }, { status: 401 })
  }
}
