/**
 * Request AWS SES production access (exit sandbox) for us-east-2.
 *
 * Usage: npm run ses:request-production
 *
 * Requires AWS credentials in .env.local with permission for ses:PutAccountDetails.
 */

import { readFileSync, existsSync } from "fs"
import { join } from "path"
import { SESv2Client, PutAccountDetailsCommand, GetAccountCommand } from "@aws-sdk/client-sesv2"

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
  const websiteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://clearchoicepharmacy.com"
  const contactEmail =
    process.env.DR_DOURRA_EMAIL?.trim() ||
    process.env.SES_SENDER_EMAIL?.trim() ||
    "intake@clearchoicepharmacy.com"

  if (!accessKey || !secretKey) {
    console.error("Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env.local")
    process.exit(1)
  }

  const client = new SESv2Client({
    region,
    credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
  })

  try {
    const account = await client.send(new GetAccountCommand({}))
    if (account.ProductionAccessEnabled) {
      console.log("SES production access is already enabled in", region)
      console.log("Patients can receive email. Run: npm run ses:verify -- --to patient@example.com")
      return
    }
  } catch (err) {
    console.warn("Could not read account status:", err.message)
  }

  const useCase = `Clear Choice Pharmacy (clearchoicepharmacy.com) is a licensed Michigan compounding pharmacy offering telehealth clinical intakes reviewed by Dr. Dourra. We send transactional emails only: intake approval/denial/follow-up notifications, prescription status updates, and admin-to-patient portal messages. Patients opt in during intake. We do not send marketing email. Volume: low (dozens per week). Bounce/complaint handling: manual review via admin portal.`

  console.log("Submitting SES production access request...")
  console.log(`Region:   ${region}`)
  console.log(`Website:  ${websiteUrl}`)
  console.log(`Contact:  ${contactEmail}`)
  console.log(`Mail type: TRANSACTIONAL\n`)

  try {
    await client.send(
      new PutAccountDetailsCommand({
        ProductionAccessEnabled: true,
        MailType: "TRANSACTIONAL",
        WebsiteURL: websiteUrl,
        AdditionalContactEmailAddresses: [contactEmail],
        ContactLanguage: "EN",
        UseCaseDescription: useCase,
      })
    )
    console.log("Production access request submitted successfully.")
    console.log("AWS typically responds within 24 hours. Check email and AWS Support Center.")
    console.log("\nAfter approval, verify with:")
    console.log("  npm run ses:status")
    console.log("  npm run ses:verify -- --to ydourra@gmail.com")
  } catch (err) {
    const msg = err.message || String(err)
    const name = err.name || "Error"
    const status = err.$metadata?.httpStatusCode
    console.error("Request failed:", name, msg, status ? `(HTTP ${status})` : "")
    if (msg.includes("ConflictException") || msg.includes("Conflict")) {
      console.error(
        "\nA production access review may already be pending or recently decided."
      )
      console.error("Check AWS Support Center or SES console → Account dashboard.")
    }
    if (msg.includes("AccessDenied")) {
      console.error("\nIAM user needs ses:PutAccountDetails. Use root account or admin IAM temporarily.")
    }
    process.exit(1)
  }
}

main()
