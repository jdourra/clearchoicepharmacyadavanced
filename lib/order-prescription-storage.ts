import "server-only"
import { randomUUID } from "crypto"
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"

const MAX_BYTES = 10 * 1024 * 1024
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "application/pdf"])

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
        Metadata: { orderId: params.orderId },
      })
    )
    return { storageKey, mode: "s3" }
  }

  console.warn(`[order-rx] INTAKE_ID_BUCKET not set — recorded key only: ${storageKey}`)
  return { storageKey, mode: "dev" }
}

export async function fetchOrderPrescriptionFile(storageKey: string): Promise<{
  body: Buffer
  contentType: string
} | null> {
  const bucket = process.env.INTAKE_ID_BUCKET
  if (!bucket) return null

  const client = getS3Client()
  const response = await client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: storageKey,
    })
  )

  if (!response.Body) return null
  const bytes = await response.Body.transformToByteArray()
  return {
    body: Buffer.from(bytes),
    contentType: response.ContentType || "application/octet-stream",
  }
}
