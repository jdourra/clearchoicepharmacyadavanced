/**
 * NADAC CSV Import Script
 * Run this directly with: npx tsx scripts/import-nadac.ts
 * 
 * This bypasses the web server entirely and imports directly to the database.
 */

import { neon } from "@neondatabase/serverless"
import * as fs from "fs"
import * as path from "path"

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  throw new Error("[import-nadac] DATABASE_URL env var is not set. Set it before running this script.")
}
const db = neon(DATABASE_URL)

interface NADACRow {
  ndc_description: string
  ndc: string
  nadac_per_unit: string
  pricing_unit: string
  [key: string]: string
}

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

async function importNADAC(csvPath: string) {
  console.log("[v0] Starting NADAC import from:", csvPath)
  
  const content = fs.readFileSync(csvPath, "utf-8")
  const lines = content.split("\n").filter(line => line.trim())
  
  if (lines.length === 0) {
    console.log("[v0] No data found in CSV")
    return
  }
  
  // Parse headers
  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9_]/g, "_"))
  console.log("[v0] Headers:", headers)
  
  // Find column indices
  const ndcDescIdx = headers.findIndex(h => h.includes("ndc_description") || h.includes("drug_name") || h.includes("description"))
  const ndcIdx = headers.findIndex(h => h === "ndc" || h.includes("ndc_code"))
  const priceIdx = headers.findIndex(h => h.includes("nadac_per_unit") || h.includes("unit_price") || h.includes("price"))
  const unitIdx = headers.findIndex(h => h.includes("pricing_unit") || h.includes("unit"))
  
  console.log("[v0] Column indices - Name:", ndcDescIdx, "NDC:", ndcIdx, "Price:", priceIdx, "Unit:", unitIdx)
  
  let inserted = 0
  let updated = 0
  let skipped = 0
  let errors = 0
  
  const BATCH_SIZE = 100
  const dataLines = lines.slice(1)
  
  console.log("[v0] Total rows to process:", dataLines.length)
  
  for (let i = 0; i < dataLines.length; i += BATCH_SIZE) {
    const batch = dataLines.slice(i, i + BATCH_SIZE)
    
    for (const line of batch) {
      try {
        const values = parseCSVLine(line)
        
        const name = ndcDescIdx >= 0 ? values[ndcDescIdx]?.trim() : ""
        const ndc = ndcIdx >= 0 ? values[ndcIdx]?.trim() : ""
        const priceStr = priceIdx >= 0 ? values[priceIdx]?.trim() : ""
        const unit = unitIdx >= 0 ? values[unitIdx]?.trim() : "EA"
        
        if (!name) {
          skipped++
          continue
        }
        
        const perUnitCost = parseFloat(priceStr) || 0
        
        // Calculate our price (15% markup + $5 dispensing fee for 30 day supply)
        const ourPrice = perUnitCost > 0 ? (perUnitCost * 30 * 1.15 + 5) : 0
        const retailPrice = ourPrice * 3.5
        
        // Upsert manually by NDC if present; otherwise always insert.
        if (ndc) {
          const existing = await db`
            SELECT id FROM medications WHERE ndc = ${ndc} LIMIT 1
          `

          if (existing.length > 0) {
            await db`
              UPDATE medications
              SET
                name = ${name},
                per_unit_cost = ${perUnitCost},
                our_price = ${ourPrice},
                typical_retail_price = ${retailPrice},
                dosage_form = ${unit},
                is_generic = true,
                updated_at = NOW()
              WHERE ndc = ${ndc}
            `
            updated++
          } else {
            await db`
              INSERT INTO medications (
                name, ndc, per_unit_cost, our_price, typical_retail_price,
                dosage_form, is_generic, created_at, updated_at
              )
              VALUES (
                ${name}, ${ndc}, ${perUnitCost}, ${ourPrice}, ${retailPrice},
                ${unit}, true, NOW(), NOW()
              )
            `
            inserted++
          }
        } else {
          await db`
            INSERT INTO medications (
              name, ndc, per_unit_cost, our_price, typical_retail_price,
              dosage_form, is_generic, created_at, updated_at
            )
            VALUES (
              ${name}, NULL, ${perUnitCost}, ${ourPrice}, ${retailPrice},
              ${unit}, true, NOW(), NOW()
            )
          `
          inserted++
        }
      } catch (err) {
        errors++
        if (errors <= 5) {
          console.log("[v0] Error on row:", (err as Error).message)
        }
      }
    }
    
    console.log(`[v0] Progress: ${Math.min(i + BATCH_SIZE, dataLines.length)}/${dataLines.length} (${inserted} inserted, ${updated} updated, ${skipped} skipped, ${errors} errors)`)
  }
  
  console.log("[v0] Import complete!")
  console.log(`[v0] Final: ${inserted} inserted, ${updated} updated, ${skipped} skipped, ${errors} errors`)
}

// Get CSV path from command line or use a sensible default.
// Priority:
// 1) Explicit CLI arg: npx tsx scripts/import-nadac.ts path/to/file.csv
// 2) Root NADAC file you added: ./nadac-national-average-drug-acquisition-cost-12-25-2024.csv
// 3) Legacy default: ./nadac.csv
const csvPath =
  process.argv[2] ||
  "./nadac-national-average-drug-acquisition-cost-12-25-2024.csv" ||
  "./nadac.csv"

importNADAC(csvPath).catch(console.error)
