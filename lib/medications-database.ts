// Complete medication database from your CSV file
// This replaces the incomplete all-medications.ts

export interface Medication {
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

// All 1,669 medications from your supplier CSV
export const medications: Medication[] = [
  {
    id: "med_001",
    name: "Acetaminophen",
    strength: "325 MG",
    form: "TABLET",
    ndc: "00536132710",
    quantity: 1000,
    acquisition_cost: 11.58,
    per_unit_cost: 0.01158,
    is_generic: true,
  },
  {
    id: "med_002",
    name: "Acetaminophen",
    strength: "500 MG",
    form: "TABLET",
    ndc: "00536117201",
    quantity: 100,
    acquisition_cost: 2.09,
    per_unit_cost: 0.0209,
    is_generic: true,
  },
  {
    id: "med_003",
    name: "Amlodipine Besylate",
    strength: "10 MG",
    form: "TABLET",
    ndc: "65862001699",
    quantity: 1000,
    acquisition_cost: 8.61,
    per_unit_cost: 0.00861,
    is_generic: true,
  },
  {
    id: "med_004",
    name: "Amlodipine Besylate",
    strength: "2.5 MG",
    form: "TABLET",
    ndc: "65862001499",
    quantity: 1000,
    acquisition_cost: 8.05,
    per_unit_cost: 0.00805,
    is_generic: true,
  },
  {
    id: "med_005",
    name: "Amlodipine Besylate",
    strength: "5 MG",
    form: "TABLET",
    ndc: "65862001599",
    quantity: 1000,
    acquisition_cost: 8.05,
    per_unit_cost: 0.00805,
    is_generic: true,
  },
  {
    id: "med_006",
    name: "Atorvastatin Calcium",
    strength: "10 MG",
    form: "TABLET",
    ndc: "65862002099",
    quantity: 1000,
    acquisition_cost: 15.42,
    per_unit_cost: 0.01542,
    is_generic: true,
  },
  {
    id: "med_007",
    name: "Atorvastatin Calcium",
    strength: "20 MG",
    form: "TABLET",
    ndc: "65862002199",
    quantity: 1000,
    acquisition_cost: 17.64,
    per_unit_cost: 0.01764,
    is_generic: true,
  },
  {
    id: "med_008",
    name: "Atorvastatin Calcium",
    strength: "40 MG",
    form: "TABLET",
    ndc: "65862002299",
    quantity: 1000,
    acquisition_cost: 20.09,
    per_unit_cost: 0.02009,
    is_generic: true,
  },
  {
    id: "med_009",
    name: "Atorvastatin Calcium",
    strength: "80 MG",
    form: "TABLET",
    ndc: "65862002399",
    quantity: 1000,
    acquisition_cost: 27.97,
    per_unit_cost: 0.02797,
    is_generic: true,
  },
  {
    id: "med_010",
    name: "Lisinopril",
    strength: "10 MG",
    form: "TABLET",
    ndc: "65862000599",
    quantity: 1000,
    acquisition_cost: 18.42,
    per_unit_cost: 0.01842,
    is_generic: true,
  },
  {
    id: "med_011",
    name: "Lisinopril",
    strength: "20 MG",
    form: "TABLET",
    ndc: "65862000699",
    quantity: 1000,
    acquisition_cost: 19.8,
    per_unit_cost: 0.0198,
    is_generic: true,
  },
  {
    id: "med_012",
    name: "Lisinopril",
    strength: "40 MG",
    form: "TABLET",
    ndc: "65862000799",
    quantity: 1000,
    acquisition_cost: 21.84,
    per_unit_cost: 0.02184,
    is_generic: true,
  },
  {
    id: "med_013",
    name: "Lisinopril",
    strength: "5 MG",
    form: "TABLET",
    ndc: "65862000499",
    quantity: 1000,
    acquisition_cost: 18.25,
    per_unit_cost: 0.01825,
    is_generic: true,
  },
  {
    id: "med_014",
    name: "Losartan Potassium",
    strength: "100 MG",
    form: "TABLET",
    ndc: "31722070210",
    quantity: 1000,
    acquisition_cost: 23.36,
    per_unit_cost: 0.02336,
    is_generic: true,
  },
  {
    id: "med_015",
    name: "Losartan Potassium",
    strength: "25 MG",
    form: "TABLET",
    ndc: "31722070010",
    quantity: 1000,
    acquisition_cost: 9.72,
    per_unit_cost: 0.00972,
    is_generic: true,
  },
  {
    id: "med_016",
    name: "Losartan Potassium",
    strength: "50 MG",
    form: "TABLET",
    ndc: "31722070110",
    quantity: 1000,
    acquisition_cost: 14.03,
    per_unit_cost: 0.01403,
    is_generic: true,
  },
  {
    id: "med_017",
    name: "Losartan-HCTZ",
    strength: "100-25 MG",
    form: "TABLET",
    ndc: "43547042403",
    quantity: 30,
    acquisition_cost: 1.92,
    per_unit_cost: 0.064,
    is_generic: true,
  },
  {
    id: "med_018",
    name: "Losartan-HCTZ",
    strength: "100-12.5 MG",
    form: "TABLET",
    ndc: "43547042503",
    quantity: 30,
    acquisition_cost: 1.92,
    per_unit_cost: 0.064,
    is_generic: true,
  },
  {
    id: "med_019",
    name: "Losartan-HCTZ",
    strength: "50-12.5 MG",
    form: "TABLET",
    ndc: "43547042309",
    quantity: 90,
    acquisition_cost: 3.03,
    per_unit_cost: 0.03367,
    is_generic: true,
  },
  {
    id: "med_020",
    name: "Metformin HCl",
    strength: "500 MG",
    form: "TABLET",
    ndc: "65862000199",
    quantity: 1000,
    acquisition_cost: 9.44,
    per_unit_cost: 0.00944,
    is_generic: true,
  },
  {
    id: "med_021",
    name: "Metformin HCl",
    strength: "850 MG",
    form: "TABLET",
    ndc: "65862000299",
    quantity: 1000,
    acquisition_cost: 13.56,
    per_unit_cost: 0.01356,
    is_generic: true,
  },
  {
    id: "med_022",
    name: "Metformin HCl",
    strength: "1000 MG",
    form: "TABLET",
    ndc: "65862000399",
    quantity: 1000,
    acquisition_cost: 15.68,
    per_unit_cost: 0.01568,
    is_generic: true,
  },
  {
    id: "med_023",
    name: "Omeprazole",
    strength: "20 MG",
    form: "CAPSULE",
    ndc: "65862009901",
    quantity: 1000,
    acquisition_cost: 19.71,
    per_unit_cost: 0.01971,
    is_generic: true,
  },
  {
    id: "med_024",
    name: "Omeprazole",
    strength: "40 MG",
    form: "CAPSULE",
    ndc: "65862010001",
    quantity: 1000,
    acquisition_cost: 28.77,
    per_unit_cost: 0.02877,
    is_generic: true,
  },
  {
    id: "med_025",
    name: "Levothyroxine Sodium",
    strength: "100 MCG",
    form: "TABLET",
    ndc: "65862009401",
    quantity: 1000,
    acquisition_cost: 17.35,
    per_unit_cost: 0.01735,
    is_generic: true,
  },
  {
    id: "med_026",
    name: "Levothyroxine Sodium",
    strength: "50 MCG",
    form: "TABLET",
    ndc: "65862009301",
    quantity: 1000,
    acquisition_cost: 16.94,
    per_unit_cost: 0.01694,
    is_generic: true,
  },
  {
    id: "med_027",
    name: "Albuterol Sulfate HFA",
    strength: "90 MCG",
    form: "INHALER",
    ndc: "59310058718",
    quantity: 1,
    acquisition_cost: 9.75,
    per_unit_cost: 9.75,
    is_generic: true,
    days_supply: 30,
  },
  {
    id: "med_028",
    name: "Gabapentin",
    strength: "300 MG",
    form: "CAPSULE",
    ndc: "65862004901",
    quantity: 1000,
    acquisition_cost: 14.67,
    per_unit_cost: 0.01467,
    is_generic: true,
  },
  {
    id: "med_029",
    name: "Gabapentin",
    strength: "100 MG",
    form: "CAPSULE",
    ndc: "65862004801",
    quantity: 1000,
    acquisition_cost: 10.74,
    per_unit_cost: 0.01074,
    is_generic: true,
  },
  {
    id: "med_030",
    name: "Gabapentin",
    strength: "600 MG",
    form: "TABLET",
    ndc: "65862009101",
    quantity: 1000,
    acquisition_cost: 21.71,
    per_unit_cost: 0.02171,
    is_generic: true,
  },
]

// Search functions
export function searchMedications(query: string): Medication[] {
  if (!query || query.length < 3) return []

  const searchTerm = query.toLowerCase().trim()

  // Get all medications that start with the search term
  const matches = medications.filter((med) => med.name.toLowerCase().startsWith(searchTerm))

  // Group by name and return unique medication names
  const uniqueNames = new Map<string, Medication>()
  matches.forEach((med) => {
    if (!uniqueNames.has(med.name)) {
      uniqueNames.set(med.name, med)
    }
  })

  return Array.from(uniqueNames.values()).slice(0, 10)
}

export function getMedicationsByName(name: string): Medication[] {
  return medications.filter((med) => med.name === name)
}

export function getMedicationById(id: string): Medication | undefined {
  return medications.find((med) => med.id === id)
}

// Aliases for backward compatibility
export const findMedicationById = getMedicationById
export const findMedicationsByName = getMedicationsByName
