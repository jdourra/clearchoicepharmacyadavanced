import { sql } from "@/lib/db"

export interface RxNavDrug {
  rxcui: string
  name: string
  synonym?: string
  tty?: string
}

export interface RxNavNDC {
  ndcCode: string
  packageDescription?: string
}

export interface MedicationData {
  name: string
  generic_name: string
  ndc_code: string
  strength: string
  dosage_form: string
  acquisition_cost: number
}

const RXNAV_BASE_URL = "https://rxnav.nlm.nih.gov/REST"

export async function searchDrugs(query: string): Promise<RxNavDrug[]> {
  try {
    const response = await fetch(`${RXNAV_BASE_URL}/drugs.json?name=${encodeURIComponent(query)}`)
    const data = await response.json()

    if (!data.drugGroup?.conceptGroup) {
      return []
    }

    const drugs: RxNavDrug[] = []
    for (const group of data.drugGroup.conceptGroup) {
      if (group.conceptProperties) {
        drugs.push(
          ...group.conceptProperties.map((prop: any) => ({
            rxcui: prop.rxcui,
            name: prop.name,
            synonym: prop.synonym,
            tty: prop.tty,
          })),
        )
      }
    }

    return drugs
  } catch (error) {
    console.error("[v0] RxNav search error:", error)
    return []
  }
}

export async function getNDCsForDrug(rxcui: string): Promise<RxNavNDC[]> {
  try {
    const response = await fetch(`${RXNAV_BASE_URL}/rxcui/${rxcui}/ndcs.json`)
    const data = await response.json()

    if (!data.ndcGroup?.ndcList?.ndc) {
      return []
    }

    return data.ndcGroup.ndcList.ndc.map((ndc: string) => ({
      ndcCode: ndc,
    }))
  } catch (error) {
    console.error("[v0] RxNav NDC fetch error:", error)
    return []
  }
}

export async function getDrugProperties(rxcui: string): Promise<any> {
  try {
    const response = await fetch(`${RXNAV_BASE_URL}/rxcui/${rxcui}/properties.json`)
    const data = await response.json()
    return data.properties || null
  } catch (error) {
    console.error("[v0] RxNav properties error:", error)
    return null
  }
}

export function calculateTestingPrice(dosageForm: string): number {
  const form = dosageForm.toLowerCase()

  if (form.includes("inhaler") || form.includes("aerosol") || form.includes("spray")) {
    return 30.0
  }

  if (form.includes("tablet") || form.includes("capsule") || form.includes("pill")) {
    return 1.0 / 30
  }

  return 0.1
}

export async function importMedicationFromRxNav(rxcui: string): Promise<boolean> {
  try {
    const properties = await getDrugProperties(rxcui)
    if (!properties) {
      console.error("[v0] No properties found for RxCUI:", rxcui)
      return false
    }

    const ndcs = await getNDCsForDrug(rxcui)
    const primaryNDC = ndcs[0]?.ndcCode || `RXCUI-${rxcui}`

    const dosageForm = properties.dosageForm || "tablet"
    const acquisitionCost = calculateTestingPrice(dosageForm)

    await sql(
      "INSERT INTO medications (name, generic_name, ndc, rxcui, strength, dosage_form, acquisition_cost, category, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)",
      [properties.name, properties.name, primaryNDC, String(rxcui), properties.strength || "N/A", dosageForm, acquisitionCost, dosageForm.toLowerCase().includes("inhaler") ? "inhaler" : "oral"]
    )

    return true
  } catch (error) {
    console.error("[v0] Import medication error:", error)
    return false
  }
}
