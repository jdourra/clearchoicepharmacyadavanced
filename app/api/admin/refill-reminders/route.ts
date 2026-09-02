import { NextResponse } from "next/server"
import { staffAuth } from "@/lib/auth"
import {
  listRefillReminderCandidates,
  sendRefillReminderBatch,
} from "@/lib/patient-refill-reminder"
import {
  ONE_MONTH_SUPPLY_DAYS,
  REFILL_REMINDER_LEAD_DAYS,
  TWO_MONTH_SUPPLY_DAYS,
} from "@/lib/supply-reminder-schedule"

export async function GET(request: Request) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!staff || staff.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const candidates = await listRefillReminderCandidates()

    return NextResponse.json({
      leadDaysBeforeDue: REFILL_REMINDER_LEAD_DAYS,
      oneMonthReminderAfterDays: ONE_MONTH_SUPPLY_DAYS - REFILL_REMINDER_LEAD_DAYS,
      twoMonthReminderAfterDays: (TWO_MONTH_SUPPLY_DAYS - REFILL_REMINDER_LEAD_DAYS) / 7,
      eligibleCount: candidates.length,
      candidates: candidates.map((c) => ({
        sourceType: c.sourceType,
        sourceId: c.sourceId,
        email: c.email,
        productLabel: c.productLabel,
        supplyPeriodDays: c.supplyPeriodDays,
        supplyCycleStartedAt: c.supplyCycleStartedAt,
      })),
    })
  } catch (error) {
    console.error("[admin/refill-reminders] GET", error)
    return NextResponse.json({ error: "Failed to load refill reminder candidates" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!staff || staff.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const sourceIds = Array.isArray(body.sourceIds)
      ? body.sourceIds.map(String).filter(Boolean)
      : undefined
    const dryRun = Boolean(body.dryRun)
    const relaxTiming = Boolean(body.relaxTiming) || (sourceIds?.length === 1)

    const result = await sendRefillReminderBatch({ sourceIds, dryRun, relaxTiming })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[admin/refill-reminders] POST", error)
    return NextResponse.json({ error: "Failed to send refill reminders" }, { status: 500 })
  }
}
