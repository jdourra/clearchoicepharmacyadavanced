import type { WeightLossProgram } from "@/lib/weight-loss-catalog"

export type WeightLossProductSlug = "semaglutide" | "tirzepatide"

export const WEIGHT_LOSS_PRODUCT_SLUGS: WeightLossProductSlug[] = ["semaglutide", "tirzepatide"]

export function isWeightLossProductSlug(value: string): value is WeightLossProductSlug {
  return WEIGHT_LOSS_PRODUCT_SLUGS.includes(value as WeightLossProductSlug)
}

export type WeightLossProductContent = {
  homeKitTitle: string
  tagline: string
  purpose: string
  procedure: string
  dosageFrequency: string
  dietExercise: string
  benefits: string[]
  commonSideEffects: string
  nauseaTips: string[]
  titrationTitle: string
  titrationBody: string
  titrationPhases: { phase: string; detail: string }[]
  shipping: string
  physicianConsent: string
  scienceSummary: string
  kitIncludes: string[]
  optionalAddon?: { label: string; description: string; href: string }
}

const SHARED_KIT_INCLUDES = [
  "Physician-reviewed prescription and titration plan",
  "Compounded medication prepared at Clear Choice Pharmacy",
  "Syringes and alcohol pads",
  "Step-by-step injection instructions",
  "Secure shipping to your door",
]

export const WEIGHT_LOSS_PRODUCT_CONTENT: Record<WeightLossProductSlug, WeightLossProductContent> = {
  semaglutide: {
    homeKitTitle: "Semaglutide HomeKit",
    tagline: "Direct from Clear Choice Pharmacy",
    purpose:
      "Semaglutide is a once-weekly GLP-1 therapy that helps regulate appetite and food intake, supporting sustainable medical weight loss when combined with healthy lifestyle habits. Our compounded formulation is prepared pursuant to your provider's prescription.",
    procedure:
      "Subcutaneous (Sub-Q) injection, self-administered in the fatty tissue of the abdomen or thigh. Step-by-step instructions are included with your kit.",
    dosageFrequency:
      "Once per week — same day each week, any time of day, with or without food. Your provider will personalize your starting dose and titration schedule.",
    dietExercise: "Healthy eating and regular activity are recommended alongside therapy.",
    benefits: [
      "Medical weight management support",
      "May support healthier blood pressure",
      "May support improved cholesterol markers",
      "May support blood sugar regulation",
    ],
    commonSideEffects: "Nausea is the most common side effect, especially during dose increases.",
    nauseaTips: [
      "Eat bland, low-fat foods such as crackers, toast, or rice.",
      "Choose foods with high water content, like soup or gelatin.",
      "Avoid lying down right after eating.",
      "Eat slowly and go outdoors for fresh air if needed.",
    ],
    titrationTitle: "Provider-guided titration",
    titrationBody:
      "GLP-1 therapy follows a gradual titration schedule. Your licensed provider determines when and how to increase your dose based on your response, goals, and tolerance — not a one-size-fits-all retail protocol.",
    titrationPhases: [
      { phase: "Starting phase", detail: "Lower introductory dose to help your body adjust." },
      { phase: "Titration phase", detail: "Gradual dose increases over subsequent weeks as clinically appropriate." },
      { phase: "Maintenance phase", detail: "Ongoing dose tailored to your goals with continued provider oversight." },
    ],
    shipping:
      "Shipped from Clear Choice Pharmacy in Novi, MI. Refrigerate upon receipt. Your kit includes supplies and instructions for at-home use.",
    physicianConsent:
      "A licensed physician reviews your intake before prescribing. You may be contacted within 24–48 hours if additional clinical information is needed.",
    scienceSummary:
      "Semaglutide is a GLP-1 receptor agonist that mimics an incretin hormone involved in appetite regulation and glucose homeostasis. It enhances glucose-dependent insulin secretion, suppresses glucagon, slows gastric emptying, and reduces food intake — supporting medical weight management under physician supervision.",
    kitIncludes: [
      "4 once-weekly injections per 30-day kit (dose strength per your provider's protocol)",
      ...SHARED_KIT_INCLUDES,
    ],
    optionalAddon: {
      label: "MIC + B12 Skinny Shot HomeKit",
      description: "Optional lipotropic metabolic support alongside GLP-1 therapy.",
      href: "/iv-rejuvenation/vials/start?vial=mic-skinny",
    },
  },
  tirzepatide: {
    homeKitTitle: "Tirzepatide HomeKit",
    tagline: "Direct from Clear Choice Pharmacy",
    purpose:
      "Tirzepatide is a once-weekly dual GLP-1/GIP therapy that targets multiple metabolic pathways involved in appetite and weight regulation. It is prescribed for qualifying patients after physician review.",
    procedure:
      "Subcutaneous (Sub-Q) injection, self-administered in the fatty tissue of the abdomen or thigh. Step-by-step instructions are included with your kit.",
    dosageFrequency:
      "Once per week — same day each week, any time of day, with or without food. Your provider establishes your titration plan.",
    dietExercise: "Healthy eating and regular activity are recommended alongside therapy.",
    benefits: [
      "Advanced dual-pathway metabolic support",
      "Medical weight management for qualifying patients",
      "Provider-guided titration and ongoing oversight",
      "Pharmacy-compounded fulfillment",
    ],
    commonSideEffects: "Nausea, decreased appetite, or GI upset may occur — especially when doses increase.",
    nauseaTips: [
      "Eat smaller, bland meals during titration.",
      "Stay hydrated and avoid high-fat meals on injection day.",
      "Eat slowly and avoid lying down immediately after meals.",
      "Contact your provider if symptoms are severe or persistent.",
    ],
    titrationTitle: "Provider-guided titration",
    titrationBody:
      "Tirzepatide requires careful dose escalation. Your physician reviews your health profile and adjusts your protocol over time for safety and efficacy.",
    titrationPhases: [
      { phase: "Starting phase", detail: "Introductory dose selected by your provider." },
      { phase: "Titration phase", detail: "Stepwise increases based on clinical response." },
      { phase: "Maintenance phase", detail: "Personalized ongoing dose with pharmacy fulfillment." },
    ],
    shipping:
      "Shipped from Clear Choice Pharmacy in Novi, MI. Refrigerate upon receipt. Supplies and instructions included.",
    physicianConsent:
      "A licensed physician reviews your intake before prescribing. You may be contacted within 24–48 hours if additional clinical information is needed.",
    scienceSummary:
      "Tirzepatide activates both GLP-1 and GIP receptors, offering dual incretin pathway support. Under physician supervision, it is used for medical weight management in qualifying patients.",
    kitIncludes: [
      "4 once-weekly injections per 30-day kit (dose strength per your provider's protocol)",
      ...SHARED_KIT_INCLUDES,
    ],
    optionalAddon: {
      label: "MIC + B12 Skinny Shot HomeKit",
      description: "Optional lipotropic metabolic support alongside GLP-1/GIP therapy.",
      href: "/iv-rejuvenation/vials/start?vial=mic-skinny",
    },
  },
}

export function getWeightLossProductPageTitle(program: WeightLossProgram): string {
  return `${program.id === "semaglutide" ? "Semaglutide" : "Tirzepatide"} HomeKit | Clear Choice Pharmacy`
}
