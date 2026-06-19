import "server-only"
import { randomUUID } from "crypto"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"

const MAX_ID_BYTES = 10 * 1024 * 1024 // 10 MB

function getS3Client() {
  return new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials:
      process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
  })
}

export function isIdStorageConfigured(): boolean {
  return Boolean(process.env.INTAKE_ID_BUCKET)
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

  const bucket = process.env.INTAKE_ID_BUCKET
  if (bucket) {
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
