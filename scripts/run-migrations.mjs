/**
 * Run SQL migration files against Neon using DATABASE_URL from .env.local
 *
 * Usage:
 *   npm run db:migrate:iv
 *   npm run db:migrate:intake
 *   node scripts/run-migrations.mjs 017 018
 */

import { neon } from "@neondatabase/serverless"
import { readFileSync, existsSync, readdirSync } from "fs"
import { join } from "path"

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

function resolveMigrationFile(arg) {
  if (arg.endsWith(".sql")) return arg
  const scriptsDir = join(process.cwd(), "scripts")
  const match = readdirSync(scriptsDir).find((f) => f.startsWith(`${arg}_`) && f.endsWith(".sql"))
  if (!match) {
    throw new Error(`No migration file found for "${arg}" in scripts/ (expected ${arg}_*.sql)`)
  }
  return match
}

function splitSqlStatements(sql) {
  return sql
    .split(";")
    .map((chunk) =>
      chunk
        .split(/\r?\n/)
        .filter((line) => !line.trim().startsWith("--"))
        .join("\n")
        .trim()
    )
    .filter(Boolean)
}

async function runFile(db, filename) {
  const filePath = join(process.cwd(), "scripts", filename)
  if (!existsSync(filePath)) {
    throw new Error(`Migration file not found: scripts/${filename}`)
  }

  const statements = splitSqlStatements(readFileSync(filePath, "utf8"))
  console.log(`\n→ Running ${filename} (${statements.length} statements)...`)

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i]
    try {
      await db.query(statement, [])
      console.log(`  ✓ statement ${i + 1}/${statements.length}`)
    } catch (err) {
      console.error(`  ✗ statement ${i + 1} failed:`)
      console.error(`    ${statement.slice(0, 160).replace(/\s+/g, " ")}...`)
      throw err
    }
  }

  console.log(`  Done: ${filename}`)
}

async function main() {
  loadEnvLocal()

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error(`
ERROR: DATABASE_URL is not set.

Do this once:
1. Open https://console.neon.tech
2. Select your Clear Choice project
3. Dashboard → Connect → copy the connection string
4. Create .env.local in the project root:

   DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require

5. Run the migration command again.
`)
    process.exit(1)
  }

  const args = process.argv.slice(2)
  if (args.length === 0) {
    console.error("Usage: node scripts/run-migrations.mjs 017 018")
    process.exit(1)
  }

  const files = args.map(resolveMigrationFile)
  const db = neon(databaseUrl)

  console.log("Neon migration runner")
  console.log(`Database: ${databaseUrl.replace(/:[^:@/]+@/, ":****@")}`)

  for (const file of files) {
    await runFile(db, file)
  }

  console.log("\nAll migrations completed successfully.")
}

main().catch((err) => {
  console.error("\nMigration failed:", err.message || err)
  process.exit(1)
})
