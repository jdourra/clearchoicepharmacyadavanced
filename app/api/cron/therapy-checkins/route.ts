import { NextResponse } from "next/server"
import { sendDueTherapyCheckIns } from "@/lib/patient-therapy-checkin"

function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return process.env.NODE_ENV !== "production"
  }
  const auth = request.headers.get("authorization")
  return auth === `Bearer ${secret}`
}

/** Daily: mid-month therapy check-ins before the next kit month. */
export async function GET(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await sendDueTherapyCheckIns()
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error("[cron/therapy-checkins]", error)
    return NextResponse.json({ error: "Therapy check-in job failed" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  return GET(request)
}
