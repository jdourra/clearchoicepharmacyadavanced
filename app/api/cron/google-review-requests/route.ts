import { NextResponse } from "next/server"
import {
  GOOGLE_REVIEW_MIN_DAYS_AFTER_FULFILLMENT,
  sendGoogleReviewRequestBatch,
} from "@/lib/patient-google-review"
import { isGoogleReviewUrlConfigured } from "@/lib/site-config"

function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return process.env.NODE_ENV !== "production"
  }
  const auth = request.headers.get("authorization")
  return auth === `Bearer ${secret}`
}

/** Daily job: ask fulfilled patients for a Google review (once each). */
export async function GET(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    if (!isGoogleReviewUrlConfigured()) {
      return NextResponse.json({
        ok: false,
        skipped: true,
        reason: "GOOGLE_REVIEW_URL is not configured",
      })
    }

    const result = await sendGoogleReviewRequestBatch()

    return NextResponse.json({
      ok: true,
      minDaysAfterFulfillment: GOOGLE_REVIEW_MIN_DAYS_AFTER_FULFILLMENT,
      ...result,
    })
  } catch (error) {
    console.error("[cron/google-review-requests]", error)
    return NextResponse.json({ error: "Google review request job failed" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  return GET(request)
}
