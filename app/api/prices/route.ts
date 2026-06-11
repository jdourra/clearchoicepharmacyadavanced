import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { calculatePrice } from "@/lib/supplier-api"

const UNIT_BASED_FORMS = [
  "INHALER",
  "SOLUTION",
  "CREAM",
  "OINTMENT",
  "LOTION",
  "GEL",
  "SPRAY",
  "SYRINGE",
  "DROPS",
  "SUSPENSION",
  "PATCH",
  "VIAL",
  "PEN",
  "NEBULIZER",
]

function getPerUnitCost(medication: Record<string, unknown>): number {
  const perUnit = medication.per_unit_cost != null ? Number(medication.per_unit_cost) : 0
  if (perUnit > 0) return perUnit

  const acquisitionCost = medication.acquisition_cost != null ? Number(medication.acquisition_cost) : 0
  const packageQty = medication.package_quantity != null ? Number(medication.package_quantity) : 1
  if (acquisitionCost > 0) return acquisitionCost / packageQty

  const ourPrice = medication.our_price != null ? Number(medication.our_price) : 0
  if (ourPrice > 0) return Math.max((ourPrice - 5) / 1.15 / 30, 0.01)

  return 0.15
}

export async function POST(request: Request) {
  try {
    const { medicationId, quantity } = await request.json()

    if (!medicationId) {
      return NextResponse.json({ error: "medicationId is required" }, { status: 400 })
    }

    const meds = await sql("SELECT * FROM medications WHERE id = $1", [medicationId])
    const medication = meds[0]

    if (!medication) {
      return NextResponse.json({ error: "Medication not found" }, { status: 404 })
    }

    const form = String(medication.dosage_form || medication.form || "").toUpperCase()
    const isUnitBased = UNIT_BASED_FORMS.includes(form)
    const qty = Number(quantity) || 30
    const effectiveQty = isUnitBased ? 1 : qty
    const acquisitionCostPerUnit = getPerUnitCost(medication)
    const drugCost = acquisitionCostPerUnit * effectiveQty
    const finalPrice = calculatePrice(acquisitionCostPerUnit, effectiveQty)

    return NextResponse.json({
      price: finalPrice,
      breakdown: {
        acquisitionCostPerUnit,
        drugCost,
        markup: drugCost * 0.15,
        dispensingFee: 5,
        quantity: effectiveQty,
      },
      source: "database",
      isUnitBased,
      form,
    })
  } catch (error) {
    console.error("[prices] Price calculation error:", error)
    return NextResponse.json({ error: "Failed to calculate price" }, { status: 500 })
  }
}
