import "server-only"
import { S3Client } from "@aws-sdk/client-s3"

const ENV_PREFIXES = [
  "AWS_ACCESS_KEY_ID=",
  "AWS_SECRET_ACCESS_KEY=",
  "AWS_REGION=",
  "INTAKE_ID_BUCKET=",
  "INTAKE_ID_BUKET=",
] as const

/** Normalize env values — fixes common Vercel copy/paste mistakes. */
export function normalizeEnvValue(raw: string | undefined, forKey?: string): string | undefined {
  if (raw == null) return undefined
  let value = raw.trim()
  if (!value) return undefined

  // Strip wrapping quotes
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim()
  }

  // Strip KEY= prefix if user pasted whole .env line into the value field
  if (forKey) {
    const ownPrefix = `${forKey}=`
    if (value.toUpperCase().startsWith(ownPrefix.toUpperCase())) {
      value = value.slice(ownPrefix.length).trim()
    }
  }
  for (const prefix of ENV_PREFIXES) {
    if (value.toUpperCase().startsWith(prefix.toUpperCase())) {
      value = value.slice(prefix.length).trim()
      break
    }
  }

  return value || undefined
}

export function envTrim(key: string): string | undefined {
  return normalizeEnvValue(process.env[key], key)
}

export function getIntakeIdBucket(): string | undefined {
  return envTrim("INTAKE_ID_BUCKET") ?? envTrim("INTAKE_ID_BUKET")
}

export function getAwsAccessKeyId(): string | undefined {
  return envTrim("AWS_ACCESS_KEY_ID")
}

export function getAwsSecretAccessKey(): string | undefined {
  return envTrim("AWS_SECRET_ACCESS_KEY")
}

export function getAwsRegion(): string {
  return envTrim("AWS_REGION") || "us-east-1"
}

export function getAwsCredentials():
  | { accessKeyId: string; secretAccessKey: string }
  | undefined {
  const accessKeyId = getAwsAccessKeyId()
  const secretAccessKey = getAwsSecretAccessKey()
  if (!accessKeyId || !secretAccessKey) return undefined
  return { accessKeyId, secretAccessKey }
}

export function getS3Client(): S3Client {
  const credentials = getAwsCredentials()
  return new S3Client({
    region: getAwsRegion(),
    credentials,
  })
}

export function isS3Configured(): boolean {
  return Boolean(getIntakeIdBucket() && getAwsCredentials())
}

export function awsCredentialDiagnostics(): {
  accessKeyIdPrefix: string | null
  accessKeyIdLength: number
  secretAccessKeyLength: number
  accessKeyLooksValid: boolean
  secretLooksValid: boolean
  issues: string[]
} {
  const accessKeyId = getAwsAccessKeyId()
  const secretAccessKey = getAwsSecretAccessKey()
  const issues: string[] = []

  const rawAccess = process.env.AWS_ACCESS_KEY_ID
  const rawSecret = process.env.AWS_SECRET_ACCESS_KEY

  if (rawAccess?.includes("AWS_ACCESS_KEY_ID=")) {
    issues.push("AWS_ACCESS_KEY_ID value still contains 'AWS_ACCESS_KEY_ID=' — use only the AKIA... key in Vercel.")
  }
  if (rawSecret?.includes("AWS_SECRET_ACCESS_KEY=")) {
    issues.push("AWS_SECRET_ACCESS_KEY value still contains 'AWS_SECRET_ACCESS_KEY=' — use only the secret string in Vercel.")
  }
  if (accessKeyId && !accessKeyId.startsWith("AKIA") && !accessKeyId.startsWith("ASIA")) {
    issues.push("Access key should start with AKIA (or ASIA for temporary creds).")
  }
  if (accessKeyId && accessKeyId.length !== 20) {
    issues.push(`Access key length is ${accessKeyId.length} (expected 20). Check for extra characters.`)
  }
  if (secretAccessKey && secretAccessKey.length !== 40) {
    issues.push(`Secret key length is ${secretAccessKey.length} (expected 40). It may be truncated or have extra characters.`)
  }

  return {
    accessKeyIdPrefix: accessKeyId ? accessKeyId.slice(0, 4) : null,
    accessKeyIdLength: accessKeyId?.length ?? 0,
    secretAccessKeyLength: secretAccessKey?.length ?? 0,
    accessKeyLooksValid: Boolean(accessKeyId?.startsWith("AKIA") && accessKeyId.length === 20),
    secretLooksValid: Boolean(secretAccessKey && secretAccessKey.length === 40),
    issues,
  }
}

export function s3ConfigStatus(): {
  configured: boolean
  bucket: string | null
  region: string | null
  hasAccessKey: boolean
  hasSecretKey: boolean
  bucketEnvKey: "INTAKE_ID_BUCKET" | "INTAKE_ID_BUKET" | null
} {
  const bucketFromCorrect = envTrim("INTAKE_ID_BUCKET")
  const bucketFromTypo = envTrim("INTAKE_ID_BUKET")
  const bucket = bucketFromCorrect ?? bucketFromTypo ?? null
  const region = envTrim("AWS_REGION") ?? null
  const hasAccessKey = Boolean(getAwsAccessKeyId())
  const hasSecretKey = Boolean(getAwsSecretAccessKey())
  return {
    configured: Boolean(bucket && hasAccessKey && hasSecretKey),
    bucket,
    region,
    hasAccessKey,
    hasSecretKey,
    bucketEnvKey: bucketFromCorrect
      ? "INTAKE_ID_BUCKET"
      : bucketFromTypo
        ? "INTAKE_ID_BUKET"
        : null,
  }
}
