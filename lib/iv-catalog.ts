export type IvPackage = {
  id: string
  title: string
  price: number
  badge?: string
  badgeClass?: string
  ingredients: string[]
  description: string
  note?: string
}

export type IvBooster = {
  id: string
  name: string
  price: number
}

export const IV_PACKAGES: IvPackage[] = [
  {
    id: "myers",
    title: "The Standard (Myers' Cocktail)",
    price: 249,
    badge: "Best Seller",
    badgeClass: "bg-sky-500/10 text-sky-700 border-sky-200",
    ingredients: ["Vitamin C", "B-Complex", "Vitamin B12", "Magnesium", "Calcium"],
    description:
      "The gold standard for overall wellness, immune support, chronic fatigue, and rapid cellular hydration.",
  },
  {
    id: "symptom-relief",
    title: "Symptom Relief & Recovery",
    price: 299,
    badge: "Fast Acting",
    badgeClass: "bg-cyan-500/10 text-cyan-800 border-cyan-200",
    ingredients: [
      "IV Fluids + B-Complex",
      "Choice of Rx Add-in (Ondansetron for nausea OR Toradol for pain)",
    ],
    description:
      "Engineered for rapid relief from migraines, severe hangovers, food poisoning, or flu symptoms.",
  },
  {
    id: "immunity-glow",
    title: "Immunity Max & Glow",
    price: 280,
    ingredients: ["High-dose Vitamin C", "Zinc", "Multi-trace elements", "Glutathione Push"],
    description:
      "Boost your immune defense, enhance skin radiance, and detoxify cells from the inside out.",
  },
  {
    id: "nad",
    title: "Premium Anti-Aging (NAD+ Therapy)",
    price: 450,
    badge: "Longevity",
    badgeClass: "bg-slate-800/10 text-slate-800 border-slate-300",
    ingredients: ["250mg pure NAD+ (Nicotinamide Adenine Dinucleotide) in Normal Saline"],
    description:
      "Advanced cellular repair that boosts cognitive function, accelerates metabolic energy, and fights aging.",
    note: "Requires 2-hour monitored infusion.",
  },
  {
    id: "hydration",
    title: "Basic Hydration",
    price: 149,
    ingredients: ["1,000ml Normal Saline or Lactated Ringer's"],
    description: "Pure, rapid fluid restoration for athletes or general dehydration.",
  },
]

export const IV_BOOSTERS: IvBooster[] = [
  { id: "glutathione", name: "Glutathione Push", price: 30 },
  { id: "b12", name: "Vitamin B12 Shot", price: 25 },
  { id: "d3", name: "Vitamin D3 Boost", price: 35 },
  { id: "zinc", name: "Zinc Supplement", price: 25 },
  { id: "toradol", name: "Toradol Pain Relief", price: 35 },
]

export function getIvPackage(id: string) {
  return IV_PACKAGES.find((p) => p.id === id)
}

export function getIvBoosters(ids: string[]) {
  return ids.map((id) => IV_BOOSTERS.find((b) => b.id === id)).filter(Boolean) as IvBooster[]
}

export function calculateIvTotal(packageId: string, boosterIds: string[]) {
  const pkg = getIvPackage(packageId)
  const boosters = getIvBoosters(boosterIds)
  return (pkg?.price ?? 0) + boosters.reduce((sum, b) => sum + b.price, 0)
}
