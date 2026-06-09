import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { fetchPrescriptionSupplyPrice, calculatePrice } from "@/lib/supplier-api"

const UNIT_BASED_FORMS = ["INHALER", "SOLUTION", "CREAM", "OINTMENT", "LOTION", "GEL", "SPRAY", "SYRINGE", "DROPS", "SUSPENSION", "PATCH", "VIAL", "PEN", "NEBULIZER"]

export async function POST(request: Request) {
  try {
    const { medicationId, strength, quantity } = await request.json()
    const meds = await sql("SELECT * FROM medications WHERE id = $1", [medicationId])
    const medication = meds[0]
    if (!medication) return NextResponse.json({ error: "Medication not found" }, { status: 404 })

    const form = (medication.form || "").toUpperCase()
    const isUnitBased = UNIT_BASED_FORMS.includes(form)
    const effectiveQty = isUnitBased ? 1 : quantity

    const supplierPrice = await fetchPrescriptionSupplyPrice({
      drugName: medication.name, strength, quantity: effectiveQty, ndc: medication.ndc,
    })

    let acquisitionCost: number
    if (supplierPrice) {
      acquisitionCost = supplierPrice.acquisition_cost_per_unit
      await sql(
        "INSERT INTO supplier_prices (medication_id, supplier_name, supplier_ndc, supplier_price, package_size) VALUES ($1, 'Prescription Supply', $2, $3, $4) ON CONFLICT DO NOTHING",
        [medicationId, supplierPrice.ndc, acquisitionCost, supplierPrice.package_size]
      )
    } else {
      const dbPrices = await sql(
        "SELECT supplier_price FROM supplier_prices WHERE medication_id = $1 ORDER BY last_updated DESC LIMIT 1",
        [medicationId]
      )
      acquisitionCost = dbPrices[0]?.supplier_price ? Number(dbPrices[0].supplier_price) : Number(medication.acquisition_cost) || 0.15
    }

    const finalPrice = calculatePrice(acquisitionCost, effectiveQty)
    return NextResponse.json({
      price: finalPrice,
      breakdown: { acquisitionCostPerUnit: acquisitionCost, drugCost: acquisitionCost * effectiveQty, markup: 1.15, dispensingFee: 5, quantity: effectiveQty },
      source: supplierPrice ? "live" : "database",
      isUnitBased,
      form,
    })
  } catch (error) {
    console.error("[v0] Price calculation error:", error)
    return NextResponse.json({ error: "Failed to calculate price" }, { status: 500 })
  }
}
