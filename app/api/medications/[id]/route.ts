import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  throw new Error("[medications/:id] DATABASE_URL env var is not set.")
}
const sql = neon(DATABASE_URL)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const result = await sql`
      SELECT id, name, generic_name, brand_name, strength, dosage_form, 
             ndc, acquisition_cost, our_price, typical_retail_price, 
             per_unit_cost, package_quantity, is_generic, days_supply, description, category
      FROM medications 
      WHERE id = ${id}
      LIMIT 1
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Medication not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("[API] Medication detail error:", error)
    return NextResponse.json(
      { error: "Failed to fetch medication", details: String(error) },
      { status: 500 }
    )
  }
}
