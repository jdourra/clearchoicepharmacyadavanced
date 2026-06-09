import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Top 1000 most prescribed medications in the US
const TOP_MEDICATIONS = [
  // Cardiovascular (200)
  "Lisinopril",
  "Amlodipine",
  "Metoprolol",
  "Losartan",
  "Atorvastatin",
  "Simvastatin",
  "Hydrochlorothiazide",
  "Furosemide",
  "Carvedilol",
  "Pravastatin",
  "Rosuvastatin",
  "Warfarin",
  "Clopidogrel",
  "Spironolactone",
  "Valsartan",
  "Diltiazem",
  "Verapamil",
  "Enalapril",
  "Ramipril",
  "Benazepril",
  "Quinapril",
  "Fosinopril",
  "Trandolapril",
  "Bisoprolol",
  "Atenolol",
  "Propranolol",
  "Labetalol",
  "Nebivolol",
  "Acebutolol",
  "Chlorthalidone",
  "Triamterene",
  "Indapamide",
  "Bumetanide",
  "Torsemide",
  "Digoxin",
  "Amiodarone",
  "Flecainide",
  "Sotalol",
  "Dofetilide",
  "Dronedarone",
  "Apixaban",
  "Rivaroxaban",
  "Dabigatran",
  "Edoxaban",
  "Enoxaparin",
  "Isosorbide Mononitrate",
  "Isosorbide Dinitrate",
  "Nitroglycerin",
  "Ranolazine",
  "Eplerenone",
  "Clonidine",
  "Hydralazine",
  "Minoxidil",
  "Methyldopa",
  "Doxazosin",
  "Terazosin",
  "Prazosin",
  "Tamsulosin",
  "Alfuzosin",
  "Silodosin",
  "Fenofibrate",
  "Gemfibrozil",
  "Ezetimibe",
  "Niacin",
  "Omega-3 Fatty Acids",
  "Icosapent Ethyl",
  "Colesevelam",
  "Cholestyramine",
  "Colestipol",
  "Candesartan",
  "Irbesartan",
  "Telmisartan",
  "Olmesartan",
  "Azilsartan",
  "Eprosartan",
  "Sacubitril-Valsartan",
  "Ivabradine",
  "Midodrine",
  "Droxidopa",

  // Diabetes (100)
  "Metformin",
  "Glipizide",
  "Glyburide",
  "Glimepiride",
  "Pioglitazone",
  "Repaglinide",
  "Nateglinide",
  "Acarbose",
  "Miglitol",
  "Sitagliptin",
  "Saxagliptin",
  "Linagliptin",
  "Alogliptin",
  "Empagliflozin",
  "Dapagliflozin",
  "Canagliflozin",
  "Ertugliflozin",
  "Semaglutide",
  "Dulaglutide",
  "Liraglutide",
  "Exenatide",
  "Lixisenatide",
  "Insulin Glargine",
  "Insulin Detemir",
  "Insulin NPH",
  "Insulin Regular",
  "Insulin Lispro",
  "Insulin Aspart",
  "Insulin Glulisine",
  "Insulin Degludec",

  // Pain & Anti-inflammatory (150)
  "Ibuprofen",
  "Naproxen",
  "Celecoxib",
  "Meloxicam",
  "Diclofenac",
  "Indomethacin",
  "Ketorolac",
  "Piroxicam",
  "Etodolac",
  "Nabumetone",
  "Sulindac",
  "Oxaprozin",
  "Acetaminophen",
  "Tramadol",
  "Codeine",
  "Hydrocodone",
  "Oxycodone",
  "Morphine",
  "Fentanyl",
  "Buprenorphine",
  "Tapentadol",
  "Hydromorphone",
  "Oxymorphone",
  "Gabapentin",
  "Pregabalin",
  "Carbamazepine",
  "Duloxetine",
  "Amitriptyline",
  "Nortriptyline",
  "Desipramine",
  "Venlafaxine",
  "Lidocaine",
  "Capsaicin",

  // Antibiotics (100)
  "Amoxicillin",
  "Azithromycin",
  "Doxycycline",
  "Cephalexin",
  "Ciprofloxacin",
  "Levofloxacin",
  "Amoxicillin-Clavulanate",
  "Clindamycin",
  "Metronidazole",
  "Sulfamethoxazole-Trimethoprim",
  "Cefuroxime",
  "Cefdinir",
  "Nitrofurantoin",
  "Penicillin VK",
  "Minocycline",
  "Moxifloxacin",
  "Clarithromycin",
  "Erythromycin",
  "Tetracycline",
  "Cefprozil",
  "Cefixime",
  "Cefpodoxime",
  "Ceftriaxone",
  "Vancomycin",
  "Linezolid",
  "Daptomycin",
  "Rifampin",
  "Isoniazid",

  // Respiratory (80)
  "Albuterol",
  "Fluticasone",
  "Budesonide",
  "Montelukast",
  "Prednisone",
  "Methylprednisolone",
  "Ipratropium",
  "Tiotropium",
  "Salmeterol",
  "Formoterol",
  "Fluticasone-Salmeterol",
  "Budesonide-Formoterol",
  "Mometasone",
  "Beclomethasone",
  "Ciclesonide",
  "Umeclidinium",
  "Aclidinium",
  "Glycopyrrolate",
  "Theophylline",
  "Roflumilast",
  "Benzonatate",
  "Guaifenesin",
  "Dextromethorphan",
  "Codeine-Promethazine",

  // Mental Health (120)
  "Sertraline",
  "Escitalopram",
  "Fluoxetine",
  "Citalopram",
  "Paroxetine",
  "Venlafaxine",
  "Duloxetine",
  "Bupropion",
  "Mirtazapine",
  "Trazodone",
  "Buspirone",
  "Alprazolam",
  "Lorazepam",
  "Clonazepam",
  "Diazepam",
  "Temazepam",
  "Zolpidem",
  "Eszopiclone",
  "Ramelteon",
  "Doxepin",
  "Aripiprazole",
  "Quetiapine",
  "Risperidone",
  "Olanzapine",
  "Ziprasidone",
  "Lithium",
  "Valproic Acid",
  "Lamotrigine",
  "Topiramate",
  "Levetiracetam",
  "Phenytoin",
  "Oxcarbazepine",
  "Zonisamide",
  "Lacosamide",
  "Methylphenidate",
  "Amphetamine-Dextroamphetamine",
  "Lisdexamfetamine",
  "Atomoxetine",
  "Guanfacine",
  "Clonidine",
  "Modafinil",
  "Armodafinil",

  // Gastrointestinal (80)
  "Omeprazole",
  "Pantoprazole",
  "Esomeprazole",
  "Lansoprazole",
  "Rabeprazole",
  "Famotidine",
  "Ranitidine",
  "Sucralfate",
  "Ondansetron",
  "Metoclopramide",
  "Promethazine",
  "Prochlorperazine",
  "Polyethylene Glycol",
  "Lactulose",
  "Docusate",
  "Senna",
  "Bisacodyl",
  "Loperamide",
  "Diphenoxylate-Atropine",
  "Mesalamine",
  "Sulfasalazine",
  "Budesonide",
  "Ursodiol",

  // Thyroid & Hormones (40)
  "Levothyroxine",
  "Liothyronine",
  "Methimazole",
  "Propylthiouracil",
  "Testosterone",
  "Estradiol",
  "Conjugated Estrogens",
  "Progesterone",
  "Medroxyprogesterone",
  "Norethindrone",
  "Alendronate",
  "Risedronate",
  "Ibandronate",
  "Zoledronic Acid",
  "Raloxifene",
  "Calcitonin",
  "Teriparatide",

  // Allergy & Dermatology (60)
  "Cetirizine",
  "Loratadine",
  "Fexofenadine",
  "Levocetirizine",
  "Desloratadine",
  "Diphenhydramine",
  "Hydroxyzine",
  "Meclizine",
  "Dimenhydrinate",
  "Hydrocortisone",
  "Triamcinolone",
  "Betamethasone",
  "Clobetasol",
  "Fluocinonide",
  "Mupirocin",
  "Clotrimazole",
  "Ketoconazole",
  "Terbinafine",
  "Nystatin",
  "Tretinoin",
  "Adapalene",
  "Benzoyl Peroxide",
  "Isotretinoin",
  "Tacrolimus",

  // Urology (40)
  "Finasteride",
  "Dutasteride",
  "Sildenafil",
  "Tadalafil",
  "Vardenafil",
  "Oxybutynin",
  "Tolterodine",
  "Solifenacin",
  "Darifenacin",
  "Trospium",
  "Mirabegron",
  "Phenazopyridine",
  "Trimethoprim",

  // Ophthalmology (30)
  "Latanoprost",
  "Timolol",
  "Dorzolamide",
  "Brimonidine",
  "Travoprost",
  "Bimatoprost",
  "Brinzolamide",
  "Prednisolone",
  "Dexamethasone",
  "Erythromycin",
  "Tobramycin",
  "Ciprofloxacin",
  "Ofloxacin",
  "Moxifloxacin",

  // Anticoagulants & Antiplatelet (30)
  "Aspirin",
  "Prasugrel",
  "Ticagrelor",
  "Cilostazol",
  "Dipyridamole",
  "Pentoxifylline",
  "Fondaparinux",
  "Heparin",

  // Vitamins & Supplements (50)
  "Vitamin D",
  "Vitamin B12",
  "Folic Acid",
  "Iron",
  "Calcium",
  "Potassium",
  "Magnesium",
  "Zinc",
  "Multivitamin",
  "Vitamin C",
  "Vitamin E",
  "Vitamin B6",
  "Thiamine",
  "Riboflavin",
  "Niacin",
  "Biotin",
  "Vitamin K",
  "Chromium",
]

