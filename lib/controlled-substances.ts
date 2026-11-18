/** Cash-pay prescription list. Hormone-therapy products are a separate catalog. */
export const CONTROLLED_SUBSTANCE_MESSAGE =
  "Clear Choice Pharmacy does not carry controlled substances on this prescription list. This medication is not available."

const GENERICS = [
  "alprazolam",
  "amphetamine",
  "armodafinil",
  "benzphetamine",
  "buprenorphine",
  "butalbital",
  "carisoprodol",
  "chlordiazepoxide",
  "clonazepam",
  "codeine",
  "dextroamphetamine",
  "diazepam",
  "eszopiclone",
  "fentanyl",
  "gabapentin",
  "hydrocodone",
  "hydromorphone",
  "ketamine",
  "lisdexamfetamine",
  "lorazepam",
  "meperidine",
  "methadone",
  "methylphenidate",
  "midazolam",
  "modafinil",
  "morphine",
  "oxazepam",
  "oxycodone",
  "oxymorphone",
  "pentazocine",
  "phendimetrazine",
  "phenobarbital",
  "phentermine",
  "pregabalin",
  "tapentadol",
  "temazepam",
  "testosterone",
  "tramadol",
  "triazolam",
  "zaleplon",
  "zolpidem",
]

const BRANDS = new Set([
  "adderall",
  "adipex",
  "ambien",
  "androgel",
  "ativan",
  "concerta",
  "demerol",
  "dilaudid",
  "duragesic",
  "edluar",
  "fiorinal",
  "fioricet",
  "halcion",
  "klonopin",
  "kadian",
  "lomaira",
  "lunesta",
  "lyrica",
  "mscontin",
  "neurontin",
  "norco",
  "nucynta",
  "nuvigil",
  "opana",
  "oxycontin",
  "percocet",
  "provigil",
  "restoril",
  "ritalin",
  "roxicodone",
  "soma",
  "sonata",
  "suboxone",
  "subutex",
  "testim",
  "ultram",
  "ultracet",
  "valium",
  "vicodin",
  "vyvanse",
  "xanax",
  "zubsolv",
])

const PHRASES = ["ms contin", "depo testosterone"]

export function isControlledSubstanceQuery(value: string | null | undefined): boolean {
  const text = String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
  if (!text) return false
  if (PHRASES.some((phrase) => text.includes(phrase))) return true
  const tokens = text.split(/\s+/).filter(Boolean)
  if (tokens.some((token) => BRANDS.has(token))) return true
  return GENERICS.some((generic) => tokens.some((token) => token === generic || token.startsWith(generic)))
}

export function isControlledMedication(med: {
  name?: string | null
  generic_name?: string | null
  brand_name?: string | null
}): boolean {
  return (
    isControlledSubstanceQuery(med.name) ||
    isControlledSubstanceQuery(med.generic_name) ||
    isControlledSubstanceQuery(med.brand_name)
  )
}
