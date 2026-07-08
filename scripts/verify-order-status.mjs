import { neon } from "@neondatabase/serverless"
import { readFileSync } from "fs"

for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const t = line.trim()
  if (!t || t.startsWith("#")) continue
  const eq = t.indexOf("=")
  if (eq === -1) continue
  const key = t.slice(0, eq).trim()
  if (!process.env[key]) process.env[key] = t.slice(eq + 1).trim()
}

const sql = neon(process.env.DATABASE_URL)

const rows = await sql`
  SELECT conname, pg_get_constraintdef(oid) AS def
  FROM pg_constraint
  WHERE conrelid = 'orders'::regclass
    AND contype = 'c'
    AND conname LIKE '%status%'
`
console.log("Constraints:", rows)

const sample = await sql`SELECT id, status FROM orders LIMIT 1`
if (sample[0]) {
  const { id, status: orig } = sample[0]
  await sql`UPDATE orders SET status = 'shipped' WHERE id = ${id}`
  await sql`UPDATE orders SET status = ${orig} WHERE id = ${id}`
  console.log("shipped update test: OK for order", id)
} else {
  console.log("no orders to test")
}