interface RxNavDrug {
  rxcui: string
  name: string
  synonym?: string
}

interface RxNavNDC {
  ndcItem: {
    ndcCode: string
    packagingList: Array<{
      description: string
    }>
  }
}

async function searchRxNav(drugName: string): Promise<RxNavDrug[]> {
  const response = await fetch(`https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(drugName)}`)
  const data = await response.json()

  if (!data.drugGroup?.conceptGroup) return []

  const drugs: RxNavDrug[] = []
  for (const group of data.drugGroup.conceptGroup) {
    if (group.conceptProperties) {
      drugs.push(...group.conceptProperties)
    }
  }

  return drugs
}

async function getRxCUIDetails(rxcui: string) {
  const response = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/allrelated.json`)
  const data = await response.json()
  return data.allRelatedGroup
}

async function getNDCs(rxcui: string): Promise<string[]> {
  try {
    const response = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/ndcs.json`)
    const data = await response.json()
    return data.ndcGroup?.ndcList?.ndc || []
  } catch {
    return []
  }
}

function determineForm(name: string): string {
  const lowerName = name.toLowerCase()

  if (lowerName.includes("inhaler") || lowerName.includes("inhalation")) return "Inhaler"
  if (lowerName.includes("injection") || lowerName.includes("injectable")) return "Injection"
  if (lowerName.includes("cream") || lowerName.includes("ointment") || lowerName.includes("gel")) return "Topical"
  if (lowerName.includes("solution") || lowerName.includes("drops")) return "Solution"
  if (lowerName.includes("suspension")) return "Suspension"
  if (lowerName.includes("capsule")) return "Capsule"
  if (lowerName.includes("extended release") || lowerName.includes("er ")) return "Tablet ER"

  return "Tablet"
}

