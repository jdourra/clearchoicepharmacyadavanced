import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"
import * as XLSX from "xlsx"

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  throw new Error("[medications/import] DATABASE_URL env var is not set.")
}
const sql = neon(DATABASE_URL)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const mode = formData.get("mode") as string || "upsert"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: "array" })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

    if (rawData.length < 2) {
      return NextResponse.json({ error: "File is empty or has no data rows" }, { status: 400 })
    }

    const headers = rawData[0].map((h: any) => String(h || "").toLowerCase().trim())
    const dataRows = rawData.slice(1).filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ""))

    // Map columns - your Excel has: DRUG NAME, NDC, Pricing Unit, Unit PRICE
    const columnMap: Record<string, number> = {}
    
    const mappings: Record<string, string[]> = {
      name: ["drug name", "name", "medication name", "medication", "drug_name"],
      ndc: ["ndc", "ndc code", "ndc_code"],
      dosage_form: ["pricing unit", "form", "dosage form", "unit", "type"],
      per_unit_cost: ["unit price", "price", "unit_price", "cost", "unit cost"]
    }

    for (const [field, aliases] of Object.entries(mappings)) {
      for (let i = 0; i < headers.length; i++) {
        if (aliases.some(alias => headers[i].includes(alias))) {
          columnMap[field] = i
          break
        }
      }
    }

    if (!("name" in columnMap)) {
      return NextResponse.json({ 
        error: "Missing required column: DRUG NAME", 
        detectedHeaders: headers 
      }, { status: 400 })
    }

    let inserted = 0
    let updated = 0
    let skipped = 0
    const errors: string[] = []
    const BATCH_SIZE = 50

    for (let i = 0; i < dataRows.length; i += BATCH_SIZE) {
      const batch = dataRows.slice(i, i + BATCH_SIZE)

      for (const row of batch) {
        try {
          const name = row[columnMap.name]
          if (!name || String(name).trim() === "") {
            skipped++
            continue
          }

          const ndcVal = columnMap.ndc !== undefined ? row[columnMap.ndc] : null
          const formVal = columnMap.dosage_form !== undefined ? row[columnMap.dosage_form] : null
          const priceVal = columnMap.per_unit_cost !== undefined ? row[columnMap.per_unit_cost] : null

          const ndc = ndcVal ? String(ndcVal).trim() : null
          const dosageForm = formVal ? String(formVal).trim() : "TABLET"
          const perUnitCost = priceVal ? parseFloat(String(priceVal).replace(/[$,]/g, "")) : null

          // Calculate our_price from per_unit_cost (30-day supply with 15% markup + $5 fee)
          const ourPrice = perUnitCost ? (perUnitCost * 30 * 1.15 + 5) : null

          if (mode === "upsert") {
            // Try to update first by NDC or name
            const existing = ndc 
              ? await sql`SELECT id FROM medications WHERE ndc = ${ndc} LIMIT 1`
              : await sql`SELECT id FROM medications WHERE LOWER(name) = LOWER(${String(name).trim()}) LIMIT 1`

            if (existing.length > 0) {
              await sql`
                UPDATE medications SET
                  name = ${String(name).trim()},
                  ndc = COALESCE(${ndc}, ndc),
                  dosage_form = COALESCE(${dosageForm}, dosage_form),
                  per_unit_cost = COALESCE(${perUnitCost}, per_unit_cost),
                  our_price = COALESCE(${ourPrice}, our_price),
                  updated_at = NOW()
                WHERE id = ${existing[0].id}
              `
              updated++
            } else {
              await sql`
                INSERT INTO medications (name, ndc, dosage_form, per_unit_cost, our_price, is_generic)
                VALUES (${String(name).trim()}, ${ndc}, ${dosageForm}, ${perUnitCost}, ${ourPrice}, true)
              `
              inserted++
            }
          } else {
            // Replace mode - just insert
            await sql`
              INSERT INTO medications (name, ndc, dosage_form, per_unit_cost, our_price, is_generic)
              VALUES (${String(name).trim()}, ${ndc}, ${dosageForm}, ${perUnitCost}, ${ourPrice}, true)
            `
            inserted++
          }
        } catch (rowError) {
          errors.push(`Row ${i + batch.indexOf(row) + 2}: ${String(rowError)}`)
          skipped++
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
        errors: errors.slice(0, 10)
      },
      columnMapping: columnMap,
      detectedHeaders: headers
    })
  } catch (error) {
    console.error("[API] Import error:", error)
    return NextResponse.json(
      { error: "Import failed", details: String(error) },
      { status: 500 }
    )
  }
}
