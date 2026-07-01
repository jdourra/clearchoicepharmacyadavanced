import "server-only"

/** Trim env values — avoids Vercel copy/paste whitespace breaking the bucket name. */
export function envTrim(key: string): string | undefined {
  const raw = process.env[key]
  if (raw == null) return undefined
  const trimmed = raw.trim()
  return trimmed || undefined
}

export function getIntakeIdBucket(): string | undefined {
  return envTrim("INTAKE_ID_BUCKET")
}

export function isS3Configured(): boolean {
  return Boolean(
    getIntakeIdBucket() && envTrim("AWS_ACCESS_KEY_ID") && envTrim("AWS_SECRET_ACCESS_KEY")
  )
}

export function s3ConfigStatus(): {
  configured: boolean
  bucket: string | null
  region: string | null
  hasAccessKey: boolean
  hasSecretKey: boolean
} {
  const bucket = getIntakeIdBucket() ?? null
  const region = envTrim("AWS_REGION") ?? null
  const hasAccessKey = Boolean(envTrim("AWS_ACCESS_KEY_ID"))
  const hasSecretKey = Boolean(envTrim("AWS_SECRET_ACCESS_KEY"))
  return {
    configured: Boolean(bucket && hasAccessKey && hasSecretKey),
    bucket,
    region,
    hasAccessKey,
    hasSecretKey,
  }
}
