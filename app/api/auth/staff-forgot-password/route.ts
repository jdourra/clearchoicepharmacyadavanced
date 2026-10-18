import { NextResponse } from "next/server"
import { requestStaffPasswordReset, type StaffResetPortal } from "@/lib/staff-password-reset"

function parsePortal(value: unknown): StaffResetPortal | null {
  return value === "admin" || value === "doctor" ? value : null
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const email = typeof body.email === "string" ? body.email : ""
    const portal = parsePortal(body.portal)
    if (!portal) {
      return NextResponse.json({ error: "Choose the admin or clinician reset page." }, { status: 400 })
    }
    await requestStaffPasswordReset(email, portal)
    return NextResponse.json({
      ok: true,
      message: "If an account exists for that email, we sent a link to reset the password.",
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not send the reset email."
    const status = message.startsWith("Enter the email") ? 400 : 500
    if (status === 500) console.error("[staff-forgot-password]", error)
    return NextResponse.json(
      {
        error:
          status === 400
            ? message
            : "We could not send the reset email. Call (248) 987-6182 and we will help you sign in.",
      },
      { status }
    )
  }
}
