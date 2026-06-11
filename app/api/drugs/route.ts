import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  throw new Error("[drugs] DATABASE_URL env var is not set.")
}
const db = neon(DATABASE_URL)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const prefixOnly = searchParams.get("prefix") === "1"
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)))
    const offset = (page - 1) * limit

    let medications: any[]
    let total: number

    if (query) {
      const normalized = query.toLowerCase()
      const searchPattern = prefixOnly ? `${normalized}%` : `%${normalized}%`

      if (prefixOnly) {
        medications = await db`
          SELECT id, name, generic_name, brand_name, strength, dosage_form,
                 ndc, acquisition_cost, our_price, typical_retail_price,
                 per_unit_cost, package_quantity, is_generic, days_supply, category
          FROM medications
          WHERE LOWER(name) LIKE ${searchPattern}
          ORDER BY name ASC, strength ASC
          LIMIT ${limit} OFFSET ${offset}
        `
        const countResult = await db`
          SELECT COUNT(*)::int as total FROM medications
          WHERE LOWER(name) LIKE ${searchPattern}
        `
        total = countResult[0]?.total || 0
      } else {
        medications = await db`
          SELECT id, name, generic_name, brand_name, strength, dosage_form,
                 ndc, acquisition_cost, our_price, typical_retail_price,
                 per_unit_cost, package_quantity, is_generic, days_supply, category
          FROM medications
          WHERE LOWER(name) LIKE ${searchPattern}
             OR LOWER(COALESCE(generic_name, '')) LIKE ${searchPattern}
             OR LOWER(COALESCE(ndc, '')) LIKE ${searchPattern}
          ORDER BY name ASC, strength ASC
          LIMIT ${limit} OFFSET ${offset}
        `
        const countResult = await db`
          SELECT COUNT(*)::int as total FROM medications
          WHERE LOWER(name) LIKE ${searchPattern}
             OR LOWER(COALESCE(generic_name, '')) LIKE ${searchPattern}
             OR LOWER(COALESCE(ndc, '')) LIKE ${searchPattern}
        `
        total = countResult[0]?.total || 0
      }
    } else {
      medications = await db`
        SELECT id, name, generic_name, brand_name, strength, dosage_form,
               ndc, acquisition_cost, our_price, typical_retail_price,
               per_unit_cost, package_quantity, is_generic, days_supply, category
        FROM medications
        ORDER BY name ASC
        LIMIT ${limit} OFFSET ${offset}
      `
      const countResult = await db`SELECT COUNT(*)::int as total FROM medications`
      total = countResult[0]?.total || 0
    }

    return NextResponse.json({
      medications,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error: any) {
    console.error("[drugs] Error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
