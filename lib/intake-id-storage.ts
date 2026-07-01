import "server-only"
import { randomUUID } from "crypto"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getAwsCredentials, getIntakeIdBucket, getS3Client } from "@/lib/s3-env"

const MAX_ID_BYTES = 10 * 1024 * 1024 // 10 MB

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
