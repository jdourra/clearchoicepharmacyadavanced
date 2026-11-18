import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"
import { CONTROLLED_SUBSTANCE_MESSAGE, isControlledMedication } from "@/lib/controlled-substances"

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
             per_unit_cost, package_quantity, is_generic, description, category
      FROM medications 
      WHERE id = ${id}
      LIMIT 1
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Medication not found" }, { status: 404 })
    }

    if (isControlledMedication(result[0])) {
      return NextResponse.json({
        id: result[0].id,
        name: result[0].name,
        controlledSubstance: true,
        message: CONTROLLED_SUBSTANCE_MESSAGE,
      })
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
