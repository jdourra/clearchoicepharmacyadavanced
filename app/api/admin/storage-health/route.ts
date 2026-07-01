import { NextResponse } from "next/server"
import {
  DeleteObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3"
import { staffAuth } from "@/lib/auth"
import {
  awsCredentialDiagnostics,
  getAwsCredentials,
  getAwsRegion,
  getIntakeIdBucket,
  getS3Client,
  s3ConfigStatus,
} from "@/lib/s3-env"

export async function GET(request: Request) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!staff || staff.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const status = s3ConfigStatus()
    const credentials = awsCredentialDiagnostics()
    let bucketReachable: boolean | null = null
    let writeTestOk: boolean | null = null
    let bucketError: string | null = null

    const bucket = getIntakeIdBucket()
    const creds = getAwsCredentials()

    if (status.configured && bucket && creds) {
      const client = getS3Client()
      try {
        await client.send(new HeadBucketCommand({ Bucket: bucket }))
        bucketReachable = true
      } catch (err) {
        bucketReachable = false
        bucketError = err instanceof Error ? err.message : "HeadBucket failed"
      }

      if (bucketReachable) {
        const testKey = `__healthcheck__/api-${Date.now()}.txt`
        try {
          await client.send(
            new PutObjectCommand({
              Bucket: bucket,
              Key: testKey,
              Body: "storage-health",
              ContentType: "text/plain",
            })
          )
          await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: testKey }))
          writeTestOk = true
        } catch (err) {
          writeTestOk = false
          bucketError = err instanceof Error ? err.message : "Write test failed"
        }
      }
    }

    return NextResponse.json({
      ...status,
      region: getAwsRegion(),
      credentials,
      bucketReachable,
      writeTestOk,
      bucketError,
      hint:
        credentials.issues.length > 0
          ? credentials.issues.join(" ")
          : writeTestOk
            ? "S3 is fully working. Prescription uploads should succeed."
            : bucketError?.includes("signature")
              ? "Fix AWS_SECRET_ACCESS_KEY in Vercel — paste only the 40-character secret, no variable name or quotes."
              : status.configured
                ? "Env vars are set but S3 test failed — check IAM permissions and bucket name."
                : "Add INTAKE_ID_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION in Vercel for Production and Preview, then Redeploy.",
    })
  } catch (error) {
    console.error("[admin/storage-health]", error)
    return NextResponse.json({ error: "Health check failed" }, { status: 500 })
  }
}
