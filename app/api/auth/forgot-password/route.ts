import { NextResponse } from "next/server"
import { requestPatientPasswordReset } from "@/lib/patient-password-reset"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const email = typeof body.email === "string" ? body.email : ""
    await requestPatientPasswordReset(email)
    return NextResponse.json({
      ok: true,
      message: "If an account exists for that email, we sent a link to reset the password.",
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not send the reset email."
    const status = message.startsWith("Enter the email") ? 400 : 500
    if (status === 500) console.error("[forgot-password]", error)
    return NextResponse.json(
      {
        error:
          status === 400
            ? message
            : "We could not send the reset email. Call (810) 309-8222 and we will help you sign in.",
      },
      { status }
    )
  }
}
