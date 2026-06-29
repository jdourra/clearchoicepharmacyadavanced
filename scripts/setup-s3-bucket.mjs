/**
 * Create and secure an S3 bucket for prescription uploads, intake IDs, etc.
 *
 * Prerequisites:
 *   1. AWS account with IAM user access keys
 *   2. Add to .env.local:
 *        AWS_ACCESS_KEY_ID=...
 *        AWS_SECRET_ACCESS_KEY=...
 *        AWS_REGION=us-east-1
 *        INTAKE_ID_BUCKET=your-unique-bucket-name   (optional — script can generate)
 *
 * Usage:
 *   npm run s3:setup
 *   npm run s3:setup -- --bucket clearchoice-pharmacy-phi-yourname
 *   npm run s3:verify
 */

import { randomBytes } from "crypto"
import { readFileSync, existsSync, writeFileSync } from "fs"
import { join } from "path"
import {
  S3Client,
  CreateBucketCommand,
  HeadBucketCommand,
  PutPublicAccessBlockCommand,
  PutBucketEncryptionCommand,
  PutBucketVersioningCommand,
} from "@aws-sdk/client-s3"

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

function parseBucketArg() {
  const idx = process.argv.indexOf("--bucket")
  if (idx !== -1 && process.argv[idx + 1]) {
    return process.argv[idx + 1].toLowerCase().replace(/[^a-z0-9-]/g, "")
  }
  return null
}

function defaultBucketName() {
  const suffix = randomBytes(3).toString("hex")
  return `clearchoice-pharmacy-phi-${suffix}`
}

function upsertEnvLocal(bucket, region) {
  const envPath = join(process.cwd(), ".env.local")
  if (!existsSync(envPath)) {
    console.log("\nNo .env.local found — add these lines manually:\n")
    printEnvLines(bucket, region)
    return
  }

  let content = readFileSync(envPath, "utf8")
  const lines = {
    AWS_REGION: region,
    INTAKE_ID_BUCKET: bucket,
  }

  for (const [key, value] of Object.entries(lines)) {
    const regex = new RegExp(`^${key}=.*$`, "m")
    if (regex.test(content)) {
      content = content.replace(regex, `${key}=${value}`)
    } else {
      if (!content.endsWith("\n")) content += "\n"
      content += `\n# AWS S3 — secure uploads (prescriptions, intake IDs)\n${key}=${value}\n`
    }
  }

  if (!/^AWS_ACCESS_KEY_ID=/m.test(content)) {
    content += "# AWS_ACCESS_KEY_ID=your_key\n# AWS_SECRET_ACCESS_KEY=your_secret\n"
  }

  writeFileSync(envPath, content, "utf8")
  console.log("\nUpdated .env.local with INTAKE_ID_BUCKET and AWS_REGION.")
}

function printEnvLines(bucket, region) {
  console.log(`AWS_REGION=${region}`)
  console.log(`INTAKE_ID_BUCKET=${bucket}`)
  console.log("AWS_ACCESS_KEY_ID=your_key")
  console.log("AWS_SECRET_ACCESS_KEY=your_secret")
}

async function main() {
  loadEnvLocal()

  const accessKey = process.env.AWS_ACCESS_KEY_ID
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY
  const region = process.env.AWS_REGION || "us-east-1"

  if (!accessKey || !secretKey) {
    console.error(`
AWS credentials missing.

1. Sign in: https://console.aws.amazon.com/iam/
2. IAM → Users → Create user (e.g. clearchoice-s3-uploads)
3. Attach policy from scripts/aws-iam-s3-policy.json (replace YOUR_BUCKET_NAME)
   Or use AmazonS3FullAccess temporarily for setup only.
4. Security credentials → Create access key → Application running outside AWS
5. Add to .env.local:
   AWS_ACCESS_KEY_ID=...
   AWS_SECRET_ACCESS_KEY=...
   AWS_REGION=us-east-1

Then run: npm run s3:setup

See docs/S3_SETUP.md for full walkthrough.
`)
    process.exit(1)
  }

  const bucket = parseBucketArg() || process.env.INTAKE_ID_BUCKET || defaultBucketName()
  const client = new S3Client({
    region,
    credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
  })

  console.log(`Region: ${region}`)
  console.log(`Bucket: ${bucket}`)

  let exists = false
  try {
    await client.send(new HeadBucketCommand({ Bucket: bucket }))
    exists = true
    console.log("Bucket already exists — applying security settings...")
  } catch (err) {
    const code = err?.name || err?.Code
    if (code === "NotFound" || code === "NoSuchBucket") {
      console.log("Creating bucket...")
      const input =
        region === "us-east-1"
          ? { Bucket: bucket }
          : { Bucket: bucket, CreateBucketConfiguration: { LocationConstraint: region } }
      await client.send(new CreateBucketCommand(input))
      console.log("Bucket created.")
    } else if (code === "403" || code === "Forbidden") {
      console.error("Access denied. Check IAM permissions for CreateBucket / HeadBucket.")
      process.exit(1)
    } else {
      throw err
    }
  }

  await client.send(
    new PutPublicAccessBlockCommand({
      Bucket: bucket,
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        IgnorePublicAcls: true,
        BlockPublicPolicy: true,
        RestrictPublicBuckets: true,
      },
    })
  )
  console.log("Public access blocked.")

  await client.send(
    new PutBucketEncryptionCommand({
      Bucket: bucket,
      ServerSideEncryptionConfiguration: {
        Rules: [{ ApplyServerSideEncryptionByDefault: { SSEAlgorithm: "AES256" } }],
      },
    })
  )
  console.log("Default encryption enabled (AES-256).")

  await client.send(
    new PutBucketVersioningCommand({
      Bucket: bucket,
      VersioningConfiguration: { Status: "Enabled" },
    })
  )
  console.log("Versioning enabled.")

  upsertEnvLocal(bucket, region)

  console.log(`
S3 bucket is ready.

Stored paths in this bucket:
  order-prescriptions/{orderId}/...
  intake-ids/{intakePrefix}/...
  specialty-prescriptions/{intakePrefix}/...

Next:
  1. Restart dev server: npm run dev
  2. Test: npm run s3:verify
  3. Add the same AWS_* and INTAKE_ID_BUCKET vars to Vercel → Project → Environment Variables
`)
}

main().catch((err) => {
  console.error("Setup failed:", err.message || err)
  if (err.name === "BucketAlreadyOwnedByYou") {
    console.log("Bucket name taken in your account but HeadBucket failed — try a different --bucket name.")
  }
  if (err.name === "BucketAlreadyExists") {
    console.log("Bucket name is globally taken. Run: npm run s3:setup -- --bucket clearchoice-pharmacy-phi-YOURNAME")
  }
  process.exit(1)
})
