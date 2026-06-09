import { NextResponse } from "next/server"
import { staffAuth } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    const { staff, sessionId } = await staffAuth.signIn(email, password)

    return NextResponse.json({ staff, sessionId })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}
