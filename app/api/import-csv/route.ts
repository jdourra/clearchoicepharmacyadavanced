/**
 * CSV Import API Route  
 * Last updated: 2026-02-26 - Force cache refresh
 */
import { neon } from "@neondatabase/serverless"
import { NextRequest, NextResponse } from "next/server"

// Database connection - pulled from environment
const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  throw new Error("[import-csv] DATABASE_URL env var is not set.")
}
const db = neon(DATABASE_URL)

export const dynamic = "force-dynamic"
export const maxDuration = 300 // 5 minutes for large files

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }
    
    console.log("[v0] Processing file:", file.name, "Size:", file.size)
    
    const text = await file.text()
    const lines = text.split("\n").filter(line => line.trim())
    
    if (lines.length === 0) {
      return NextResponse.json({ error: "Empty file" }, { status: 400 })
    }
    
    // Parse headers - handle various column names
    const rawHeaders = parseCSVLine(lines[0])
    const headers = rawHeaders.map(h => h.toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/__+/g, "_"))
    
    console.log("[v0] Headers found:", headers.slice(0, 10))
    
    // Find column indices for NADAC format:
    // NDC Description, NDC, NADAC_Per_Unit, Pricing Unit
    const nameIdx = headers.findIndex(h => 
      h.includes("ndc_description") || h.includes("drug_name") || h.includes("description") || h === "name"
    )
    const ndcIdx = headers.findIndex(h => h === "ndc" || h.includes("ndc_code"))
    const priceIdx = headers.findIndex(h => 
      h.includes("nadac_per_unit") || h.includes("unit_price") || h.includes("price") || h === "unit_price"
    )
    const unitIdx = headers.findIndex(h => h.includes("pricing_unit") || h === "unit")
    
    console.log("[v0] Column mapping - Name:", nameIdx, "NDC:", ndcIdx, "Price:", priceIdx, "Unit:", unitIdx)
    
    if (nameIdx < 0) {
      return NextResponse.json({ 
        error: "Could not find drug name column. Expected: NDC Description, Drug Name, or Name",
        detectedHeaders: rawHeaders.slice(0, 10)
      }, { status: 400 })
    }
    
    let inserted = 0
    let updated = 0
    let skipped = 0
    let errors = 0
    
    const dataLines = lines.slice(1)
    const totalRows = dataLines.length
    
    console.log("[v0] Total rows to import:", totalRows)
    
    // Process in batches
    const BATCH_SIZE = 50
    
    for (let i = 0; i < dataLines.length; i += BATCH_SIZE) {
      const batch = dataLines.slice(i, i + BATCH_SIZE)
      
      for (const line of batch) {
        try {
          const values = parseCSVLine(line)
          
          const name = nameIdx >= 0 ? values[nameIdx]?.trim() : ""
          const ndc = ndcIdx >= 0 ? values[ndcIdx]?.trim().replace(/[^0-9-]/g, "") : null
          const priceStr = priceIdx >= 0 ? values[priceIdx]?.trim() : "0"
          const unit = unitIdx >= 0 ? values[unitIdx]?.trim() : "EA"
          
          if (!name || name.length < 2) {
            skipped++
            continue
          }
          
          const perUnitCost = parseFloat(priceStr) || 0
          
          // Calculate prices: 15% markup + $5 dispensing fee for 30-day supply
          const ourPrice = perUnitCost > 0 ? Number((perUnitCost * 30 * 1.15 + 5).toFixed(2)) : 0
          const retailPrice = Number((ourPrice * 3.5).toFixed(2))
          
          // Insert or update
          if (ndc && ndc.length > 5) {
            // Has NDC - use upsert
            const result = await db`
              INSERT INTO medications (name, ndc, per_unit_cost, our_price, typical_retail_price, dosage_form, is_generic, created_at, updated_at)
              VALUES (${name}, ${ndc}, ${perUnitCost}, ${ourPrice}, ${retailPrice}, ${unit}, true, NOW(), NOW())
              ON CONFLICT (ndc) 
              DO UPDATE SET 
                name = EXCLUDED.name,
                per_unit_cost = EXCLUDED.per_unit_cost,
                our_price = EXCLUDED.our_price,
                typical_retail_price = EXCLUDED.typical_retail_price,
                dosage_form = EXCLUDED.dosage_form,
                updated_at = NOW()
              RETURNING (xmax = 0) as is_insert
            `
            if (result[0]?.is_insert) {
              inserted++
            } else {
              updated++
            }
          } else {
            // No NDC - just insert
            await db`
              INSERT INTO medications (name, ndc, per_unit_cost, our_price, typical_retail_price, dosage_form, is_generic, created_at, updated_at)
              VALUES (${name}, ${ndc}, ${perUnitCost}, ${ourPrice}, ${retailPrice}, ${unit}, true, NOW(), NOW())
            `
            inserted++
          }
        } catch (err) {
          errors++
          if (errors <= 3) {
            console.log("[v0] Row error:", (err as Error).message)
          }
        }
      }
      
      // Log progress every 500 rows
      if ((i + BATCH_SIZE) % 500 === 0 || i + BATCH_SIZE >= dataLines.length) {
        console.log(`[v0] Progress: ${Math.min(i + BATCH_SIZE, dataLines.length)}/${totalRows}`)
      }
    }
    
    console.log("[v0] Import complete:", { inserted, updated, skipped, errors })
    
    return NextResponse.json({
      success: true,
      summary: {
        totalRows,
        inserted,
        updated,
        skipped,
        errors
      }
    })
    
  } catch (err) {
    console.error("[v0] Import error:", err)
    return NextResponse.json({ 
      error: "Import failed: " + (err as Error).message 
    }, { status: 500 })
  }
}
