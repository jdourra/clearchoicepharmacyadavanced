import { NextResponse } from "next/server"
import { resetPatientPassword } from "@/lib/patient-password-reset"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const token = typeof body.token === "string" ? body.token : ""
    const password = typeof body.password === "string" ? body.password : ""
    const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : ""

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match." }, { status: 400 })
    }

    await resetPatientPassword(token, password)
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not reset the password."
    const status = /invalid or has expired|at least 8/.test(message) ? 400 : 500
    if (status === 500) console.error("[reset-password]", error)
    return NextResponse.json({ error: message }, { status })
  }
}
