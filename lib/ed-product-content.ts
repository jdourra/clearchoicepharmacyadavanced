import type { EdTrocheProduct } from "@/lib/ed-troche-catalog"

export type EdProductContent = {
  homeKitTitle: string
  tagline: string
  procedure: string
  howItWorks: string
  benefits: string[]
  kitIncludes: string[]
  physicianConsent: string
  shipping: string
}

const SHARED_ED_KIT_INCLUDES = [
  "Physician-reviewed prescription",
  "Compounded at Clear Choice Pharmacy",
  "Discreet pharmacy shipping",
  "Step-by-step use instructions",
]

export const ED_PRODUCT_CONTENT: Record<string, EdProductContent> = {
  "sildenafil-fast": {
    homeKitTitle: "Sildenafil Fast-Acting Troche HomeKit",
    tagline: "Direct from Clear Choice Pharmacy",
    procedure:
      "Place one troche under your tongue 30–60 minutes before activity. Allow it to dissolve fully — do not chew or swallow whole for fastest absorption.",
    howItWorks:
      "Sublingual delivery bypasses the digestive tract, so absorption begins in minutes rather than the 30–60 minutes typical of swallowed tablets. Food does not delay onset the way it can with oral pills.",
    benefits: [
      "Rapid onset — often 15–30 minutes",
      "Lasts approximately 4–6 hours",
      "Unaffected by food",
      "Compounded to your provider's strength",
    ],
    kitIncludes: [
      "10 sublingual troches per 30-day supply (as-needed use)",
      ...SHARED_ED_KIT_INCLUDES,
    ],
    physicianConsent:
      "A licensed physician reviews your intake before prescribing. You may be contacted within 24–48 hours if additional clinical information is needed.",
    shipping: "Shipped discreetly from Clear Choice Pharmacy in Novi, MI.",
  },
  "tadalafil-daily": {
    homeKitTitle: "Tadalafil Extended-Duration Troche HomeKit",
    tagline: "Direct from Clear Choice Pharmacy",
    procedure:
      "Place one troche under your tongue as directed — daily for continuous support or as needed before activity. Allow full sublingual dissolution.",
    howItWorks:
      "Tadalafil offers an extended window of support — up to 36 hours — reducing timing pressure. Sublingual compounding supports faster absorption than swallowed tablets.",
    benefits: [
      "Up to 36-hour support window",
      "Ideal for spontaneity",
      "Daily or as-needed protocols",
      "Unaffected by food",
    ],
    kitIncludes: [
      "30 sublingual troches per 30-day supply (daily or as-directed use)",
      ...SHARED_ED_KIT_INCLUDES,
    ],
    physicianConsent:
      "A licensed physician reviews your intake before prescribing. You may be contacted within 24–48 hours if additional clinical information is needed.",
    shipping: "Shipped discreetly from Clear Choice Pharmacy in Novi, MI.",
  },
  "combination-troche": {
    homeKitTitle: "Sildenafil + Tadalafil Combination Troche HomeKit",
    tagline: "Direct from Clear Choice Pharmacy",
    procedure:
      "Place one dual-action troche under your tongue as directed by your provider. Dissolve fully under the tongue before activity.",
    howItWorks:
      "This compounded troche combines fast-acting Sildenafil with longer-duration Tadalafil in one sublingual dose — designed for patients who want both rapid onset and extended coverage.",
    benefits: [
      "Dual PDE5 pathway support",
      "Fast onset plus extended window",
      "Physician-customized strengths",
      "Pharmacy-compounded in one troche",
    ],
    kitIncludes: [
      "10 sublingual troches per 30-day supply (as-directed use)",
      ...SHARED_ED_KIT_INCLUDES,
    ],
    physicianConsent:
      "A licensed physician reviews your intake before prescribing. You may be contacted within 24–48 hours if additional clinical information is needed.",
    shipping: "Shipped discreetly from Clear Choice Pharmacy in Novi, MI.",
  },
}

export function getEdProductPageTitle(product: EdTrocheProduct): string {
  return `${product.name} Troche HomeKit | Clear Choice Pharmacy`
}
