import { NextResponse } from "next/server"
import { HeadBucketCommand, S3Client } from "@aws-sdk/client-s3"
import { staffAuth } from "@/lib/auth"
import { envTrim, s3ConfigStatus } from "@/lib/s3-env"

export async function GET(request: Request) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!staff || staff.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const status = s3ConfigStatus()
    let bucketReachable: boolean | null = null
    let bucketError: string | null = null

    if (status.configured && status.bucket) {
      try {
        const client = new S3Client({
          region: envTrim("AWS_REGION") || "us-east-1",
          credentials: {
            accessKeyId: envTrim("AWS_ACCESS_KEY_ID")!,
            secretAccessKey: envTrim("AWS_SECRET_ACCESS_KEY")!,
          },
        })
        await client.send(new HeadBucketCommand({ Bucket: status.bucket }))
        bucketReachable = true
      } catch (err) {
        bucketReachable = false
        bucketError = err instanceof Error ? err.message : "HeadBucket failed"
      }
    }

    return NextResponse.json({
      ...status,
      bucketReachable,
      bucketError,
      hint: status.configured
        ? bucketReachable
          ? "S3 is configured. Prescription uploads should work after redeploy if you just added vars."
          : "Env vars are set but bucket check failed — verify IAM and bucket name."
        : "Add INTAKE_ID_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION in Vercel for Production and Preview, then Redeploy. Testing on *.vercel.app requires Preview env vars.",
    })
  } catch (error) {
    console.error("[admin/storage-health]", error)
    return NextResponse.json({ error: "Health check failed" }, { status: 500 })
  }
}
