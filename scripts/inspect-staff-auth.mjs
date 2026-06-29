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

const email = "admin@clearchoicepharmacy.com"
const password = "Summer@2026"
const sql = neon(process.env.DATABASE_URL)

const cols = await sql`
  SELECT column_name FROM information_schema.columns
  WHERE table_name = 'staff_users' ORDER BY ordinal_position
`
console.log("columns:", cols.map((c) => c.column_name).join(", "))

const users = await sql`
  SELECT * FROM staff_users WHERE LOWER(email) = ${email} LIMIT 1
`
console.log("admin row keys:", users[0] ? Object.keys(users[0]) : "none")
console.log("admin row:", JSON.stringify(users[0], null, 2))

try {
  const test1 = await sql`
    SELECT id, email, full_name, role FROM staff_users
    WHERE email = ${email}
      AND password_hash = crypt(${password}, password_hash)
      AND is_active = true
  `
  console.log("auth query (is_active + full_name):", test1)
} catch (e) {
  console.log("auth query (is_active + full_name) ERROR:", e.message)
}

try {
  const test2 = await sql`
    SELECT id, email, role FROM staff_users
    WHERE email = ${email}
      AND password_hash = crypt(${password}, password_hash)
      AND active = true
  `
  console.log("auth query (active):", test2)
} catch (e) {
  console.log("auth query (active) ERROR:", e.message)
}

const sessions = await sql`SELECT COUNT(*)::int AS n FROM sessions`
console.log("sessions table count:", sessions[0]?.n)
