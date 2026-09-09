import { NextResponse } from "next/server"
import { staffAuth } from "@/lib/auth"
import {
  GOOGLE_REVIEW_MAX_DAYS_AFTER_FULFILLMENT,
  GOOGLE_REVIEW_MIN_DAYS_AFTER_FULFILLMENT,
  listGoogleReviewCandidates,
  sendGoogleReviewRequestBatch,
} from "@/lib/patient-google-review"
import { GOOGLE_REVIEW_URL, isGoogleReviewUrlConfigured } from "@/lib/site-config"

export async function GET(request: Request) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!staff || staff.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const candidates = await listGoogleReviewCandidates()

    return NextResponse.json({
      minDaysAfterFulfillment: GOOGLE_REVIEW_MIN_DAYS_AFTER_FULFILLMENT,
      maxDaysAfterFulfillment: GOOGLE_REVIEW_MAX_DAYS_AFTER_FULFILLMENT,
      reviewUrlConfigured: isGoogleReviewUrlConfigured(),
      reviewUrl: isGoogleReviewUrlConfigured() ? GOOGLE_REVIEW_URL : null,
      eligibleCount: candidates.length,
      candidates: candidates.map((c) => ({
        id: c.id,
        email: c.email,
        name: `${c.firstName} ${c.lastName}`.trim(),
        fulfilledAt: c.fulfilledAt,
        source: c.source,
      })),
    })
  } catch (error) {
    console.error("[admin/customers/google-review] GET", error)
    return NextResponse.json({ error: "Failed to load Google review candidates" }, { status: 500 })
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

    const result = await sendGoogleReviewRequestBatch({
      patientIds,
      dryRun,
      relaxAgeRules,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[admin/customers/google-review] POST", error)
    return NextResponse.json({ error: "Failed to send Google review requests" }, { status: 500 })
  }
}
