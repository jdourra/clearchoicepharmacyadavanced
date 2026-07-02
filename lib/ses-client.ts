import "server-only"
import { SESClient } from "@aws-sdk/client-ses"
import { getAwsCredentials } from "@/lib/s3-env"
import { getSesRegion } from "@/lib/ses-env"

export function getSesClient(): SESClient {
  return new SESClient({
    region: getSesRegion(),
    credentials: getAwsCredentials(),
  })
}
