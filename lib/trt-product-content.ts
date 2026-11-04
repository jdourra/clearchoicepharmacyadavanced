import type { TrtProgram } from "@/lib/trt-catalog"

export type TrtProductContent = {
  homeKitTitle: string
  tagline: string
  procedure: string
  howItWorks: string
  benefits: string[]
  kitIncludes: string[]
  monitoringNote: string
  physicianConsent: string
  shipping: string
}

const SHARED_TRT_KIT_INCLUDES = [
  "Physician-reviewed prescription and protocol",
  "Compounded at Clear Choice Pharmacy",
  "Step-by-step instructions",
  "Discreet shipping (cold chain when required)",
]

export const TRT_PRODUCT_CONTENT: Record<string, TrtProductContent> = {
  "testosterone-cypionate": {
    homeKitTitle: "Testosterone Cypionate TRT HomeKit",
    tagline: "Direct from Clear Choice Pharmacy",
    procedure:
      "Intramuscular self-injection, typically once per week in the thigh or deltoid. Your kit includes syringes, alcohol pads, and injection guidance.",
    howItWorks:
      "Testosterone cypionate is the most widely used injectable TRT protocol. Weekly dosing helps maintain steady testosterone levels under physician supervision.",
    benefits: programBenefits("injectable"),
    kitIncludes: [
      "4 weekly testosterone cypionate injections per 30-day kit",
      "Syringes and alcohol pads",
      ...SHARED_TRT_KIT_INCLUDES,
    ],
    monitoringNote:
      "Your provider may recommend periodic lab work to monitor testosterone, hematocrit, and related markers during therapy.",
    physicianConsent:
      "Testosterone is a controlled substance. A licensed physician reviews your intake before prescribing. Additional labs or follow-up may be required.",
    shipping: "Shipped from Clear Choice Pharmacy in Novi, MI. Refrigerate upon receipt.",
  },
  "testosterone-cream": {
    homeKitTitle: "Testosterone Cream TRT HomeKit",
    tagline: "Direct from Clear Choice Pharmacy",
    procedure:
      "Apply compounded testosterone cream daily to clean, dry skin as directed — typically shoulders, upper arms, or abdomen. Wash hands after application.",
    howItWorks:
      "Topical testosterone absorbs through the skin for patients who prefer a needle-free TRT option. Strength and application site are personalized by your provider.",
    benefits: [
      "No injections required",
      "Daily easy application",
      "Discreet pharmacy fulfillment",
      "Provider-guided dosing",
    ],
    kitIncludes: [
      "30-day topical testosterone supply",
      "Application instructions",
      ...SHARED_TRT_KIT_INCLUDES,
    ],
    monitoringNote:
      "Topical protocols still require physician oversight and periodic labs to confirm therapeutic levels and safety.",
    physicianConsent:
      "A licensed physician reviews your intake before prescribing. You may be contacted within 24–48 hours if additional clinical information is needed.",
    shipping: "Shipped discreetly from Clear Choice Pharmacy in Novi, MI.",
  },
  enclomiphene: {
    homeKitTitle: "Enclomiphene Oral TRT HomeKit",
    tagline: "Direct from Clear Choice Pharmacy",
    procedure:
      "Take oral enclomiphene daily as prescribed, with or without food per your provider's directions.",
    howItWorks:
      "Enclomiphene stimulates your body's natural testosterone production rather than replacing it directly — often chosen by men who want to preserve fertility while addressing low T symptoms.",
    benefits: [
      "Non-injectable oral protocol",
      "May support natural testosterone production",
      "Often used when fertility is a concern",
      "Transparent cash-pay pricing",
    ],
    kitIncludes: [
      "30-day oral supply · daily tablets",
      ...SHARED_TRT_KIT_INCLUDES,
    ],
    monitoringNote:
      "Lab monitoring helps your provider titrate your oral protocol and confirm response over time.",
    physicianConsent:
      "A licensed physician reviews your intake before prescribing. You may be contacted within 24–48 hours if additional clinical information is needed.",
    shipping: "Shipped discreetly from Clear Choice Pharmacy in Novi, MI.",
  },
}

function programBenefits(type: "injectable"): string[] {
  if (type === "injectable") {
    return [
      "Most common TRT protocol",
      "Steady testosterone levels",
      "30-day kit with supplies included",
      "Ongoing provider oversight",
    ]
  }
  return []
}

export function getTrtProductPageTitle(program: TrtProgram): string {
  const from = Math.min(...program.pricing.map((p) => p.pricePerMonth))
  if (program.id === "testosterone-cypionate") {
    return `Testosterone Cypionate from $${from}/mo | TRT Michigan | Clear Choice Pharmacy`
  }
  if (program.id === "testosterone-cream") {
    return `Testosterone Cream from $${from}/mo | TRT Michigan | Clear Choice Pharmacy`
  }
  return `Enclomiphene from $${from}/mo | TRT Michigan | Clear Choice Pharmacy`
}
