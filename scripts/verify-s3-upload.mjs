/**
 * Verify S3 upload/download with credentials from .env.local
 *
 * Usage: npm run s3:verify
 */

import { readFileSync, existsSync } from "fs"
import { join } from "path"
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3"

function loadEnvLocal() {
  const envPath = join(process.cwd(), ".env.local")
  if (!existsSync(envPath)) return

  const content = readFileSync(envPath, "utf8")
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}

async function main() {
  loadEnvLocal()

  const bucket = process.env.INTAKE_ID_BUCKET
  const region = process.env.AWS_REGION || "us-east-1"
  const accessKey = process.env.AWS_ACCESS_KEY_ID
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY

  if (!bucket || !accessKey || !secretKey) {
    console.error("Set INTAKE_ID_BUCKET, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY in .env.local")
    console.error("Run: npm run s3:setup")
    process.exit(1)
  }

  const client = new S3Client({
    region,
    credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
  })

  const key = `__healthcheck__/verify-${Date.now()}.txt`
  const body = "Clear Choice Pharmacy S3 verify"

  console.log(`Uploading test object to s3://${bucket}/${key} ...`)
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: "text/plain",
      ServerSideEncryption: "AES256",
    })
  )

  const got = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }))
  const text = await got.Body?.transformToString()
  if (text !== body) throw new Error("Downloaded content mismatch")

  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))

  console.log("S3 verify OK — upload, download, and delete succeeded.")
}

main().catch((err) => {
  console.error("Verify failed:", err.message || err)
  process.exit(1)
})
