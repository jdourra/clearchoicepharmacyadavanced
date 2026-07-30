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
  image: { src: string; alt: string }
  shippingNote?: string
}

export const REJUVENATION_VIALS: RejuvenationVial[] = [
  {
    id: "b12",
    title: "B12 Injection Homekit",
    price: 119,
    category: "energy",
    badge: "Best Seller",
    badgeClass: "bg-sky-500/10 text-sky-700 border-sky-200",
    ingredients: ["Methylcobalamin B12 1000 mcg/mL"],
    supply: "30-day kit · 10 IM doses",
    route: "Intramuscular self-injection",
    frequency: "Twice per week",
    description:
      "Supports energy, metabolism, mood, and sleep. Physician-reviewed kit with syringes, alcohol pads, and injection tutorial.",
    image: {
      src: "/images/b12-vial.png",
      alt: "Vitamin B12 injection homekit vial",
    },
  },
  {
    id: "glutathione",
    title: "Glutathione Injection Homekit",
    price: 129,
    category: "skin",
    badge: "Antioxidant",
    badgeClass: "bg-emerald-500/10 text-emerald-800 border-emerald-200",
    ingredients: ["Reduced glutathione (GSH)"],
    supply: "30-day kit",
    route: "Subcutaneous or IM self-injection",
    frequency: "As directed by physician",
    description:
      "Master antioxidant support for restorative wellness, skin radiance, and immune health. Shipped after telehealth physician approval.",
    image: {
      src: "/images/glutathione-vial.png",
      alt: "Glutathione injection homekit vial",
    },
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
      "High-potency vitamin C for immune defense support, collagen support, and recovery support — bypasses GI absorption limits.",
    image: {
      src: "/images/vitamin-c-vial.png",
      alt: "Vitamin C injection homekit vial",
    },
  },
  {
    id: "nad",
    title: "NAD+ Injection Homekit",
    price: 379,
    category: "anti-aging",
    badge: "Healthy Aging",
    badgeClass: "bg-slate-800/10 text-slate-800 border-slate-300",
    ingredients: ["NAD+ (Nicotinamide Adenine Dinucleotide)"],
    supply: "30-day kit",
    route: "Subcutaneous self-injection",
    frequency: "As directed by physician",
    description:
      "Cellular health support for focus, stamina, and recovery. Includes supplies and physician access.",
    shippingNote: "Shipped cold — refrigerate upon arrival.",
    image: {
      src: "/images/nad-vial.png",
      alt: "NAD+ injection homekit vial",
    },
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
    image: {
      src: "/images/biotin-vial.png",
      alt: "Biotin injection homekit vial",
    },
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
      "Supports detox pathways, respiratory wellness, mood, and inflammation balance — physician-reviewed before shipping.",
    image: {
      src: "/images/nac-vial.png",
      alt: "NAC injection homekit vial",
    },
  },
]

export function getRejuvenationVial(id: string) {
  if (id === MIC_B12_WEIGHT_LOSS.id) return MIC_B12_WEIGHT_LOSS
  return REJUVENATION_VIALS.find((v) => v.id === id)
}

export const VIAL_PRODUCT_IDS = [...REJUVENATION_VIALS.map((v) => v.id), MIC_B12_WEIGHT_LOSS.id]

export function isVialProductId(value: string): value is (typeof VIAL_PRODUCT_IDS)[number] {
  return VIAL_PRODUCT_IDS.includes(value as (typeof VIAL_PRODUCT_IDS)[number])
}

export const VIAL_CATEGORY_LABELS: Record<RejuvenationVialCategory, string> = {
  energy: "Energy Support",
  "anti-aging": "Healthy Aging",
  immunity: "Immunity Support",
  skin: "Skin & Wellness",
  metabolic: "Metabolic Support",
}
