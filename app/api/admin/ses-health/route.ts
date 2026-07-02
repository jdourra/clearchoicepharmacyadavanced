import { NextResponse } from "next/server"
import { staffAuth } from "@/lib/auth"
import { getSesAccountStatus, sesReviewHint } from "@/lib/ses-account-status"
import { looksLikeSesSandbox, sesConfigStatus } from "@/lib/ses-env"

export async function GET(request: Request) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!staff || staff.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const status = sesConfigStatus()
    const account = await getSesAccountStatus()

    const sandboxLikely =
      account.max24HourSend != null
        ? looksLikeSesSandbox(account.max24HourSend)
        : !account.productionAccessEnabled

    const canEmailPatients = status.configured && account.productionAccessEnabled

    return NextResponse.json({
      ...status,
      sandboxLikely,
      productionAccessEnabled: account.productionAccessEnabled,
      reviewStatus: account.reviewStatus,
      reviewCaseId: account.reviewCaseId,
      max24HourSend: account.max24HourSend,
      sentLast24Hours: account.sentLast24Hours,
      websiteUrl: account.websiteUrl,
      accountError: account.error,
      canEmailPatients,
      productionAccessHint: sesReviewHint(account),
    })
  } catch (error) {
    console.error("[admin/ses-health]", error)
    return NextResponse.json({ error: "SES health check failed" }, { status: 500 })
  }
}
