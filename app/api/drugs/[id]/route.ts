import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  throw new Error("[drugs/:id] DATABASE_URL env var is not set.")
}
const db = neon(DATABASE_URL)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await db`
      SELECT id, name, generic_name, brand_name, strength, dosage_form,
             ndc, acquisition_cost, our_price, typical_retail_price,
             per_unit_cost, package_quantity, is_generic, days_supply, 
             category, description
      FROM medications
      WHERE id = ${id}
    `
    if (result.length === 0) {
      return NextResponse.json({ error: "Medication not found" }, { status: 404 })
    }
    return NextResponse.json(result[0])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
