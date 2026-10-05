import { NextResponse } from "next/server"
import { sendDueIntakeDelayNotices } from "@/lib/intake-delay-notice"

function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return process.env.NODE_ENV !== "production"
  }
  const auth = request.headers.get("authorization")
  return auth === `Bearer ${secret}`
}

/** Send the clinician-delay note once an intake has been waiting more than one day. */
export async function GET(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await sendDueIntakeDelayNotices()
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error("[cron/intake-delay-notices]", error)
    return NextResponse.json({ error: "Intake delay notice job failed" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  return GET(request)
}
