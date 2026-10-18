import { NextResponse } from "next/server"
import { resetStaffPassword } from "@/lib/staff-password-reset"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const token = typeof body.token === "string" ? body.token : ""
    const password = typeof body.password === "string" ? body.password : ""
    const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : ""

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match." }, { status: 400 })
    }

    const portal = await resetStaffPassword(token, password)
    return NextResponse.json({ ok: true, portal })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not reset the password."
    const status = /invalid or has expired|at least 8|too long/.test(message) ? 400 : 500
    if (status === 500) console.error("[staff-reset-password]", error)
    return NextResponse.json({ error: message }, { status })
  }
}
