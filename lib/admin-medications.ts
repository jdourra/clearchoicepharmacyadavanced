import { calculatePrice } from "@/lib/supplier-api"

export type AdminMedication = {
  id: string
  name: string
  generic_name: string | null
  brand_name: string | null
  strength: string | null
  dosage_form: string | null
  ndc: string | null
  per_unit_cost: number | null
  acquisition_cost: number | null
  our_price: number | null
  typical_retail_price: number | null
  package_quantity: number | null
  is_generic: boolean | null
  is_active: boolean | null
  category: string | null
  description: string | null
  days_supply: number | null
  created_at?: string
  updated_at?: string
}

export type AdminMedicationInput = {
  name: string
  generic_name?: string | null
  brand_name?: string | null
  strength?: string | null
  dosage_form?: string | null
  ndc?: string | null
  per_unit_cost?: number | null
  acquisition_cost?: number | null
  our_price?: number | null
  typical_retail_price?: number | null
  package_quantity?: number | null
  is_generic?: boolean
  is_active?: boolean
  category?: string | null
  description?: string | null
  days_supply?: number | null
}

export function resolvePerUnitCost(input: AdminMedicationInput): number | null {
  if (input.per_unit_cost != null && input.per_unit_cost > 0) {
    return input.per_unit_cost
  }
  if (input.acquisition_cost != null && input.acquisition_cost > 0) {
    const pkg = input.package_quantity && input.package_quantity > 0 ? input.package_quantity : 1
    return input.acquisition_cost / pkg
  }
  return null
}

export function derivePricingFields(input: AdminMedicationInput) {
  const perUnit = resolvePerUnitCost(input)
  const daysSupply = input.days_supply && input.days_supply > 0 ? input.days_supply : 30
  const ourPrice =
    input.our_price != null && input.our_price > 0
      ? input.our_price
      : perUnit != null
        ? calculatePrice(perUnit, daysSupply)
        : null
  const typicalRetail =
    input.typical_retail_price != null && input.typical_retail_price > 0
      ? input.typical_retail_price
      : ourPrice != null
        ? Math.round(ourPrice * 3.5 * 100) / 100
        : null

  return { perUnit, ourPrice, typicalRetail, daysSupply }
}

export function validateMedicationInput(
  input: AdminMedicationInput,
  options?: { requireCost?: boolean }
): string | null {
  const name = input.name?.trim()
  if (!name) return "Medication name is required"

  const perUnit = resolvePerUnitCost(input)
  if (options?.requireCost !== false && perUnit == null) {
    return "Per-unit cost or acquisition cost is required"
  }
  if (perUnit != null && perUnit <= 0) return "Cost must be greater than zero"

  if (input.ndc?.trim()) {
    const ndc = input.ndc.replace(/\D/g, "")
    if (ndc.length < 10 || ndc.length > 11) {
      return "NDC must be 10 or 11 digits"
    }
  }

  return null
}

export function formatCashPrice(perUnit: number | null, quantity = 30): string {
  if (perUnit == null || perUnit <= 0) return "—"
  return `$${calculatePrice(perUnit, quantity).toFixed(2)}`
}

export const DOSAGE_FORMS = [
  "TABLET",
  "CAPSULE",
  "SOLUTION",
  "SUSPENSION",
  "CREAM",
  "OINTMENT",
  "GEL",
  "LOTION",
  "INHALER",
  "PATCH",
  "DROPS",
  "SYRINGE",
  "VIAL",
  "PEN",
  "NEBULIZER",
  "SPRAY",
  "EACH",
] as const
