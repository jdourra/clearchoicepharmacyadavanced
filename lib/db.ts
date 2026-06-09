/**
 * Database connection module - Neon Serverless
 * Updated: 2026-02-26 - Cache bust
 */
import { neon } from "@neondatabase/serverless"

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  throw new Error("[db] DATABASE_URL env var is not set. Configure it in .env.local (dev) and in Vercel project settings (prod).")
}

const dbClient = neon(DATABASE_URL)

/**
 * Execute a parameterized SQL query using Neon's serverless driver.
 * Usage: sql("SELECT * FROM users WHERE id = $1", ["abc"])
 *        sql("SELECT * FROM users")  // no params
 * Returns: array of row objects
 */
export async function sql(query: string, params: any[] = []): Promise<any[]> {
  try {
    const result = await dbClient.query(query, params)
    return Array.isArray(result) ? result : []
  } catch (err) {
    console.error("[db] SQL error:", (err as Error).message, "| query:", query.slice(0, 120))
    throw err
  }
}
