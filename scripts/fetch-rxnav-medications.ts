// Script to fetch top 300 medications from RxNav API and populate database
// Based on most commonly prescribed generic medications in the US

interface RxNormDrug {
  rxcui: string
  name: string
  synonym?: string
  tty?: string
}

interface NDCInfo {
  ndcItem: {
    ndcCode: string
    packaging: string
  }[]
}

// Top 300 most commonly prescribed generic medications (RxCUI identifiers)
const TOP_300_MEDICATIONS = [
  { rxcui: "197361", name: "Lisinopril", strength: "10mg" },
  { rxcui: "310798", name: "Metformin", strength: "500mg" },
  { rxcui: "617310", name: "Amlodipine", strength: "5mg" },
  { rxcui: "308136", name: "Atorvastatin", strength: "20mg" },
  { rxcui: "282464", name: "Levothyroxine", strength: "50mcg" },
  { rxcui: "284635", name: "Omeprazole", strength: "20mg" },
  { rxcui: "197446", name: "Losartan", strength: "50mg" },
  { rxcui: "206765", name: "Albuterol", strength: "90mcg" },
  { rxcui: "197511", name: "Gabapentin", strength: "300mg" },
  { rxcui: "352120", name: "Hydrochlorothiazide", strength: "25mg" },
  { rxcui: "308971", name: "Furosemide", strength: "40mg" },
  { rxcui: "311700", name: "Sertraline", strength: "50mg" },
  { rxcui: "848695", name: "Simvastatin", strength: "20mg" },
  { rxcui: "259255", name: "Escitalopram", strength: "10mg" },
  { rxcui: "283420", name: "Pantoprazole", strength: "40mg" },
  // Add more medications...
]

async function fetchRxNavData() {
  const medications = []

  for (const med of TOP_300_MEDICATIONS) {
    try {
      // Fetch drug properties
      const response = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui/${med.rxcui}/allProperties.json?prop=all`)
      const data = await response.json()

      // Fetch NDC codes
      const ndcResponse = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui/${med.rxcui}/ndcs.json`)
      const ndcData = await ndcResponse.json()

      const ndcCodes = ndcData.ndcGroup?.ndcList?.ndc || []

      medications.push({
        name: med.name,
        generic_name: med.name,
        strength: med.strength,
        form: "Tablet",
        rxcui: med.rxcui,
        ndc_codes: ndcCodes,
        acquisition_cost: 0.0333, // $1 / 30 tablets = $0.0333 per tablet
        quantity: 30,
        manufacturer: "Generic",
        category: "Prescription",
      })

      console.log(`[v0] Fetched: ${med.name} ${med.strength}`)

      // Rate limiting - wait 100ms between requests
      await new Promise((resolve) => setTimeout(resolve, 100))
    } catch (error) {
      console.error(`[v0] Error fetching ${med.name}:`, error)
    }
  }

  return medications
}

async function populateDatabase(medications: any[]) {
  const { createClient } = await import("@supabase/supabase-js")

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  for (const med of medications) {
    const { error } = await supabase.from("medications").upsert({
      name: med.name,
      generic_name: med.generic_name,
      brand_name: null,
      strength: med.strength,
      form: med.form,
      ndc: med.ndc_codes[0] || null, // Use first NDC code
      manufacturer: med.manufacturer,
      category: med.category,
      description: `${med.name} ${med.strength} ${med.form}`,
      acquisition_cost: med.acquisition_cost,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error(`[v0] Error inserting ${med.name}:`, error)
    } else {
      console.log(`[v0] Inserted: ${med.name} ${med.strength}`)
    }
  }
}

// Main execution
async function main() {
  console.log("[v0] Starting RxNav medication fetch...")
  const medications = await fetchRxNavData()
  console.log(`[v0] Fetched ${medications.length} medications`)

  console.log("[v0] Populating database...")
  await populateDatabase(medications)
  console.log("[v0] Complete!")
}

main().catch(console.error)
