import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    const { user, sessionId } = await auth.signIn(email, password)

    const response = NextResponse.json({ user, sessionId })
    response.headers.append("Set-Cookie", auth.buildCookieHeader(sessionId))
    return response
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}
