import "server-only"
import { envTrim, getAwsCredentials } from "@/lib/s3-env"
import { INTAKE_EMAIL } from "@/lib/site-config"

const SENDER_ENV_KEYS = [
  "SES_SENDER_EMAIL",
  "SES_FROM_EMAIL",
  "SES_FROM",
] as const

/** SES region — defaults to us-east-2 (Ohio) where clearchoicepharmacy.com DKIM is configured. */
export function getSesRegion(): string {
  return envTrim("SES_REGION") || envTrim("AWS_REGION") || "us-east-2"
}

export function getSesSenderEmail(): string {
  for (const key of SENDER_ENV_KEYS) {
    const value = envTrim(key)
    if (value && value.includes("@")) return value.toLowerCase()
  }
  return INTAKE_EMAIL
}

export function formatSesFromAddress(email?: string): string {
  const address = (email || getSesSenderEmail()).trim()
  return `Clear Choice Pharmacy <${address}>`
}

export function getSesReplyToEmail(): string | undefined {
  return envTrim("SES_REPLY_TO_EMAIL") || getSesSenderEmail()
}

export function isSesConfigured(): boolean {
  return Boolean(getAwsCredentials())
}

export function sesConfigStatus(): {
  configured: boolean
  region: string
  senderEmail: string
  replyToEmail: string
  hasAwsCredentials: boolean
  senderEnvKey: string | null
  issues: string[]
} {
  const issues: string[] = []
  let senderEnvKey: string | null = null

  for (const key of SENDER_ENV_KEYS) {
    const value = envTrim(key)
    if (value?.includes("@")) {
      senderEnvKey = key
      break
    }
  }

  if (!getAwsCredentials()) {
    issues.push("Missing AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY.")
  }

  if (!senderEnvKey) {
    issues.push(
      `SES_SENDER_EMAIL is not set — using default ${INTAKE_EMAIL}. Set SES_SENDER_EMAIL on Vercel for clarity.`
    )
  }

  const region = envTrim("AWS_REGION")
  const sesRegion = getSesRegion()
  if (region && region !== sesRegion && !envTrim("SES_REGION")) {
    issues.push(`AWS_REGION (${region}) differs from SES region (${sesRegion}). DKIM for clearchoicepharmacy.com is in us-east-2.`)
  }

  return {
    configured: isSesConfigured(),
    region: sesRegion,
    senderEmail: getSesSenderEmail(),
    replyToEmail: getSesReplyToEmail() || getSesSenderEmail(),
    hasAwsCredentials: Boolean(getAwsCredentials()),
    senderEnvKey,
    issues,
  }
}

export function normalizePatientEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function formatSesError(error: unknown, recipient?: string): string {
  const raw = error instanceof Error ? error.message : String(error)

  if (raw.includes("Email address is not verified") || raw.includes("MessageRejected")) {
    return recipient
      ? `Could not email ${recipient}. AWS SES is likely in sandbox mode — it can only send to verified addresses until you request production access in the SES console (US East Ohio).`
      : "AWS SES rejected the message. Verify the sender domain and request production access to email patients."
  }

  if (raw.includes("AccessDenied") || raw.includes("not authorized")) {
    return "AWS IAM user lacks ses:SendEmail permission. Attach scripts/aws-iam-ses-policy.json to the IAM user."
  }

  if (raw.includes("InvalidParameterValue") && raw.includes("Source")) {
    return `Invalid sender address. Verify ${getSesSenderEmail()} or clearchoicepharmacy.com in AWS SES (us-east-2).`
  }

  return raw
}

/** SES sandbox accounts typically have a 200 emails / 24h quota. */
export function looksLikeSesSandbox(max24HourSend: number): boolean {
  return max24HourSend > 0 && max24HourSend <= 200
}
