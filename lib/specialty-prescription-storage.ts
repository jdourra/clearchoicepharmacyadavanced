import "server-only"
import { randomUUID } from "crypto"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getAwsCredentials, getIntakeIdBucket, getS3Client } from "@/lib/s3-env"

const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "application/pdf"])

export async function storeSpecialtyPrescription(params: {
  file: Buffer
  contentType: string
  originalName: string
  intakePrefix: string
}): Promise<{ storageKey: string; mode: "s3" | "dev" }> {
  if (!ALLOWED_TYPES.has(params.contentType)) {
    throw new Error("Only JPEG, PNG, or PDF files are allowed")
  }

  if (params.file.length > MAX_BYTES) {
    throw new Error("Prescription file exceeds 10MB limit")
  }

  const ext = params.originalName.split(".").pop()?.toLowerCase() || "pdf"
  const storageKey = `specialty-prescriptions/${params.intakePrefix}/rx-${randomUUID()}.${ext}`

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
          intakePrefix: params.intakePrefix,
        },
      })
    )
    return { storageKey, mode: "s3" }
  }

  console.warn(`[specialty-rx] INTAKE_ID_BUCKET not set — recorded key only: ${storageKey}`)
  return { storageKey, mode: "dev" }
}
