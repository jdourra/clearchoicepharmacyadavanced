import type { RejuvenationVial } from "@/lib/rejuvenation-vial-catalog"

export type VialProductContent = {
  homeKitTitle: string
  tagline: string
  purpose: string
  procedure: string
  benefits: string[]
  kitIncludes: string[]
  physicianConsent: string
  shipping: string
}

const SHARED_VIAL_KIT_INCLUDES = [
  "Physician-reviewed prescription",
  "Compounded at Clear Choice Pharmacy",
  "Syringes and alcohol pads",
  "Step-by-step injection instructions",
  "Secure shipping to your door",
]

const SHARED_PHYSICIAN =
  "A licensed physician reviews your intake before prescribing. You may be contacted within 24–48 hours if additional clinical information is needed."

const SHARED_SHIPPING = "Shipped from Clear Choice Pharmacy in Novi, MI."

export const VIAL_PRODUCT_CONTENT: Record<string, VialProductContent> = {
  b12: {
    homeKitTitle: "B12 Injection HomeKit",
    tagline: "Direct from Clear Choice Pharmacy",
    purpose: "Methylcobalamin B12 supports energy, metabolism, mood, and sleep.",
    procedure: "Intramuscular self-injection as directed — typically twice per week.",
    benefits: ["Energy and metabolism support", "Mood and sleep support", "10 doses per 30-day kit"],
    kitIncludes: ["10 intramuscular B12 injections per 30-day kit", ...SHARED_VIAL_KIT_INCLUDES],
    physicianConsent: SHARED_PHYSICIAN,
    shipping: SHARED_SHIPPING,
  },
  glutathione: {
    homeKitTitle: "Glutathione Injection HomeKit",
    tagline: "Direct from Clear Choice Pharmacy",
    purpose: "Master antioxidant support for detox, skin radiance, and immune health.",
    procedure: "Subcutaneous or intramuscular self-injection per your provider's directions.",
    benefits: ["Detox and antioxidant support", "Skin radiance support", "Immune wellness"],
    kitIncludes: ["30-day compounded glutathione supply", ...SHARED_VIAL_KIT_INCLUDES],
    physicianConsent: SHARED_PHYSICIAN,
    shipping: SHARED_SHIPPING,
  },
  "vitamin-c": {
    homeKitTitle: "Vitamin C Injection HomeKit",
    tagline: "Direct from Clear Choice Pharmacy",
    purpose: "High-potency vitamin C for immune defense and collagen support — bypasses GI limits.",
    procedure: "Intramuscular self-injection as directed by your provider.",
    benefits: ["Immune defense support", "Collagen and recovery support", "High-potency delivery"],
    kitIncludes: ["30-day vitamin C injection supply", ...SHARED_VIAL_KIT_INCLUDES],
    physicianConsent: SHARED_PHYSICIAN,
    shipping: SHARED_SHIPPING,
  },
  nad: {
    homeKitTitle: "NAD+ Injection HomeKit",
    tagline: "Direct from Clear Choice Pharmacy",
    purpose: "Cellular energy and anti-aging support for focus, stamina, and recovery.",
    procedure: "Subcutaneous self-injection per your provider's titration protocol.",
    benefits: ["Cellular energy support", "Focus and stamina", "Longevity-oriented wellness"],
    kitIncludes: ["30-day NAD+ injection supply", ...SHARED_VIAL_KIT_INCLUDES],
    physicianConsent: SHARED_PHYSICIAN,
    shipping: "Shipped cold from Clear Choice Pharmacy in Novi, MI. Refrigerate upon arrival.",
  },
  biotin: {
    homeKitTitle: "Biotin Injection HomeKit",
    tagline: "Direct from Clear Choice Pharmacy",
    purpose: "Biotin (B7) supports hair, skin, and nail health.",
    procedure: "Weekly intramuscular self-injection as directed.",
    benefits: ["Hair, skin, and nail support", "Weekly home injection protocol", "Pharmacy-compounded"],
    kitIncludes: ["30-day biotin injection supply", ...SHARED_VIAL_KIT_INCLUDES],
    physicianConsent: SHARED_PHYSICIAN,
    shipping: SHARED_SHIPPING,
  },
  nac: {
    homeKitTitle: "NAC Injection HomeKit",
    tagline: "Direct from Clear Choice Pharmacy",
    purpose: "N-Acetylcysteine supports detox pathways, respiratory wellness, and inflammation balance.",
    procedure: "Intramuscular self-injection per your provider's protocol.",
    benefits: ["Detox pathway support", "Respiratory wellness support", "Recovery support"],
    kitIncludes: ["30-day NAC injection supply", ...SHARED_VIAL_KIT_INCLUDES],
    physicianConsent: SHARED_PHYSICIAN,
    shipping: SHARED_SHIPPING,
  },
  "mic-skinny": {
    homeKitTitle: "MIC + B12 Skinny Shot HomeKit",
    tagline: "Direct from Clear Choice Pharmacy",
    purpose: "Lipotropic MIC blend plus B12 for metabolic support, energy, and fat metabolism.",
    procedure: "Weekly intramuscular self-injection at home.",
    benefits: ["Metabolic and lipotropic support", "B12 energy support", "4 weekly injections per kit"],
    kitIncludes: ["4 weekly MIC + B12 injections per 30-day kit", ...SHARED_VIAL_KIT_INCLUDES],
    physicianConsent: SHARED_PHYSICIAN,
    shipping: SHARED_SHIPPING,
  },
}

export function getVialProductPageTitle(vial: RejuvenationVial): string {
  return `${vial.title} | Clear Choice Pharmacy`
}

export function getVialProductContent(vialId: string, vial: RejuvenationVial): VialProductContent {
  const content = VIAL_PRODUCT_CONTENT[vialId]
  if (content) return content
  return {
    homeKitTitle: vial.title,
    tagline: "Direct from Clear Choice Pharmacy",
    purpose: vial.description,
    procedure: `${vial.route} · ${vial.frequency}`,
    benefits: ["Physician-reviewed", "Pharmacy-compounded", "Shipped to your door"],
    kitIncludes: [vial.supply, ...SHARED_VIAL_KIT_INCLUDES],
    physicianConsent: SHARED_PHYSICIAN,
    shipping: vial.shippingNote ? `${SHARED_SHIPPING} ${vial.shippingNote}` : SHARED_SHIPPING,
  }
}
