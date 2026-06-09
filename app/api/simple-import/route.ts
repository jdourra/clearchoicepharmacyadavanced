/**
 * Simple Import API - Direct database insertion
 * NDC treated as TEXT
 */
import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  throw new Error("[simple-import] DATABASE_URL env var is not set.")
}
const db = neon(DATABASE_URL)

export const dynamic = "force-dynamic"
export const maxDuration = 60

interface Medication {
  name: string
  ndc: string | null
  per_unit_cost: number | null
  dosage_form: string | null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const medications: Medication[] = body.medications

    if (!medications || !Array.isArray(medications)) {
      return NextResponse.json({ error: "No medications provided" }, { status: 400 })
    }

    let inserted = 0
    let updated = 0
    let errors = 0

    // Process in batches of 50
    const BATCH_SIZE = 50
    for (let i = 0; i < medications.length; i += BATCH_SIZE) {
      const batch = medications.slice(i, i + BATCH_SIZE)
      
      for (const med of batch) {
        try {
          // Calculate prices
          const perUnit = med.per_unit_cost || 0
          const ourPrice = Math.round((perUnit * 30 * 1.15 + 5) * 100) / 100 // 30 day supply + 15% markup + $5 fee
          const retailPrice = Math.round(ourPrice * 2.5 * 100) / 100

          // Check if medication with this NDC exists (NDC as text)
          if (med.ndc) {
            const existing = await db`SELECT id FROM medications WHERE ndc = ${med.ndc} LIMIT 1`
            
            if (existing.length > 0) {
              // Update existing
              await db`
                UPDATE medications 
                SET 
                  name = ${med.name},
                  per_unit_cost = ${perUnit},
                  our_price = ${ourPrice},
                  typical_retail_price = ${retailPrice},
                  dosage_form = ${med.dosage_form || 'EACH'},
                  updated_at = NOW()
                WHERE ndc = ${med.ndc}
              `
              updated++
            } else {
              // Insert new
              await db`
                INSERT INTO medications (name, ndc, per_unit_cost, our_price, typical_retail_price, dosage_form, is_active, created_at, updated_at)
                VALUES (${med.name}, ${med.ndc}, ${perUnit}, ${ourPrice}, ${retailPrice}, ${med.dosage_form || 'EACH'}, true, NOW(), NOW())
              `
              inserted++
            }
          } else {
            // No NDC - insert as new
            await db`
              INSERT INTO medications (name, per_unit_cost, our_price, typical_retail_price, dosage_form, is_active, created_at, updated_at)
              VALUES (${med.name}, ${perUnit}, ${ourPrice}, ${retailPrice}, ${med.dosage_form || 'EACH'}, true, NOW(), NOW())
            `
            inserted++
          }
        } catch (err) {
          console.error("Error inserting medication:", med.name, err)
          errors++
        }
      }
    }

    return NextResponse.json({
      success: true,
      inserted,
      updated,
      errors,
      total: medications.length
    })
  } catch (err) {
    console.error("Import error:", err)
    return NextResponse.json(
      { error: `Import failed: ${(err as Error).message}` },
      { status: 500 }
    )
  }
}
