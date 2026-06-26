import type { RejuvenationVial } from "@/lib/rejuvenation-vial-catalog"

export type WeightLossBillingPlan = "monthly" | "quarterly"

export type WeightLossProgram = {
  id: string
  name: string
  subtitle: string
  description: string
  features: string[]
  image: { src: string; alt: string }
  pricing: { plan: WeightLossBillingPlan; pricePerMonth: number; totalBilled: number; badge?: string }[]
}

export const WEIGHT_LOSS_PROGRAMS: WeightLossProgram[] = [
  {
    id: "semaglutide",
    name: "Semaglutide Program",
    subtitle: "GLP-1 Therapy",
    description:
      "Physician-guided compounded semaglutide with a structured titration schedule tailored to your metabolic goals.",
    features: ["Weekly dosing protocol", "Structured titration", "Ongoing provider oversight", "Pharmacy fulfillment"],
    image: {
      src: "/images/semaglutide-vial.png",
      alt: "Compounded Semaglutide injection vial",
    },
    pricing: [
      { plan: "monthly", pricePerMonth: 189, totalBilled: 189 },
      { plan: "quarterly", pricePerMonth: 169, totalBilled: 507, badge: "Best Value" },
    ],
  },
  {
    id: "tirzepatide",
    name: "Tirzepatide Program",
    subtitle: "Dual GLP-1/GIP Therapy",
    description:
      "Advanced dual-pathway therapy for patients who may benefit from combined GLP-1 and GIP receptor activation.",
    features: ["Weekly dosing protocol", "Dual-action support", "Provider-guided titration", "Pharmacy fulfillment"],
    image: {
      src: "/images/tirzepatide-vial.png",
      alt: "Compounded Tirzepatide injection vial",
    },
    pricing: [
      { plan: "monthly", pricePerMonth: 255, totalBilled: 255 },
      { plan: "quarterly", pricePerMonth: 229, totalBilled: 687, badge: "Best Value" },
    ],
  },
]

export function getWeightLossProgram(id: string): WeightLossProgram | undefined {
  return WEIGHT_LOSS_PROGRAMS.find((p) => p.id === id)
}

/** MIC + B12 skinny shot — sold via weight loss landing; intake uses rejuvenation vial flow. */
export const MIC_B12_WEIGHT_LOSS: RejuvenationVial = {
  id: "mic-skinny",
  title: "MIC + B12 Skinny Shot Homekit",
  price: 99,
  category: "metabolic",
  ingredients: ["Methionine, Inositol & Choline (MIC blend)", "Vitamin B12", "L-Carnitine"],
  supply: "30-day kit · weekly doses",
  route: "Intramuscular self-injection",
  frequency: "Once per week",
  description:
    "Physician-reviewed lipotropic injection kit for metabolic support, energy, and fat metabolism — compounded at Clear Choice Pharmacy.",
  image: {
    src: "/images/mic-b12-vial.png",
    alt: "MIC + B12 lipotropic injection vial",
  },
} satisfies RejuvenationVial & { image: { src: string; alt: string } }

export const MIC_B12_HOW_IT_WORKS = [
  {
    icon: "flask-conical" as const,
    title: "MIC Lipotropic Support",
    description:
      "The MIC blend (Methionine, Inositol, and Choline) supports liver function and helps your body process and mobilize stored fat for energy.",
  },
  {
    icon: "activity" as const,
    title: "B12 for Energy & Metabolism",
    description:
      "Vitamin B12 supports cellular energy production and a healthy metabolism — helping you stay active while working toward weight-loss goals.",
  },
  {
    icon: "scale" as const,
    title: "L-Carnitine Fat Transport",
    description:
      "L-Carnitine helps transport fatty acids into cells where they can be used for fuel, supporting fat metabolism alongside diet and exercise.",
  },
  {
    icon: "shield" as const,
    title: "Weekly Home Injection",
    description:
      "After telehealth review, your 30-day kit ships with syringes, supplies, and instructions for once-weekly self-injection at home.",
  },
]
