import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { calculateTestingPrice, getDrugProperties, getNDCsForDrug } from "@/lib/rxnav-api"

export async function POST(request: Request) {
  try {
    const { rxcui, name, dosageForm } = await request.json()
    if (!rxcui) return NextResponse.json({ error: "RxCUI required" }, { status: 400 })

    const properties = await getDrugProperties(rxcui)
    if (!properties) return NextResponse.json({ error: "Drug not found in RxNav" }, { status: 404 })

    const ndcs = await getNDCsForDrug(rxcui)
    const primaryNDC = ndcs[0]?.ndcCode || `RXCUI-${rxcui}`
    const form = dosageForm || properties.dosageForm || "tablet"
    const acquisitionCost = calculateTestingPrice(form)

    const rows = await sql(
      "INSERT INTO medications (name, generic_name, ndc, rxcui, strength, dosage_form, acquisition_cost, category, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true) RETURNING *",
      [name || properties.name, properties.name, primaryNDC, String(rxcui), properties.strength || "N/A", form, acquisitionCost, form.toLowerCase().includes("inhaler") ? "inhaler" : "oral"]
    )

    return NextResponse.json({
      success: true, medication: rows[0],
      pricing: { acquisitionCost, priceFor30: form.toLowerCase().includes("inhaler") ? acquisitionCost : acquisitionCost * 30 },
    })
  } catch (error) {
    console.error("[v0] Import error:", error)
    return NextResponse.json({ error: "Import failed" }, { status: 500 })
  }
}
