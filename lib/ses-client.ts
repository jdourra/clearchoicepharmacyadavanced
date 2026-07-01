import "server-only"
import { SESClient } from "@aws-sdk/client-ses"
import { getAwsCredentials, getAwsRegion } from "@/lib/s3-env"

export function getSesClient(): SESClient {
  return new SESClient({
    region: getAwsRegion(),
    credentials: getAwsCredentials(),
  })
}
