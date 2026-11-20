import type { TrtProgram } from "@/lib/trt-catalog"
import { LIVE_VIDEO_VISIT_NOTE } from "@/lib/us-states"

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
  "Ola Health reviews the intake. RxAve routes an approved prescription to a compounding pharmacy licensed to dispense in the patient's state",
  "Step-by-step instructions",
  "Discreet shipping (cold chain when required)",
]

export const TRT_PRODUCT_CONTENT: Record<string, TrtProductContent> = {
  "testosterone-cypionate": {
    homeKitTitle: "Testosterone Cypionate TRT HomeKit",
    tagline: "Reviewed by Ola Health · Routed by RxAve",
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
      "Submit laboratory results from the last 12 months before the intake can be reviewed. Testosterone therapy is for patients with low testosterone. A licensed physician reviews those results and decides whether treatment is appropriate. Follow-up labs, including hematocrit, may be required during therapy.",
    physicianConsent:
      `Testosterone is a controlled substance and is prescribed for low testosterone only after a licensed physician reviews your submitted laboratory results. ${LIVE_VIDEO_VISIT_NOTE} The intake cannot be submitted without those results.`,
    shipping: "Routed by RxAve and shipped by a compounding pharmacy licensed to dispense in the patient's state. Refrigerate upon receipt. Clear Choice Pharmacy does not dispense compounded medication.",
  },
  "testosterone-cream": {
    homeKitTitle: "Testosterone Cream TRT HomeKit",
    tagline: "Reviewed by Ola Health · Routed by RxAve",
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
      "Submit laboratory results from the last 12 months before the intake can be reviewed. Testosterone therapy is for patients with low testosterone. A licensed physician reviews those results and decides whether treatment is appropriate.",
    physicianConsent:
      `A licensed physician reviews your submitted laboratory results before prescribing. ${LIVE_VIDEO_VISIT_NOTE} The intake cannot be submitted without those results.`,
    shipping: "Routed by RxAve and shipped discreetly by a compounding pharmacy licensed to dispense in the patient's state. Clear Choice Pharmacy does not dispense this medication.",
  },
  enclomiphene: {
    homeKitTitle: "Enclomiphene Oral TRT HomeKit",
    tagline: "Reviewed by Ola Health · Routed by RxAve",
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
      "Submit laboratory results from the last 12 months before the intake can be reviewed. This therapy is considered for patients with low testosterone. A licensed physician reviews those results and decides whether treatment is appropriate.",
    physicianConsent:
      `A licensed physician reviews your submitted laboratory results before prescribing. ${LIVE_VIDEO_VISIT_NOTE} The intake cannot be submitted without those results.`,
    shipping: "Routed by RxAve and shipped discreetly by a compounding pharmacy licensed to dispense in the patient's state. Clear Choice Pharmacy does not dispense this medication.",
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
