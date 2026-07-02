import "server-only"
import { randomUUID } from "crypto"
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import { getAwsCredentials, getIntakeIdBucket, getS3Client } from "@/lib/s3-env"

const MAX_ID_BYTES = 10 * 1024 * 1024 // 10 MB

export type IdFileFetchError =
  | "bucket_not_configured"
  | "not_found"
  | "access_denied"
  | "empty"
  | "credentials_invalid"

export type IdFileFetchResult =
  | { ok: true; body: Buffer; contentType: string }
  | { ok: false; error: IdFileFetchError }

export function isIdStorageConfigured(): boolean {
  return Boolean(getIntakeIdBucket() && getAwsCredentials())
}

export async function storeIdDocument(params: {
  file: Buffer
  contentType: string
  originalName: string
  side: "front" | "back"
  intakePrefix: string
}): Promise<{ storageKey: string; mode: "s3" | "dev" }> {
  if (params.file.length > MAX_ID_BYTES) {
    throw new Error("ID image exceeds 10MB limit")
  }

  const ext = params.originalName.split(".").pop()?.toLowerCase() || "jpg"
  const storageKey = `intake-ids/${params.intakePrefix}/${params.side}-${randomUUID()}.${ext}`

  const bucket = getIntakeIdBucket()
  if (bucket && getAwsCredentials()) {
    const client = getS3Client()
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: storageKey,
        Body: params.file,
        ContentType: params.contentType,
        ServerSideEncryption: "AES256",
        Metadata: {
          side: params.side,
          intakePrefix: params.intakePrefix,
        },
      })
    )
    return { storageKey, mode: "s3" }
  }

  // Dev fallback — key recorded in DB; configure INTAKE_ID_BUCKET for production HIPAA storage
  console.warn(`[intake-id] INTAKE_ID_BUCKET not set — recorded key only: ${storageKey}`)
  return { storageKey, mode: "dev" }
}

export async function fetchIdDocument(storageKey: string): Promise<IdFileFetchResult> {
  const bucket = getIntakeIdBucket()
  if (!bucket || !getAwsCredentials()) return { ok: false, error: "bucket_not_configured" }

  try {
    const client = getS3Client()
    const response = await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: storageKey,
      })
    )

    if (!response.Body) return { ok: false, error: "empty" }
    const bytes = await response.Body.transformToByteArray()
    return {
      ok: true,
      body: Buffer.from(bytes),
      contentType: response.ContentType || "image/jpeg",
    }
  } catch (error: unknown) {
    const name = error && typeof error === "object" && "name" in error ? String(error.name) : ""
    const code =
      error && typeof error === "object" && "Code" in error ? String((error as { Code: string }).Code) : ""
    const message = error instanceof Error ? error.message : ""
    if (name === "NoSuchKey" || code === "NoSuchKey" || code === "NotFound") {
      return { ok: false, error: "not_found" }
    }
    if (name === "AccessDenied" || code === "AccessDenied") {
      return { ok: false, error: "access_denied" }
    }
    if (
      message.includes("signature we calculated does not match") ||
      message.includes("authorization header is malformed")
    ) {
      return { ok: false, error: "credentials_invalid" }
    }
    throw error
  }
}

export function idFileFetchErrorMessage(error: IdFileFetchError): string {
  switch (error) {
    case "bucket_not_configured":
      return "S3 is not configured. Add INTAKE_ID_BUCKET and AWS keys on Vercel, then redeploy."
    case "credentials_invalid":
      return "AWS credentials are rejected by S3. Check AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY on Vercel."
    case "not_found":
      return "ID image is missing in storage. The patient may need to re-upload their ID."
    case "access_denied":
      return "Cannot read ID from S3. Check IAM s3:GetObject permission on your bucket."
    case "empty":
      return "ID file exists in S3 but returned empty."
  }
}
