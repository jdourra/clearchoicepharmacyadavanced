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

export interface HomeMedication {
  id: string
  name: string
  strength: string
  form: string
  ndc: string
  quantity: number
  acquisition_cost: number
  per_unit_cost: number
  is_generic: boolean
  days_supply?: number
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

export const MIN_SEARCH_LENGTH = 3

export function getPerUnitCost(med: PharmacyMedication): number {
  const perUnit = med.per_unit_cost != null ? Number(med.per_unit_cost) : 0
  if (perUnit > 0) return perUnit

  const acquisitionCost = med.acquisition_cost != null ? Number(med.acquisition_cost) : 0
  const packageQty = med.package_quantity != null ? Number(med.package_quantity) : 1
  return acquisitionCost > 0 ? acquisitionCost / packageQty : 0.5
}

export function mapDbToHomeMedication(med: PharmacyMedication): HomeMedication {
  return {
    id: med.id,
    name: med.name,
    strength: med.strength,
    form: (med.dosage_form || "TABLET").toUpperCase(),
    ndc: med.ndc || "",
    quantity: med.package_quantity != null ? Number(med.package_quantity) : 30,
    acquisition_cost: med.acquisition_cost != null ? Number(med.acquisition_cost) : 0,
    per_unit_cost: getPerUnitCost(med),
    is_generic: med.is_generic ?? true,
    days_supply: med.days_supply != null ? Number(med.days_supply) : undefined,
  }
}

export function dedupeMedicationNames(medications: PharmacyMedication[]): MedicationSearchResult[] {
  const unique = new Map<string, MedicationSearchResult>()
  for (const med of medications) {
    if (!unique.has(med.name)) {
      unique.set(med.name, { id: med.id, name: med.name, is_generic: med.is_generic })
    }
  }
  return Array.from(unique.values())
}

export async function fetchMedicationSuggestions(query: string): Promise<MedicationSearchResult[]> {
  const trimmed = query.trim()
  if (trimmed.length < MIN_SEARCH_LENGTH) return []

  const response = await fetch(
    `/api/drugs?q=${encodeURIComponent(trimmed)}&limit=40&prefix=1`
  )
  if (!response.ok) return []

  const data = await response.json()
  return dedupeMedicationNames(data.medications || []).slice(0, 10)
}

export async function findTopMedicationMatch(query: string): Promise<MedicationSearchResult | null> {
  const trimmed = query.trim()
  if (trimmed.length < MIN_SEARCH_LENGTH) return null

  const suggestions = await fetchMedicationSuggestions(trimmed)
  if (suggestions.length === 0) return null

  const q = trimmed.toLowerCase()
  return (
    suggestions.find((med) => med.name.toLowerCase() === q) ||
    suggestions.find((med) => med.name.toLowerCase().startsWith(q)) ||
    suggestions[0]
  )
}
