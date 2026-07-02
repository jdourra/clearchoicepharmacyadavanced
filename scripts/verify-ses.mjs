/**
 * Send a test email via AWS SES using credentials from .env.local
 *
 * Usage:
 *   npm run ses:verify
 *   npm run ses:verify -- --to you@example.com
 *
 * Required in .env.local:
 *   AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, SES_SENDER_EMAIL
 *
 * Recipient: --to flag, or SES_VERIFY_TO, or DR_DOURRA_EMAIL
 */

import { readFileSync, existsSync } from "fs"
import { join } from "path"
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"

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

function parseToArg() {
  const idx = process.argv.indexOf("--to")
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1].trim()
  return null
}

async function main() {
  loadEnvLocal()

  const region = process.env.SES_REGION || process.env.AWS_REGION || "us-east-2"
  const accessKey = process.env.AWS_ACCESS_KEY_ID
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY
  const from = process.env.SES_SENDER_EMAIL
  const to = (
    parseToArg() ||
    process.env.SES_VERIFY_TO ||
    process.env.DR_DOURRA_EMAIL ||
    process.env.TELEHEALTH_CLINICIAN_EMAIL ||
    ""
  )
    .trim()
    .toLowerCase()

  if (!accessKey || !secretKey) {
    console.error("Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env.local")
    process.exit(1)
  }
  if (!from) {
    console.error("Set SES_SENDER_EMAIL in .env.local (must be verified in AWS SES)")
    process.exit(1)
  }
  if (!to) {
    console.error(
      "Set a recipient: npm run ses:verify -- --to your@email.com\n" +
        "Or set SES_VERIFY_TO or DR_DOURRA_EMAIL in .env.local"
    )
    process.exit(1)
  }

  const client = new SESClient({
    region,
    credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
  })

  console.log(`Region: ${region}`)
  console.log(`From:   ${from}`)
  console.log(`To:     ${to}`)
  console.log("Sending test email...")

  await client.send(
    new SendEmailCommand({
      Source: `Clear Choice Pharmacy <${from}>`,
      Destination: { ToAddresses: [to] },
      ReplyToAddresses: [from],
      Message: {
        Subject: {
          Data: "Clear Choice Pharmacy — SES test",
          Charset: "UTF-8",
        },
        Body: {
          Text: {
            Data:
              "SES is configured correctly.\n\nIntake approvals and patient notifications can be sent from this app.\n\n— Clear Choice Pharmacy",
            Charset: "UTF-8",
          },
        },
      },
    })
  )

  console.log("SES verify OK — check the inbox (and spam) for the test message.")
  console.log(
    "\nIf SES is in sandbox mode, both sender and recipient must be verified in the SES console."
  )
}

main().catch((err) => {
  const msg = err.message || String(err)
  console.error("SES verify failed:", msg)
  if (msg.includes("AccessDenied") || msg.includes("not authorized")) {
    console.error("\nAttach scripts/aws-iam-ses-policy.json (or aws-iam-s3-ses-policy.json) to your IAM user.")
  }
  if (msg.includes("Email address is not verified") || msg.includes("MessageRejected")) {
    console.error("\nVerify SES_SENDER_EMAIL and the recipient in AWS SES → Verified identities.")
    console.error("Or request production access to leave sandbox mode.")
  }
  process.exit(1)
})
