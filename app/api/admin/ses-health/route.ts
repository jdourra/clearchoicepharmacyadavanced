import { NextResponse } from "next/server"
import { GetSendQuotaCommand } from "@aws-sdk/client-ses"
import { staffAuth } from "@/lib/auth"
import { getSesClient } from "@/lib/ses-client"
import { looksLikeSesSandbox, sesConfigStatus } from "@/lib/ses-env"

export async function GET(request: Request) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!staff || staff.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const status = sesConfigStatus()
    let sandboxLikely: boolean | null = null
    let max24HourSend: number | null = null
    let sentLast24Hours: number | null = null
    let quotaError: string | null = null

    if (status.configured) {
      try {
        const quota = await getSesClient().send(new GetSendQuotaCommand({}))
        max24HourSend = quota.Max24HourSend ?? null
        sentLast24Hours = quota.SentLast24Hours ?? null
        sandboxLikely =
          max24HourSend != null ? looksLikeSesSandbox(max24HourSend) : null
      } catch (err) {
        quotaError = err instanceof Error ? err.message : "Could not read SES quota"
      }
    }

    const canEmailPatients = status.configured && sandboxLikely === false

    return NextResponse.json({
      ...status,
      sandboxLikely,
      max24HourSend,
      sentLast24Hours,
      quotaError,
      canEmailPatients,
      productionAccessHint:
        sandboxLikely === true
          ? "AWS SES is in sandbox mode. Request production access: AWS Console → SES → US East (Ohio) → Account dashboard → Request production access. Until approved, only verified @clearchoicepharmacy.com addresses can receive mail."
          : status.configured
            ? "SES appears ready to email patients."
            : "Configure AWS credentials and SES_SENDER_EMAIL on Vercel, then redeploy.",
    })
  } catch (error) {
    console.error("[admin/ses-health]", error)
    return NextResponse.json({ error: "SES health check failed" }, { status: 500 })
  }
}
