/**
 * Email pending clinical intakes: clinician delay + 10% courtesy.
 *
 * Usage: node scripts/send-clinician-delay-notices.mjs
 */
import { readFileSync, existsSync } from "fs"
import { join } from "path"
import { neon } from "@neondatabase/serverless"
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

const SUBJECT = "Update on your intake — Clear Choice Pharmacy"
const TAG = "[staff_note:hold_for_new_clinician courtesy_10pct_if_approved]"
const PENDING = ["pending_provider_review", "pending_review", "provider_follow_up"]

function bodyFor(firstName) {
  const name = String(firstName || "").trim()
  const greeting = name ? `Hi ${name},` : "Hi,"
  return `${greeting}

Thank you for submitting your intake with Clear Choice Pharmacy.

The physician originally assigned to review your information is not available right now. We are assigning a new licensed clinician, who we expect to be onboard next week.

We will hold your intake as submitted. You do not need to fill out the form again. The new clinician will review your information when they come onboard. Approval is still based on that clinical review.

For the delay, we will apply a 10% courtesy discount to your order if treatment is approved.

If you have questions, or if you would rather cancel while you wait, call us at (248) 987-6182 or reply to this email.

Thank you for your patience,
Clear Choice Pharmacy
40890 Grand River Ave, Novi, MI
(248) 987-6182`
}

const SOURCES = [
  { service: "weight_loss", table: "weight_loss_intake" },
  { service: "trt", table: "trt_intake" },
  { service: "mens_health", table: "patient_intake" },
  { service: "rejuvenation_vial", table: "rejuvenation_vial_intakes" },
  { service: "iv_rejuvenation", table: "iv_booking_requests" },
  { service: "specialty_pharmacy", table: "specialty_intake" },
  { service: "prescription_telemedicine", table: "prescription_telemedicine_intake" },
]

async function main() {
  loadEnvLocal()
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set")
    process.exit(1)
  }

  const region = process.env.SES_REGION || process.env.AWS_REGION || "us-east-2"
  const from = process.env.SES_SENDER_EMAIL || process.env.SES_FROM_EMAIL || "intake@clearchoicepharmacy.com"
  const accessKey = process.env.AWS_ACCESS_KEY_ID
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY
  if (!accessKey || !secretKey) {
    console.error("AWS SES credentials missing")
    process.exit(1)
  }

  const sql = neon(databaseUrl)
  const ses = new SESClient({
    region,
    credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
  })
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://clearchoicepharmacy.com").replace(/\/$/, "")
  const placeholders = PENDING.map((_, i) => `$${i + 1}`).join(", ")

  const staffRows = await sql.query(
    `SELECT id FROM staff_users WHERE is_active = true ORDER BY CASE WHEN role = 'admin' THEN 0 ELSE 1 END LIMIT 1`,
    []
  )
  const staffId = staffRows[0]?.id ? String(staffRows[0].id) : null

  let emailed = 0
  let skipped = 0
  let failed = 0

  for (const source of SOURCES) {
    let rows = []
    try {
      rows = await sql.query(
        `SELECT id, first_name, email, patient_id, status
         FROM ${source.table}
         WHERE status IN (${placeholders})
         ORDER BY created_at DESC`,
        PENDING
      )
    } catch (err) {
      console.warn(`skip table ${source.table}:`, err instanceof Error ? err.message : err)
      continue
    }

    for (const row of rows) {
      const colRows = await sql.query(
        `SELECT column_name FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = $1
           AND column_name IN ('additional_concerns','additional_notes')`,
        [source.table]
      )
      const noteCols = colRows.map((c) => String(c.column_name))
      let notes = ""
      if (noteCols.length) {
        const noteRows = await sql.query(
          `SELECT ${noteCols.join(", ")} FROM ${source.table} WHERE id = $1`,
          [row.id]
        )
        notes = noteCols.map((c) => String(noteRows[0]?.[c] ?? "")).join("\n")
      }
      if (notes.includes("courtesy_10pct_if_approved")) {
        skipped += 1
        continue
      }
      const to = String(row.email || "").trim()
      if (!to) {
        failed += 1
        continue
      }
      const body = bodyFor(row.first_name)
      const text = `${body}

You can also read this message in your patient portal:
${siteUrl}/account`
      try {
        await ses.send(
          new SendEmailCommand({
            Source: `Clear Choice Pharmacy <${from}>`,
            Destination: { ToAddresses: [to] },
            ReplyToAddresses: [from],
            Message: {
              Subject: { Data: SUBJECT, Charset: "UTF-8" },
              Body: { Text: { Data: text, Charset: "UTF-8" } },
            },
          })
        )
        emailed += 1
      } catch (err) {
        failed += 1
        console.error(`email failed for ${source.service} ${row.id}:`, err instanceof Error ? err.message : err)
        continue
      }

      if (row.patient_id && staffId) {
        try {
          await sql.query(
            `INSERT INTO messages (sender_type, sender_id, recipient_type, recipient_id, subject, body)
             VALUES ('staff', $1, 'patient', $2, $3, $4)`,
            [staffId, String(row.patient_id), SUBJECT, body]
          )
        } catch (err) {
          console.warn(`portal message skipped for ${row.id}:`, err instanceof Error ? err.message : err)
        }
      }

      const nextNotes = notes.trim() ? `${notes.trim()}\n${TAG}` : TAG
      const writeCol = noteCols.includes("additional_concerns")
        ? "additional_concerns"
        : noteCols.includes("additional_notes")
          ? "additional_notes"
          : null
      if (writeCol) {
        try {
          await sql.query(`UPDATE ${source.table} SET ${writeCol} = $2 WHERE id = $1`, [
            row.id,
            nextNotes,
          ])
        } catch (err) {
          console.warn(`could not note ${source.table} ${row.id}:`, err instanceof Error ? err.message : err)
        }
      }
    }
  }

  console.log(JSON.stringify({ emailed, skipped, failed }))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
