import { NextResponse } from "next/server"
import { staffAuth } from "@/lib/auth"
import {
  listSignupFollowupCandidates,
  sendSignupFollowupBatch,
  SIGNUP_FOLLOWUP_MAX_AGE_DAYS,
  SIGNUP_FOLLOWUP_MIN_AGE_DAYS,
} from "@/lib/patient-signup-followup"

export async function GET(request: Request) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!staff || staff.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const candidates = await listSignupFollowupCandidates()

    return NextResponse.json({
      minAgeDays: SIGNUP_FOLLOWUP_MIN_AGE_DAYS,
      maxAgeDays: SIGNUP_FOLLOWUP_MAX_AGE_DAYS,
      eligibleCount: candidates.length,
      candidates: candidates.map((c) => ({
        id: c.id,
        email: c.email,
        name: `${c.firstName} ${c.lastName}`.trim(),
        createdAt: c.createdAt,
      })),
    })
  } catch (error) {
    console.error("[admin/customers/signup-followup] GET", error)
    return NextResponse.json({ error: "Failed to load follow-up candidates" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!staff || staff.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const patientIds = Array.isArray(body.patientIds)
      ? body.patientIds.map(String).filter(Boolean)
      : undefined
    const dryRun = Boolean(body.dryRun)

    const relaxAgeRules = Boolean(body.relaxAgeRules) || (patientIds?.length === 1)

    const result = await sendSignupFollowupBatch({ patientIds, dryRun, relaxAgeRules })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[admin/customers/signup-followup] POST", error)
    return NextResponse.json({ error: "Failed to send follow-up emails" }, { status: 500 })
  }
}
