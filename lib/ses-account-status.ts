import "server-only"
import { GetAccountCommand, SESv2Client } from "@aws-sdk/client-sesv2"
import { getAwsCredentials } from "@/lib/s3-env"
import { getSesRegion, isSesConfigured } from "@/lib/ses-env"

export type SesReviewStatus = "GRANTED" | "DENIED" | "PENDING" | "NOT_REQUESTED" | "UNKNOWN"

export type SesAccountStatus = {
  productionAccessEnabled: boolean
  reviewStatus: SesReviewStatus
  reviewCaseId: string | null
  max24HourSend: number | null
  sentLast24Hours: number | null
  websiteUrl: string | null
  error: string | null
}

function mapReviewStatus(raw: string | undefined): SesReviewStatus {
  switch (raw?.toUpperCase()) {
    case "GRANTED":
    case "SUCCESS":
      return "GRANTED"
    case "DENIED":
    case "FAILED":
      return "DENIED"
    case "PENDING":
    case "IN_PROGRESS":
      return "PENDING"
    default:
      return raw ? "UNKNOWN" : "NOT_REQUESTED"
  }
}

export async function getSesAccountStatus(): Promise<SesAccountStatus> {
  if (!isSesConfigured() || !getAwsCredentials()) {
    return {
      productionAccessEnabled: false,
      reviewStatus: "NOT_REQUESTED",
      reviewCaseId: null,
      max24HourSend: null,
      sentLast24Hours: null,
      websiteUrl: null,
      error: "AWS credentials not configured",
    }
  }

  try {
    const client = new SESv2Client({
      region: getSesRegion(),
      credentials: getAwsCredentials(),
    })
    const account = await client.send(new GetAccountCommand({}))
    const reviewStatus = account.ProductionAccessEnabled
      ? "GRANTED"
      : mapReviewStatus(account.Details?.ReviewDetails?.Status)

    return {
      productionAccessEnabled: account.ProductionAccessEnabled === true,
      reviewStatus,
      reviewCaseId: account.Details?.ReviewDetails?.CaseId ?? null,
      max24HourSend: account.SendQuota?.Max24HourSend ?? null,
      sentLast24Hours: account.SendQuota?.SentLast24Hours ?? null,
      websiteUrl: account.Details?.WebsiteURL ?? null,
      error: null,
    }
  } catch (err) {
    return {
      productionAccessEnabled: false,
      reviewStatus: "UNKNOWN",
      reviewCaseId: null,
      max24HourSend: null,
      sentLast24Hours: null,
      websiteUrl: null,
      error: err instanceof Error ? err.message : "Could not read SES account",
    }
  }
}

export function sesReviewHint(status: SesAccountStatus): string {
  if (status.productionAccessEnabled) {
    return "SES production access is enabled. Patient emails should deliver."
  }

  switch (status.reviewStatus) {
    case "DENIED":
      return status.reviewCaseId
        ? `AWS denied SES production access (case ${status.reviewCaseId}). Open AWS Support Center → case ${status.reviewCaseId}, review the denial reason, and reply with your transactional pharmacy use case. You cannot resubmit from the console until the case is resolved.`
        : "AWS denied SES production access. Open AWS Support Center for the denial reason and appeal with your transactional pharmacy use case."
    case "PENDING":
      return "SES production access review is in progress. AWS usually responds within 24 hours."
    case "NOT_REQUESTED":
      return "Request production access: AWS Console → SES → US East (Ohio) → Account dashboard → Request production access."
    default:
      return "SES is in sandbox mode. Patient Gmail/Yahoo addresses cannot receive mail until production access is granted."
  }
}
