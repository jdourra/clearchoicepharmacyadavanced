import "server-only"
import { randomUUID } from "crypto"
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getAwsCredentials, getIntakeIdBucket, getS3Client } from "@/lib/s3-env"

export async function storePrescriptionPdf(params: {
  pdf: Buffer | Uint8Array
  intakeId: string
  kind: "unsigned" | "signed"
}): Promise<{ storageKey: string; mode: "s3" | "dev" }> {
  const storageKey = `clinical-prescriptions/${params.intakeId}/${params.kind}-${randomUUID()}.pdf`
  const bucket = getIntakeIdBucket()
  if (bucket && getAwsCredentials()) {
    const client = getS3Client()
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: storageKey,
        Body: Buffer.from(params.pdf),
        ContentType: "application/pdf",
        ServerSideEncryption: "AES256",
      })
    )
    return { storageKey, mode: "s3" }
  }
  console.warn(`[clinical-rx] S3 not configured — recorded key only: ${storageKey}`)
  return { storageKey, mode: "dev" }
}

export async function fetchPrescriptionPdf(
  storageKey: string
): Promise<{ ok: true; body: Buffer } | { ok: false; error: string }> {
  const bucket = getIntakeIdBucket()
  if (!bucket || !getAwsCredentials()) {
    return { ok: false, error: "S3 not configured" }
  }
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
    return { ok: true, body: Buffer.from(bytes) }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "fetch failed" }
  }
}
