/**
 * Check AWS SES configuration and sandbox status.
 *
 * Usage: npm run ses:status
 */

import { readFileSync, existsSync } from "fs"
import { join } from "path"
import { GetSendQuotaCommand } from "@aws-sdk/client-ses"
import { SESv2Client, GetAccountCommand } from "@aws-sdk/client-sesv2"

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

  const region = process.env.SES_REGION || process.env.AWS_REGION || "us-east-2"
  const accessKey = process.env.AWS_ACCESS_KEY_ID
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY
  const from =
    process.env.SES_SENDER_EMAIL?.trim() || "intake@clearchoicepharmacy.com"

  if (!accessKey || !secretKey) {
    console.error("Missing AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY in .env.local")
    process.exit(1)
  }

  const credentials = { accessKeyId: accessKey, secretAccessKey: secretKey }
  const ses = new (await import("@aws-sdk/client-ses")).SESClient({ region, credentials })
  const sesv2 = new SESv2Client({ region, credentials })

  console.log("Clear Choice Pharmacy — SES status\n")
  console.log(`Region:       ${region}`)
  console.log(`Sender:       ${from}`)

  try {
    const quota = await ses.send(new GetSendQuotaCommand({}))
    const sandboxLikely = (quota.Max24HourSend ?? 0) <= 200
    console.log(`24h quota:    ${quota.SentLast24Hours}/${quota.Max24HourSend}`)
    console.log(`Sandbox:      ${sandboxLikely ? "YES (patient Gmail/outlook blocked)" : "NO (production access)"}`)
  } catch (err) {
    console.log(`Quota check:  failed — ${err.message}`)
  }

  try {
    const account = await sesv2.send(new GetAccountCommand({}))
    console.log(`Production:   ${account.ProductionAccessEnabled ? "enabled" : "disabled (sandbox)"}`)
    if (account.Details?.WebsiteURL) {
      console.log(`Website URL:  ${account.Details.WebsiteURL}`)
    }
  } catch (err) {
    console.log(`Account info: failed — ${err.message}`)
  }

  console.log("\nPatient emails require production access.")
  console.log("Run: npm run ses:request-production")
  console.log("Then: npm run ses:verify -- --to patient@example.com")
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
