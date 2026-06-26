import type { LucideIcon } from "lucide-react"
import { Heart, Scale, Stethoscope, Syringe } from "lucide-react"

export type ServicePathType = "cash-pay" | "consultation" | "insurance"

export interface ClinicalService {
  href: string
  title: string
  description: string
  pathType: ServicePathType
  pathLabel: string
  cta: string
  icon: LucideIcon
  image?: { src: string; alt: string }
}

export const CLINICAL_SERVICES: ClinicalService[] = [
  {
    href: "/weight-loss",
    title: "GLP-1 Medical Weight Loss",
    description:
      "Semaglutide and Tirzepatide programs with custom titration and upfront cash-pay pricing in Novi, MI.",
    pathType: "consultation",
    pathLabel: "Provider review required",
    cta: "Buy now",
    icon: Scale,
    image: {
      src: "/images/weight-loss-card.png",
      alt: "Patient showing weight loss progress with looser-fitting jeans",
    },
  },
  {
    href: "/mens-health",
    title: "Men's Health, ED & TRT",
    description:
      "Custom sublingual ED troches and physician-supervised TRT with transparent cash-pay pricing in Novi, MI.",
    pathType: "consultation",
    pathLabel: "Provider review required",
    cta: "Buy now",
    icon: Heart,
    image: {
      src: "/images/mens-health-card.png",
      alt: "Athlete running outdoors as part of an active men's health lifestyle",
    },
  },
  {
    href: "/iv-rejuvenation",
    title: "Mobile IV Rejuvenation",
    description:
      "Pharmacy-formulated IV therapy with licensed RNs—Myers' Cocktail, NAD+, hydration, and more.",
    pathType: "consultation",
    pathLabel: "Provider review required",
    cta: "Buy IV therapy",
    icon: Syringe,
    image: {
      src: "/images/iv-rejuvenation-card.png",
      alt: "Pharmacist compounding IV therapy in a sterile pharmacy lab",
    },
  },
  {
    href: "/specialty-pharmacy",
    title: "Specialty Medications",
    description:
      "High-cost therapies with in-house prior authorization and manufacturer copay assistance support.",
    pathType: "insurance",
    pathLabel: "Insurance accepted",
    cta: "Transfer specialty care",
    icon: Stethoscope,
    image: {
      src: "/images/specialty-medicine-card.png",
      alt: "Pharmacist in gloves dispensing specialty medication capsules",
    },
  },
]

export function pathBadgeClass(type: ServicePathType): string {
  switch (type) {
    case "cash-pay":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
    case "consultation":
      return "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200"
    case "insurance":
      return "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200"
  }
}
