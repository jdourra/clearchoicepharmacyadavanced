import type { IvPackage } from "@/lib/iv-catalog"

export type IvProductContent = {
  tagline: string
  purpose: string
  procedure: string
  duration: string
  benefits: string[]
  sessionIncludes: string[]
  physicianConsent: string
  dispatchNote: string
}

const SHARED_SESSION_INCLUDES = [
  "Physician-reviewed treatment order",
  "Pharmacy-compounded IV bag from Clear Choice Pharmacy",
  "Licensed RN dispatched to your home, office, or hotel",
  "Professional IV administration and monitoring",
]

const SHARED_DISPATCH =
  "A flat mobile travel and dispatch fee is added at checkout for RN home visits in the Metro Detroit service area."

const SHARED_PHYSICIAN =
  "A licensed provider reviews your intake before your IV is prepared. You may be contacted if additional clinical information is needed."

export const IV_PRODUCT_CONTENT: Record<string, IvProductContent> = {
  myers: {
    tagline: "Direct from Clear Choice Pharmacy",
    purpose:
      "The Myers' Cocktail is the classic wellness IV — vitamins, minerals, and hydration for energy, immunity, and recovery support.",
    procedure: "IV catheter placement and slow infusion by a licensed RN at your chosen location.",
    duration: "Typically 45–60 minutes",
    benefits: ["Immune and energy support", "Hydration and nutrient replenishment", "Popular wellness baseline drip"],
    sessionIncludes: [...SHARED_SESSION_INCLUDES],
    physicianConsent: SHARED_PHYSICIAN,
    dispatchNote: SHARED_DISPATCH,
  },
  "symptom-relief": {
    tagline: "Direct from Clear Choice Pharmacy",
    purpose: "Rapid hydration plus targeted Rx support for nausea or pain during acute symptom flares.",
    procedure: "IV fluids with B-complex plus your provider-selected anti-nausea or pain add-in.",
    duration: "Typically 45–60 minutes",
    benefits: ["Migraine and hangover relief support", "Rehydration after illness", "Fast-acting symptom support"],
    sessionIncludes: [...SHARED_SESSION_INCLUDES],
    physicianConsent: SHARED_PHYSICIAN,
    dispatchNote: SHARED_DISPATCH,
  },
  "immunity-glow": {
    tagline: "Direct from Clear Choice Pharmacy",
    purpose: "High-dose immune nutrients plus glutathione for defense, recovery, and skin radiance.",
    procedure: "IV infusion with optional glutathione push per your approved protocol.",
    duration: "Typically 60 minutes",
    benefits: ["Immune defense support", "Antioxidant and detox support", "Glow and recovery support"],
    sessionIncludes: [...SHARED_SESSION_INCLUDES],
    physicianConsent: SHARED_PHYSICIAN,
    dispatchNote: SHARED_DISPATCH,
  },
  nad: {
    tagline: "Direct from Clear Choice Pharmacy",
    purpose: "Premium NAD+ IV therapy for cellular energy, cognitive support, and anti-aging wellness.",
    procedure: "Slow, RN-monitored NAD+ infusion — not a quick push drip.",
    duration: "Approximately 2 hours · RN monitored",
    benefits: ["Cellular energy support", "Focus and stamina support", "Longevity-oriented wellness"],
    sessionIncludes: [...SHARED_SESSION_INCLUDES, "Extended monitored infusion session"],
    physicianConsent: SHARED_PHYSICIAN,
    dispatchNote: SHARED_DISPATCH,
  },
  hydration: {
    tagline: "Direct from Clear Choice Pharmacy",
    purpose: "Straightforward fluid restoration for dehydration, athletic recovery, or general wellness.",
    procedure: "IV fluids (normal saline or lactated Ringer's) administered by a licensed RN.",
    duration: "Typically 30–45 minutes",
    benefits: ["Rapid rehydration", "Athletic recovery support", "Simple baseline IV option"],
    sessionIncludes: [...SHARED_SESSION_INCLUDES],
    physicianConsent: SHARED_PHYSICIAN,
    dispatchNote: SHARED_DISPATCH,
  },
}

export function getIvProductPageTitle(pkg: IvPackage): string {
  return `${pkg.title} | Clear Choice IV`
}

export function getIvProductContent(packageId: string): IvProductContent {
  return (
    IV_PRODUCT_CONTENT[packageId] ?? {
      tagline: "Direct from Clear Choice Pharmacy",
      purpose: "Physician-reviewed mobile IV therapy compounded at Clear Choice Pharmacy.",
      procedure: "Licensed RN IV administration at your location.",
      duration: "Varies by drip",
      benefits: ["Pharmacy-formulated", "Provider reviewed", "Mobile RN delivery"],
      sessionIncludes: SHARED_SESSION_INCLUDES,
      physicianConsent: SHARED_PHYSICIAN,
      dispatchNote: SHARED_DISPATCH,
    }
  )
}