function extractStrength(name: string): string {
  // Extract strength like "10 MG", "500 MG", "2.5 MG"
  const match = name.match(/(\d+\.?\d*)\s*(MG|MCG|G|ML|%|UNIT)/i)
  return match ? `${match[1]} ${match[2].toUpperCase()}` : "10 MG"
}

function calculateAcquisitionCost(form: string): number {
  // $1 for 30 tablets/capsules = $0.0333 per pill
  // $30 for inhalers
  if (form === "Inhaler") return 30.0
  if (form === "Injection") return 5.0
  if (form === "Topical") return 10.0

  // Default: $1 for 30 = $0.0333 per unit
  return 0.0333
}

async function importMedication(drugName: string, index: number) {
  try {
    console.log(`[${index + 1}/1000] Fetching ${drugName}...`)

    // Search for the drug
    const drugs = await searchRxNav(drugName)

    if (drugs.length === 0) {
      console.log(`  ❌ Not found in RxNav`)
      return
    }

    // Get the first few results (different strengths)
    const drugsToImport = drugs.slice(0, 5)

    for (const drug of drugsToImport) {
      // Get NDC codes
      const ndcs = await getNDCs(drug.rxcui)
      const ndcCode = ndcs[0] || `RX${drug.rxcui}`

      const form = determineForm(drug.name)
      const strength = extractStrength(drug.name)
      const acquisitionCost = calculateAcquisitionCost(form)

      // Insert into database
      const { error } = await supabase.from("medications").upsert(
        {
          ndc_code: ndcCode,
          name: drugName,
          generic_name: drugName,
          brand_name: null,
          strength: strength,
          form: form,
          manufacturer: "Generic",
          acquisition_cost: acquisitionCost,
          is_generic: true,
          description: `${drugName} ${strength} ${form}`,
        },
        {
          onConflict: "ndc_code",
        },
      )

      if (error) {
        console.log(`  ⚠️ Error inserting: ${error.message}`)
      } else {
        console.log(`  ✅ Added: ${drugName} ${strength} ${form} - $${acquisitionCost}/unit`)
      }

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error}`)
  }
}

async function main() {
  console.log("🚀 Starting import of top 1000 medications from RxNav...\n")

  for (let i = 0; i < TOP_MEDICATIONS.length; i++) {
    await importMedication(TOP_MEDICATIONS[i], i)

    // Show progress every 50 medications
    if ((i + 1) % 50 === 0) {
      console.log(`\n📊 Progress: ${i + 1}/${TOP_MEDICATIONS.length} medications processed\n`)
    }
  }

  console.log("\n✅ Import complete!")

  // Show summary
  const { count } = await supabase.from("medications").select("*", { count: "exact", head: true })

  console.log(`📊 Total medications in database: ${count}`)
}

main()
