import type { Metadata } from "next"
import { buildFaqJsonLd, PRESCRIPTIONS_FAQS, SITE_URL } from "@/lib/clinical-seo"

export const metadata: Metadata = {
  title: "Low Cost Prescription Drugs | Sildenafil, Tadalafil & Cash-Pay Pricing",
  description:
    "Low cost prescription drugs with transparent cash-pay pricing. Generic Sildenafil (Viagra) and Tadalafil (Cialis) tablets plus everyday meds around $5. Formula: Drug Cost + 15% + $5. Clear Choice Pharmacy, Novi, MI.",
  keywords: [
    "low cost prescription drugs",
    "low cost prescriptions",
    "cash pay pharmacy",
    "pharmacy without insurance",
    "discount prescription drugs",
    "generic drugs",
    "prescription prices",
    "Novi pharmacy",
    "Michigan pharmacy",
    "transparent pharmacy pricing",
    "low cost tadalafil",
    "low cost sildenafil",
    "low cost cialis",
    "generic cialis",
    "generic viagra",
  ],
  alternates: {
    canonical: `${SITE_URL}/prescriptions`,
  },
  openGraph: {
    title: "Low Cost Prescription Drugs | Cash-Pay Pricing | Clear Choice Pharmacy",
    description:
      "Most common meds around $5. Cash-pay generic Sildenafil and Tadalafil tablets. Formula: Drug Cost + 15% + $5.",
    url: `${SITE_URL}/prescriptions`,
    type: "website",
  },
}

const prescriptionsFaqJsonLd = buildFaqJsonLd(PRESCRIPTIONS_FAQS)

export default function PrescriptionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(prescriptionsFaqJsonLd) }}
      />
      {children}
    </>
  )
}
