export interface PharmacyMedication {
  id: string
  name: string
  generic_name?: string | null
  brand_name?: string | null
  strength: string
  dosage_form: string
  ndc?: string | null
  acquisition_cost?: number | string | null
  our_price?: number | string | null
  typical_retail_price?: number | string | null
  per_unit_cost?: number | string | null
  package_quantity?: number | null
  is_generic?: boolean
  days_supply?: number | null
  category?: string | null
}

export interface MedicationSearchResult {
  id: string
  name: string
  is_generic?: boolean
}

export const UNIT_BASED_FORMS = [
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

export function medicationForm(med: Pick<PharmacyMedication, "dosage_form">) {
  return (med.dosage_form || "TABLET").toUpperCase()
}

export function isUnitBasedForm(form: string) {
  return UNIT_BASED_FORMS.includes(form.toUpperCase())
}

export function getPerUnitCost(med: PharmacyMedication): number {
  const perUnit = med.per_unit_cost != null ? Number(med.per_unit_cost) : 0
  if (perUnit > 0) return perUnit

  const acquisitionCost = med.acquisition_cost != null ? Number(med.acquisition_cost) : 0
  const packageQty = med.package_quantity != null ? Number(med.package_quantity) : 1
  return acquisitionCost > 0 ? acquisitionCost / packageQty : 0.5
}

export function calculateTransparentPrice(med: PharmacyMedication, quantity: number): number {
  const form = medicationForm(med)
  const effectiveQty = isUnitBasedForm(form) ? 1 : quantity
  const perUnit = getPerUnitCost(med)
  return perUnit * effectiveQty * 1.15 + 5
}

export function dedupeMedicationNames(medications: PharmacyMedication[]): MedicationSearchResult[] {
  const unique = new Map<string, MedicationSearchResult>()

  for (const med of medications) {
    if (!unique.has(med.name)) {
      unique.set(med.name, {
        id: med.id,
        name: med.name,
        is_generic: med.is_generic,
      })
    }
  }

  return Array.from(unique.values())
}

export async function fetchMedicationSuggestions(query: string): Promise<MedicationSearchResult[]> {
  const response = await fetch(`/api/drugs?q=${encodeURIComponent(query)}&limit=40`)
  if (!response.ok) return []

  const data = await response.json()
  return dedupeMedicationNames(data.medications || []).slice(0, 10)
}

export async function fetchMedicationStrengths(name: string): Promise<PharmacyMedication[]> {
  const response = await fetch(`/api/drugs?q=${encodeURIComponent(name)}&limit=100`)
  if (!response.ok) return []

  const data = await response.json()
  return (data.medications || []).filter((med: PharmacyMedication) => med.name === name)
}
