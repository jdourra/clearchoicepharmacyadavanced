import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, phone, dob, address, city, state, zip } = await request.json()

    if (!email || !password || !firstName) {
      return NextResponse.json({ error: "First name, email, and password are required" }, { status: 400 })
    }

    const { user, sessionId } = await auth.signUp(
      email, password, firstName, lastName || "", phone, dob, address, city, state, zip
    )

    const response = NextResponse.json({ user, sessionId })
    response.headers.append("Set-Cookie", auth.buildCookieHeader(sessionId))
    return response
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
