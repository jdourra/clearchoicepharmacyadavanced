import type { Metadata } from "next"
import { SITE_URL } from "@/lib/clinical-seo"

export const metadata: Metadata = {
  title: "Low-Cost Prescriptions",
  description:
    "Affordable cash-pay prescription medications in Novi, MI. Most common meds hover around $5 for a 30-day supply. Transparent pricing: Drug Cost + 15% + $5 dispensing fee. No insurance needed. Save up to 80% on generics.",
  keywords: [
    "low cost prescription drugs",
    "cheap prescription medications",
    "cash pay pharmacy",
    "affordable prescription drugs",
    "pharmacy without insurance",
    "discount prescription drugs",
    "Novi MI pharmacy",
  ],
  alternates: {
    canonical: `${SITE_URL}/prescriptions`,
  },
  openGraph: {
    title: "Low-Cost Prescriptions | Clear Choice Pharmacy",
    description:
      "Most common medications hover around $5. Transparent cash-pay pricing: Drug Cost + 15% + $5. Search 6,000+ medications instantly.",
    url: `${SITE_URL}/prescriptions`,
    type: "website",
  },
}

export default function PrescriptionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
