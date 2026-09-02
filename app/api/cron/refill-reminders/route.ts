import { NextResponse } from "next/server"
import {
  backfillSupplyCycleStartDates,
  sendRefillReminderBatch,
} from "@/lib/patient-refill-reminder"
import { REFILL_REMINDER_LEAD_DAYS } from "@/lib/supply-reminder-schedule"

function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return process.env.NODE_ENV !== "production"
  }
  const auth = request.headers.get("authorization")
  return auth === `Bearer ${secret}`
}

/** Daily job: email patients one week before their supply runs out. */
export async function GET(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await backfillSupplyCycleStartDates()
    const result = await sendRefillReminderBatch()

    return NextResponse.json({
      ok: true,
      leadDaysBeforeDue: REFILL_REMINDER_LEAD_DAYS,
      ...result,
    })
  } catch (error) {
    console.error("[cron/refill-reminders]", error)
    return NextResponse.json({ error: "Refill reminder job failed" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  return GET(request)
}
