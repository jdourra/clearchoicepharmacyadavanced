import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"
import * as XLSX from "xlsx"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

// Database connection - now pulled from environment for security
const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  throw new Error("[meds-import] DATABASE_URL env var is not set.")
}
const db = neon(DATABASE_URL)

// Column mapping for flexible Excel headers
const COLUMN_MAP: Record<string, string[]> = {
  name: ["name", "drug name", "medication name", "drug_name", "medication"],
  ndc: ["ndc", "ndc code", "ndc_code"],
  dosage_form: ["dosage form", "dosage_form", "form", "type", "pricing unit"],
  per_unit_cost: ["per unit cost", "per_unit_cost", "unit cost", "unit price", "price"],
  strength: ["strength", "dose"],
  generic_name: ["generic name", "generic_name", "generic"],
  brand_name: ["brand name", "brand_name", "brand"],
  description: ["description", "desc", "notes"],
  acquisition_cost: ["acquisition cost", "acquisition_cost", "acq cost", "cost"],
  our_price: ["our price", "our_price", "cash price", "sell price"],
  package_quantity: ["package quantity", "package_quantity", "pkg qty", "quantity"],
  is_generic: ["is generic", "is_generic", "generic flag"],
  category: ["category", "drug category", "class"],
}

function findColumnMapping(headers: string[]): Record<string, number> {
  const mapping: Record<string, number> = {}
  const lowerHeaders = headers.map(h => h?.toString().toLowerCase().trim() || "")
  
  for (const [field, aliases] of Object.entries(COLUMN_MAP)) {
    for (let i = 0; i < lowerHeaders.length; i++) {
      if (aliases.includes(lowerHeaders[i])) {
        mapping[field] = i
        break
      }
    }
  }
  return mapping
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const mode = (formData.get("mode") as string) || "upsert"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Read Excel/CSV file
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: "array" })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

    if (jsonData.length < 2) {
      return NextResponse.json({ error: "File must have headers and at least one data row" }, { status: 400 })
    }

    const headers = jsonData[0] as string[]
    const columnMapping = findColumnMapping(headers)

    // Require at least name column
    if (!("name" in columnMapping)) {
      return NextResponse.json({
        error: "Missing required column: name (or 'Drug Name')",
        detectedColumns: headers,
        mappedColumns: columnMapping,
      }, { status: 400 })
    }

    const dataRows = jsonData.slice(1).filter(row => row.some(cell => cell != null && cell !== ""))

    let inserted = 0
    let updated = 0
    let skipped = 0
    const errors: string[] = []

    // Process in batches of 100
    const BATCH_SIZE = 100
    for (let i = 0; i < dataRows.length; i += BATCH_SIZE) {
      const batch = dataRows.slice(i, i + BATCH_SIZE)

      for (const row of batch) {
        try {
          const name = row[columnMapping.name]?.toString().trim()
          if (!name) {
            skipped++
            continue
          }

          const ndc = columnMapping.ndc !== undefined ? row[columnMapping.ndc]?.toString().trim() || null : null
          const strength = columnMapping.strength !== undefined ? row[columnMapping.strength]?.toString().trim() || null : null
          const dosageForm = columnMapping.dosage_form !== undefined ? row[columnMapping.dosage_form]?.toString().trim() || null : null
          const perUnitCost = columnMapping.per_unit_cost !== undefined ? parseFloat(row[columnMapping.per_unit_cost]) || null : null
          const acquisitionCost = columnMapping.acquisition_cost !== undefined ? parseFloat(row[columnMapping.acquisition_cost]) || null : null
          const ourPrice = columnMapping.our_price !== undefined ? parseFloat(row[columnMapping.our_price]) || null : null
          const genericName = columnMapping.generic_name !== undefined ? row[columnMapping.generic_name]?.toString().trim() || null : null
          const brandName = columnMapping.brand_name !== undefined ? row[columnMapping.brand_name]?.toString().trim() || null : null
          const description = columnMapping.description !== undefined ? row[columnMapping.description]?.toString().trim() || null : null
          const packageQuantity = columnMapping.package_quantity !== undefined ? parseInt(row[columnMapping.package_quantity]) || 1 : 1
          const isGeneric = columnMapping.is_generic !== undefined ? Boolean(row[columnMapping.is_generic]) : true
          const category = columnMapping.category !== undefined ? row[columnMapping.category]?.toString().trim() || null : null

          // Calculate our_price from per_unit_cost if not provided (30-day supply * 1.15 markup + $5 fee)
          const calculatedPrice = ourPrice || (perUnitCost ? perUnitCost * 30 * 1.15 + 5 : null)
          // Typical retail is ~3.5x our price
          const typicalRetail = calculatedPrice ? calculatedPrice * 3.5 : null

          if (mode === "upsert" && ndc) {
            // Try to update by NDC first
            const updateResult = await db`
              UPDATE medications SET
                name = ${name},
                strength = COALESCE(${strength}, strength),
                dosage_form = COALESCE(${dosageForm}, dosage_form),
                generic_name = COALESCE(${genericName}, generic_name),
                brand_name = COALESCE(${brandName}, brand_name),
                description = COALESCE(${description}, description),
                per_unit_cost = COALESCE(${perUnitCost}, per_unit_cost),
                acquisition_cost = COALESCE(${acquisitionCost}, acquisition_cost),
                our_price = COALESCE(${calculatedPrice}, our_price),
                typical_retail_price = COALESCE(${typicalRetail}, typical_retail_price),
                package_quantity = ${packageQuantity},
                is_generic = ${isGeneric},
                category = COALESCE(${category}, category),
                updated_at = NOW()
              WHERE ndc = ${ndc}
              RETURNING id
            `
            if (updateResult.length > 0) {
              updated++
              continue
            }
          }

          // Insert new medication
          await db`
            INSERT INTO medications (
              name, ndc, strength, dosage_form, generic_name, brand_name,
              description, per_unit_cost, acquisition_cost, our_price,
              typical_retail_price, package_quantity, is_generic, category
            ) VALUES (
              ${name}, ${ndc}, ${strength}, ${dosageForm}, ${genericName}, ${brandName},
              ${description}, ${perUnitCost}, ${acquisitionCost}, ${calculatedPrice},
              ${typicalRetail}, ${packageQuantity}, ${isGeneric}, ${category}
            )
          `
          inserted++
        } catch (err: any) {
          if (err.message?.includes("duplicate")) {
            skipped++
          } else {
            errors.push(`Row error: ${err.message}`)
            if (errors.length > 10) break
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: dataRows.length,
        inserted,
        updated,
        skipped,
        errors: errors.length,
      },
      mappedColumns: Object.keys(columnMapping),
      errorDetails: errors.slice(0, 5),
    })
  } catch (error: any) {
    console.error("[meds-import] Error:", error)
    return NextResponse.json({ error: error.message || "Import failed" }, { status: 500 })
  }
}
