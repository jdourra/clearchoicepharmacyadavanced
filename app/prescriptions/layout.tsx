import type { Metadata } from "next"
import { buildFaqJsonLd, PRESCRIPTIONS_FAQS, SITE_URL } from "@/lib/clinical-seo"

export const metadata: Metadata = {
  title: "Low-Cost Prescriptions for Michigan Patients | Novi, MI",
  description:
    "Affordable cash-pay prescriptions for Michigan patients. Clear Choice Pharmacy in Novi, MI — most common meds around $5 for 30 days. Transparent pricing: Drug Cost + 15% + $5. Michigan fill & ship only.",
  keywords: [
    "low cost prescriptions Michigan",
    "cheap prescription medications Novi MI",
    "cash pay pharmacy Michigan",
    "affordable prescription drugs Metro Detroit",
    "pharmacy without insurance Michigan",
    "discount prescription drugs Novi",
    "Michigan patients only pharmacy",
    "Novi MI pharmacy",
  ],
  alternates: {
    canonical: `${SITE_URL}/prescriptions`,
  },
  openGraph: {
    title: "Low-Cost Prescriptions | Michigan | Clear Choice Pharmacy",
    description:
      "Cash-pay prescriptions for Michigan patients. Most common meds around $5. Transparent pricing: Drug Cost + 15% + $5. Pickup in Novi or Michigan delivery.",
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
