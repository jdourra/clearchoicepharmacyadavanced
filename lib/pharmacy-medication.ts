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

function inferDosageForm(med: PharmacyMedication): string {
  const form = (med.dosage_form || "").toUpperCase()
  if (form && form !== "EA") return form

  const text = `${med.name} ${med.strength || ""}`.toLowerCase()
  if (/\bcapsule\b|\bcap\b/.test(text)) return "CAPSULE"
  if (/\btablet\b|\btb\b/.test(text)) return "TABLET"
  if (/\bsolution\b|\bsoln\b/.test(text)) return "SOLUTION"
  return form || "TABLET"
}

export function mapDbToHomeMedication(med: PharmacyMedication): HomeMedication {
  return {
    id: med.id,
    name: med.name,
    strength: med.strength,
    form: inferDosageForm(med),
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

function medicationSearchText(med: PharmacyMedication): string {
  return `${med.name} ${med.strength || ""} ${med.dosage_form || ""}`.toLowerCase()
}

function isExtendedRelease(text: string): boolean {
  return /\ber\b|extended|osmotic|gastrc|osm-tab|gastr-tb/.test(text)
}

function isCapsule(text: string): boolean {
  return /\bcapsule\b|\bcap\b/.test(text)
}

function isTablet(text: string): boolean {
  return /\btablet\b|\btb\b/.test(text)
}

/** Pick the best catalog row for homepage popular cards (cheaper generic forms). */
export function pickPopularMedication(
  medications: PharmacyMedication[],
  query: string
): PharmacyMedication | null {
  if (medications.length === 0) return null

  const q = query.toLowerCase()
  let pool = medications

  if (q === "metformin") {
    const tablets = medications.filter((med) => {
      const text = medicationSearchText(med)
      if (isExtendedRelease(text)) return false
      if (!/500/.test(text)) return false
      return isTablet(text) || text.includes("500 mg")
    })
    pool = tablets.length > 0 ? tablets : medications
  } else if (q === "levothyroxine") {
    const tablets = medications.filter((med) => {
      const text = medicationSearchText(med)
      if (isCapsule(text)) return false
      return isTablet(text)
    })
    pool = tablets.length > 0 ? tablets : medications

    const commonStrength = pool.filter((med) => /50\s*mcg|100\s*mcg/.test(medicationSearchText(med)))
    if (commonStrength.length > 0) pool = commonStrength
  }

  return [...pool].sort((a, b) => getPerUnitCost(a) - getPerUnitCost(b))[0]
}

export async function fetchPopularMedication(query: string): Promise<HomeMedication | null> {
  const response = await fetch(
    `/api/drugs?q=${encodeURIComponent(query)}&limit=40&prefix=1`
  )
  if (!response.ok) return null

  const data = await response.json()
  const medications = (data.medications || []) as PharmacyMedication[]
  const picked = pickPopularMedication(medications, query)
  return picked ? mapDbToHomeMedication(picked) : null
}
