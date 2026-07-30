export type IvPackage = {
  id: string
  title: string
  price: number
  badge?: string
  badgeClass?: string
  ingredients: string[]
  description: string
  note?: string
  sessionLabel: string
  image: { src: string; alt: string }
}

export type IvBooster = {
  id: string
  name: string
  price: number
  benefit: string
  bestFor: string
}

/** Flat mobile RN dispatch & travel fee added at checkout (not included in drip list prices). */
export const IV_TRAVEL_FEE = 50

export const IV_SESSION_LABEL = "1 mobile IV session · licensed RN at your location"

export const IV_PACKAGES: IvPackage[] = [
  {
    id: "myers",
    title: "The Standard (Myers' Cocktail)",
    price: 199,
    badge: "Best Seller",
    badgeClass: "bg-sky-500/10 text-sky-700 border-sky-200",
    ingredients: ["Vitamin C", "B-Complex", "Vitamin B12", "Magnesium", "Calcium"],
    description:
      "A classic wellness IV for immune support, energy support, and hydration — administered after provider review.",
    sessionLabel: IV_SESSION_LABEL,
    image: {
      src: "/images/myers-cocktail-iv.png",
      alt: "Standard Myers Cocktail IV infusion bag with vitamin C, B-complex, and magnesium",
    },
  },
  {
    id: "symptom-relief",
    title: "Symptom Relief & Recovery",
    price: 249,
    badge: "Fast Acting",
    badgeClass: "bg-cyan-500/10 text-cyan-800 border-cyan-200",
    ingredients: [
      "IV Fluids + B-Complex",
      "Choice of Rx Add-in (Ondansetron for nausea OR Toradol for pain)",
    ],
    description:
      "Hydration and provider-selected Rx add-ins for recovery support during migraine, hangover, or illness-related discomfort.",
    sessionLabel: IV_SESSION_LABEL,
    image: {
      src: "/images/iv-b-complex.png",
      alt: "IV fluids and B-complex infusion bag for symptom relief and recovery",
    },
  },
  {
    id: "immunity-glow",
    title: "Immunity Max & Glow",
    price: 249,
    ingredients: ["High-dose Vitamin C", "Zinc", "Multi-trace elements", "Glutathione Push"],
    description:
      "High-dose nutrient support for immune defense, skin radiance, and restorative wellness.",
    sessionLabel: IV_SESSION_LABEL,
    image: {
      src: "/images/immunity-max-iv.png",
      alt: "High-dose vitamin C, zinc, and glutathione IV bag for immunity and energy",
    },
  },
  {
    id: "nad",
    title: "Premium NAD+ Therapy",
    price: 379,
    badge: "Healthy Aging",
    badgeClass: "bg-slate-800/10 text-slate-800 border-slate-300",
    ingredients: ["250mg pure NAD+ (Nicotinamide Adenine Dinucleotide) in Normal Saline"],
    description:
      "Provider-guided NAD+ infusion for cellular health support, focus, and energy — a restorative wellness option.",
    note: "Requires 2-hour monitored infusion.",
    sessionLabel: "1 mobile IV session · ~2 hours · licensed RN monitored infusion",
    image: {
      src: "/images/nad-therapy-iv.png",
      alt: "Premium NAD+ therapy IV infusion bag for cellular health support",
    },
  },
  {
    id: "hydration",
    title: "Basic Hydration",
    price: 149,
    ingredients: ["1,000ml Normal Saline or Lactated Ringer's"],
    description: "Pure, rapid fluid restoration for athletes or general dehydration.",
    sessionLabel: IV_SESSION_LABEL,
    image: {
      src: "/images/basic-hydration-iv.png",
      alt: "Basic hydration IV infusion bag with sterile saline",
    },
  },
]

export const IV_BOOSTERS: IvBooster[] = [
  {
    id: "glutathione",
    name: "Glutathione Push",
    price: 30,
    benefit: "Antioxidant support for wellness, skin radiance, and immune health.",
    bestFor: "Antioxidant support",
  },
  {
    id: "b12",
    name: "Vitamin B12 Shot",
    price: 25,
    benefit: "Supports energy, metabolism, mood, and mental clarity.",
    bestFor: "Energy support",
  },
  {
    id: "d3",
    name: "Vitamin D3 Boost",
    price: 35,
    benefit: "Supports bone health, immunity, and mood — especially helpful in low-sun seasons.",
    bestFor: "Immunity support",
  },
  {
    id: "zinc",
    name: "Zinc Supplement",
    price: 25,
    benefit: "Supports immune defense and post-illness recovery.",
    bestFor: "Recovery support",
  },
  {
    id: "toradol",
    name: "Toradol Pain Relief",
    price: 35,
    benefit: "Provider-selected anti-inflammatory support for headaches, body aches, and soreness.",
    bestFor: "Comfort support",
  },
]

export function getIvPackage(id: string) {
  return IV_PACKAGES.find((p) => p.id === id)
}

export const IV_PACKAGE_IDS = IV_PACKAGES.map((p) => p.id)

export function isIvPackageId(value: string): value is (typeof IV_PACKAGE_IDS)[number] {
  return IV_PACKAGE_IDS.includes(value as (typeof IV_PACKAGE_IDS)[number])
}

export function getIvBoosters(ids: string[]) {
  return ids.map((id) => IV_BOOSTERS.find((b) => b.id === id)).filter(Boolean) as IvBooster[]
}

export function calculateIvSubtotal(packageId: string, boosterIds: string[]) {
  const pkg = getIvPackage(packageId)
  const boosters = getIvBoosters(boosterIds)
  return (pkg?.price ?? 0) + boosters.reduce((sum, b) => sum + b.price, 0)
}

export function calculateIvTotal(packageId: string, boosterIds: string[]) {
  return calculateIvSubtotal(packageId, boosterIds) + IV_TRAVEL_FEE
}
