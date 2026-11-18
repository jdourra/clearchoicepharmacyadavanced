import type { Metadata } from "next"
import { buildFaqJsonLd, PRESCRIPTIONS_FAQS, SITE_URL } from "@/lib/clinical-seo"

export const metadata: Metadata = {
  title: "Low Cost Prescriptions in Westland, MI",
  description:
    "Most medications are about $5 for 30 days, including generic sildenafil and tadalafil. Order online or visit Clear Choice Pharmacy in Westland, Michigan.",
  keywords: [
    "low cost prescription drugs",
    "low cost prescriptions",
    "cash pay pharmacy",
    "pharmacy without insurance",
    "discount prescription drugs",
    "generic drugs",
    "prescription prices",
    "Westland pharmacy",
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
    title: "Low Cost Prescriptions in Westland, MI | Clear Choice Pharmacy",
    description:
      "Most medications are about $5 for 30 days, including generic sildenafil and tadalafil. Order online or visit Clear Choice Pharmacy in Westland, Michigan.",
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
