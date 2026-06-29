import fs from "fs"
import path from "path"
import { neon } from "@neondatabase/serverless"

const envPath = path.join(process.cwd(), ".env.local")
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
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
    process.env[key] = value
  }
}

const password = process.argv[2]
const email = (process.argv[3] || "admin@clearchoicepharmacy.com").toLowerCase()

if (!password) {
  console.error("Usage: node scripts/update-admin-password.mjs <password> [email]")
  process.exit(1)
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set in .env.local")
  process.exit(1)
}

const sql = neon(process.env.DATABASE_URL)

const cols = await sql`
  SELECT column_name FROM information_schema.columns
  WHERE table_name = 'staff_users' ORDER BY ordinal_position
`
const columnSet = new Set(cols.map((c) => c.column_name))
const activeCol = columnSet.has("is_active") ? "is_active" : columnSet.has("active") ? "active" : null

const users = await sql`SELECT id, email, role FROM staff_users WHERE LOWER(email) = ${email}`
if (users.length === 0) {
  const hashRows = await sql`SELECT crypt(${password}, gen_salt('bf')) AS password_hash`
  const passwordHash = hashRows[0].password_hash

  if (columnSet.has("full_name")) {
    await sql`
      INSERT INTO staff_users (email, password_hash, role, full_name, is_active)
      VALUES (${email}, ${passwordHash}, 'admin', 'Admin User', true)
    `
  } else {
    await sql`
      INSERT INTO staff_users (email, password_hash, role, first_name, last_name, active)
      VALUES (${email}, ${passwordHash}, 'admin', 'Admin', 'User', true)
    `
  }
  console.log(`Created admin user ${email} with new password.`)
  process.exit(0)
}

const hashRows = await sql`SELECT crypt(${password}, gen_salt('bf')) AS password_hash`
const passwordHash = hashRows[0].password_hash

await sql`
  UPDATE staff_users
  SET password_hash = ${passwordHash}, role = 'admin'
  WHERE LOWER(email) = ${email}
`

if (activeCol === "is_active") {
  await sql`UPDATE staff_users SET is_active = true WHERE LOWER(email) = ${email}`
} else if (activeCol === "active") {
  await sql`UPDATE staff_users SET active = true WHERE LOWER(email) = ${email}`
}

console.log(`Updated password for ${email}`)
