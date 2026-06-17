import { neon } from "@neondatabase/serverless"
import { readFileSync, existsSync } from "fs"
import { join } from "path"

function loadEnvLocal() {
  const envPath = join(process.cwd(), ".env.local")
  if (!existsSync(envPath)) return
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (!process.env[key]) process.env[key] = value
  }
}

const EXPECTED_COLUMNS = [
  "id",
  "first_name",
  "last_name",
  "email",
  "phone",
  "shipping_address",
  "shipping_city",
  "shipping_state",
  "shipping_zip",
  "selected_vial",
  "selected_vial_title",
  "kit_price",
  "allergies",
  "current_medications",
  "pregnant_or_breastfeeding",
  "kidney_disease",
  "heart_condition",
  "additional_notes",
  "status",
  "created_at",
]

const EXPECTED_INDEXES = [
  "rejuvenation_vial_intakes_pkey",
  "idx_vial_intake_email",
  "idx_vial_intake_status",
  "idx_vial_intake_created_at",
]

loadEnvLocal()
const db = neon(process.env.DATABASE_URL)

const tables = await db.query(
  `SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public' AND table_name = 'rejuvenation_vial_intakes'`
)

if (tables.length === 0) {
  console.log("RESULT: NOT MIGRATED")
  console.log("The table rejuvenation_vial_intakes does not exist.")
  console.log("Run: npm run db:migrate:iv")
  process.exit(1)
}

const cols = await db.query(
  `SELECT column_name FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'rejuvenation_vial_intakes'
   ORDER BY ordinal_position`
)
const columnNames = cols.map((c) => c.column_name)

const indexes = await db.query(
  `SELECT indexname FROM pg_indexes WHERE tablename = 'rejuvenation_vial_intakes' ORDER BY indexname`
)
const indexNames = indexes.map((i) => i.indexname)

const missingCols = EXPECTED_COLUMNS.filter((c) => !columnNames.includes(c))
const extraCols = columnNames.filter((c) => !EXPECTED_COLUMNS.includes(c))
const missingIndexes = EXPECTED_INDEXES.filter((i) => !indexNames.includes(i))

const ok = missingCols.length === 0 && missingIndexes.length === 0

if (ok) {
  console.log("RESULT: OK — migration applied correctly")
  console.log(`Table: rejuvenation_vial_intakes (${columnNames.length} columns)`)
  console.log(`Indexes: ${indexNames.join(", ")}`)
} else {
  console.log("RESULT: PARTIAL — table exists but schema does not match expected migration")
  if (missingCols.length) console.log("Missing columns:", missingCols.join(", "))
  if (extraCols.length) console.log("Extra columns:", extraCols.join(", "))
  if (missingIndexes.length) console.log("Missing indexes:", missingIndexes.join(", "))
  console.log("Found indexes:", indexNames.join(", "))
  process.exit(1)
}
