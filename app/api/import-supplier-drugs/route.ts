import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

interface DrugData { name: string; baseName: string; strength: string; form: string; ndc: string; acquisitionCost: number; isGeneric: boolean }

function extractStrengthAndForm(drugName: string): { baseName: string; strength: string; form: string } {
  const forms: Record<string, string> = { TAB: "Tablet", TABLET: "Tablet", CAP: "Capsule", CAPSULE: "Capsule", SYR: "Syrup", SOL: "Solution", SUSP: "Suspension", INJ: "Injectable", CREAM: "Cream", OINTMENT: "Ointment", GEL: "Gel", LOTION: "Lotion", SPRAY: "Spray", INHALER: "Inhaler", PATCH: "Patch", LIQ: "Liquid", POWDER: "Powder", VL: "Vial", VIAL: "Vial" }
  const strengthMatch = drugName.match(/(\d+(?:\.\d+)?)\s*(MG|MCG|ML|GM|%|UNITS?)/i)
  const strength = strengthMatch ? strengthMatch[0] : ""
  let form = "Tablet"
  const drugUpper = drugName.toUpperCase()
  for (const [key, value] of Object.entries(forms)) { if (drugUpper.includes(key)) { form = value; break } }
  let baseName = drugName
  if (strengthMatch) baseName = drugName.substring(0, strengthMatch.index).trim()
  baseName = baseName.replace(/\s+(ER|DR|TAB|CAP|SYR|SOL|SUSP|INJ|CREAM|OINTMENT|GEL|LOTION|SPRAY|INHALER|PATCH|LIQ|POWDER|VL|VIAL).*$/i, "").trim()
  return { baseName, strength, form }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

    const text = await file.text()
    const lines = text.split("\n")
    const headers = lines[0].split(",").map((h) => h.trim())
    const nameIdx = headers.findIndex((h) => h === "DrugName")
    const ndcIdx = headers.findIndex((h) => h === "DrugNDC")
    const qtyIdx = headers.findIndex((h) => h === "RxQty")
    const costIdx = headers.findIndex((h) => h === "AACCost")
    if (nameIdx === -1 || ndcIdx === -1 || qtyIdx === -1 || costIdx === -1) return NextResponse.json({ error: "Invalid CSV format. Required columns: DrugName, DrugNDC, RxQty, AACCost" }, { status: 400 })

    const drugsMap = new Map<string, DrugData>()
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      const cols = line.split(",")
      const drugName = cols[nameIdx]?.trim()
      const ndc = cols[ndcIdx]?.trim()
      const qty = parseInt(cols[qtyIdx]?.trim() || "0")
      const cost = parseFloat(cols[costIdx]?.trim() || "0")
      if (!drugName || !ndc || qty === 0) continue
      const perUnitCost = cost / qty
      const key = `${drugName}-${ndc}`
      const existing = drugsMap.get(key)
      if (!existing || perUnitCost < existing.acquisitionCost) {
        const { baseName, strength, form } = extractStrengthAndForm(drugName)
        drugsMap.set(key, { name: drugName, baseName, strength, form, ndc, acquisitionCost: perUnitCost, isGeneric: drugName === drugName.toUpperCase() })
      }
    }

    let imported = 0
    const errors: string[] = []
    for (const drug of drugsMap.values()) {
      try {
        const existing = await sql("SELECT id FROM medications WHERE ndc = $1", [drug.ndc])
        if (existing.length > 0) {
          await sql("UPDATE medications SET name = $1, generic_name = $2, strength = $3, dosage_form = $4, acquisition_cost = $5, updated_at = now() WHERE ndc = $6", [drug.name, drug.baseName, drug.strength, drug.form, drug.acquisitionCost, drug.ndc])
        } else {
          await sql("INSERT INTO medications (name, generic_name, strength, dosage_form, ndc, acquisition_cost, is_active) VALUES ($1, $2, $3, $4, $5, $6, true)", [drug.name, drug.baseName, drug.strength, drug.form, drug.ndc, drug.acquisitionCost])
        }
        imported++
      } catch (err: any) { errors.push(`${drug.name}: ${err.message}`) }
    }

    return NextResponse.json({ total: drugsMap.size, imported, duplicates: lines.length - 1 - drugsMap.size, errors: errors.slice(0, 10) })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
