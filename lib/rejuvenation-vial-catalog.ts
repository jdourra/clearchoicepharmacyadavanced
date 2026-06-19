import { MIC_B12_WEIGHT_LOSS } from "@/lib/weight-loss-catalog"

export type RejuvenationVialCategory = "energy" | "anti-aging" | "immunity" | "skin" | "metabolic"

export type RejuvenationVial = {
  id: string
  title: string
  price: number
  category: RejuvenationVialCategory
  badge?: string
  badgeClass?: string
  ingredients: string[]
  supply: string
  route: string
  frequency: string
  description: string
  shippingNote?: string
}

export const REJUVENATION_VIALS: RejuvenationVial[] = [
  {
    id: "b12",
    title: "B12 Injection Homekit",
    price: 99,
    category: "energy",
    badge: "Best Seller",
    badgeClass: "bg-sky-500/10 text-sky-700 border-sky-200",
    ingredients: ["Methylcobalamin B12 1000 mcg/mL"],
    supply: "30-day kit · 10 IM doses",
    route: "Intramuscular self-injection",
    frequency: "Twice per week",
    description:
      "Improve energy, metabolism, mood, and sleep. Physician-reviewed kit with syringes, alcohol pads, and injection tutorial.",
  },
  {
    id: "glutathione",
    title: "Glutathione Injection Homekit",
    price: 129,
    category: "skin",
    badge: "Detox",
    badgeClass: "bg-emerald-500/10 text-emerald-800 border-emerald-200",
    ingredients: ["Reduced glutathione (GSH)"],
    supply: "30-day kit",
    route: "Subcutaneous or IM self-injection",
    frequency: "As directed by physician",
    description:
      "Master antioxidant for detox, skin radiance, and immune support. Shipped after telehealth physician approval.",
  },
  {
    id: "vitamin-c",
    title: "Vitamin C Injection Homekit",
    price: 99,
    category: "immunity",
    ingredients: ["Ascorbic acid (Vitamin C)"],
    supply: "30-day kit",
    route: "Intramuscular self-injection",
    frequency: "As directed by physician",
    description:
      "High-potency vitamin C for immune defense, collagen support, and recovery — bypasses GI absorption limits.",
  },
  {
    id: "nad",
    title: "NAD+ Injection Homekit",
    price: 379,
    category: "anti-aging",
    badge: "Longevity",
    badgeClass: "bg-slate-800/10 text-slate-800 border-slate-300",
    ingredients: ["NAD+ (Nicotinamide Adenine Dinucleotide)"],
    supply: "30-day kit",
    route: "Subcutaneous self-injection",
    frequency: "As directed by physician",
    description:
      "Cellular energy and anti-aging support for focus, stamina, and recovery. Includes supplies and physician access.",
    shippingNote: "Shipped cold — refrigerate upon arrival.",
  },
  {
    id: "biotin",
    title: "Biotin Injection Homekit",
    price: 99,
    category: "skin",
    ingredients: ["Biotin (Vitamin B7)"],
    supply: "30-day kit",
    route: "Intramuscular self-injection",
    frequency: "Weekly",
    description: "Hair, skin, and nail support with pharmacy-compounded biotin injections.",
  },
  {
    id: "nac",
    title: "NAC Injection Homekit",
    price: 249,
    category: "immunity",
    ingredients: ["N-Acetylcysteine (NAC)"],
    supply: "30-day kit",
    route: "Intramuscular self-injection",
    frequency: "As directed by physician",
    description:
      "Supports detox pathways, respiratory wellness, mood, and inflammation — physician-reviewed before shipping.",
  },
]

export function getRejuvenationVial(id: string) {
  if (id === MIC_B12_WEIGHT_LOSS.id) return MIC_B12_WEIGHT_LOSS
  return REJUVENATION_VIALS.find((v) => v.id === id)
}

export const VIAL_CATEGORY_LABELS: Record<RejuvenationVialCategory, string> = {
  energy: "Energy",
  "anti-aging": "Anti-Aging",
  immunity: "Immunity",
  skin: "Skin & Detox",
  metabolic: "Metabolic",
}
