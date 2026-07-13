import type { LucideIcon } from "lucide-react"
import { Heart, Pill, Scale, Stethoscope, Syringe } from "lucide-react"

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
    href: "/prescriptions",
    title: "Low Cost Prescription Drugs",
    description:
      "Most common medications hover around $5 for a 30-day supply. Drug Cost + 15% + $5 dispensing fee—no insurance required.",
    pathType: "cash-pay",
    pathLabel: "Cash pay",
    cta: "Look up prices",
    icon: Pill,
    image: {
      src: "/images/low-cost-prescriptions-card.png",
      alt: "Prescription bottle with pills next to a five dollar bill — most meds cost around $5",
    },
  },
  {
    href: "/weight-loss",
    title: "Semaglutide & Tirzepatide Weight Loss",
    description:
      "Medical weight loss with Semaglutide and Tirzepatide (GLP-1) injections. Transparent cash-pay pricing.",
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
    title: "Tadalafil, Sildenafil & TRT",
    description:
      "ED medications with Tadalafil and Sildenafil troches, plus physician-supervised testosterone therapy.",
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
    title: "Mobile IV Therapy",
    description:
      "Myers' Cocktail, NAD+ IV, hydration, and more—licensed RNs across Metro Detroit.",
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
    title: "Specialty Pharmacy",
    description:
      "High-cost specialty medications with prior authorization and copay assistance. Insurance accepted.",
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
