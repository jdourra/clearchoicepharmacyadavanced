import "server-only"
import { randomUUID } from "crypto"
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { envTrim, getIntakeIdBucket } from "@/lib/s3-env"

const MAX_BYTES = 10 * 1024 * 1024
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "application/pdf"])

function getS3Client() {
  return new S3Client({
    region: envTrim("AWS_REGION") || "us-east-1",
    credentials:
      envTrim("AWS_ACCESS_KEY_ID") && envTrim("AWS_SECRET_ACCESS_KEY")
        ? {
            accessKeyId: envTrim("AWS_ACCESS_KEY_ID")!,
            secretAccessKey: envTrim("AWS_SECRET_ACCESS_KEY")!,
          }
        : undefined,
  })
}

export async function storeOrderPrescription(params: {
  file: Buffer
  contentType: string
  originalName: string
  orderId: string
}): Promise<{ storageKey: string; mode: "s3" | "dev" }> {
  if (!ALLOWED_TYPES.has(params.contentType)) {
    throw new Error("Only JPEG, PNG, or PDF files are allowed")
  }
  if (params.file.length > MAX_BYTES) {
    throw new Error("Prescription file exceeds 10MB limit")
  }

  const ext = params.originalName.split(".").pop()?.toLowerCase() || "pdf"
  const storageKey = `order-prescriptions/${params.orderId}/rx-${randomUUID()}.${ext}`
  const bucket = getIntakeIdBucket()

  if (bucket && envTrim("AWS_ACCESS_KEY_ID") && envTrim("AWS_SECRET_ACCESS_KEY")) {
    const client = getS3Client()
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: storageKey,
        Body: params.file,
        ContentType: params.contentType,
        ServerSideEncryption: "AES256",
        Metadata: { orderId: params.orderId },
      })
    )
    return { storageKey, mode: "s3" }
  }

  console.warn(`[order-rx] S3 not configured — set INTAKE_ID_BUCKET and AWS keys (Vercel → redeploy)`)
  return { storageKey, mode: "dev" }
}

export type PrescriptionFileFetchError =
  | "bucket_not_configured"
  | "not_found"
  | "access_denied"
  | "empty"

export type PrescriptionFileFetchResult =
  | { ok: true; body: Buffer; contentType: string }
  | { ok: false; error: PrescriptionFileFetchError }

export async function fetchOrderPrescriptionFile(
  storageKey: string
): Promise<PrescriptionFileFetchResult> {
  const bucket = getIntakeIdBucket()
  if (!bucket) return { ok: false, error: "bucket_not_configured" }

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
      contentType: response.ContentType || "application/octet-stream",
    }
  } catch (error: unknown) {
    const name = error && typeof error === "object" && "name" in error ? String(error.name) : ""
    const code =
      error && typeof error === "object" && "Code" in error ? String((error as { Code: string }).Code) : ""
    if (name === "NoSuchKey" || code === "NoSuchKey" || code === "NotFound") {
      return { ok: false, error: "not_found" }
    }
    if (name === "AccessDenied" || code === "AccessDenied") {
      return { ok: false, error: "access_denied" }
    }
    throw error
  }
}

export function prescriptionFileFetchErrorMessage(error: PrescriptionFileFetchError): string {
  switch (error) {
    case "bucket_not_configured":
      return "S3 is not configured on this server. Add INTAKE_ID_BUCKET and AWS credentials in Vercel, then redeploy."
    case "not_found":
      return "Prescription file is missing in storage (often from orders placed before S3 was enabled). Re-upload the file below or ask the patient to re-upload from their account."
    case "access_denied":
      return "Cannot read prescription from S3. Check IAM permissions for s3:GetObject on your bucket."
    case "empty":
      return "Prescription file exists in S3 but returned empty. Re-upload the file."
  }
}
