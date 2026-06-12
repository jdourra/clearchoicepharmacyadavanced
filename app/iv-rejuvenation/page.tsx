import type { Metadata } from "next"
import { IvRejuvenationPage } from "@/components/iv-rejuvenation-page"
import {
  SITE_URL,
  AREA_SERVED,
  PHARMACY_ADDRESS,
  PHARMACY_PHONE,
  IV_REJUVENATION_FAQS,
  buildFaqJsonLd,
} from "@/lib/clinical-seo"

export const metadata: Metadata = {
  title: "Clear Choice IV & Rejuvenation | Premium Mobile IV Therapy Metro Detroit",
  description:
    "Premium mobile IV therapy delivered to your door in Metro Detroit. Myers' Cocktail, NAD+, hydration, immunity drips, and symptom relief. Pharmacy-formulated, licensed RNs, upfront pricing.",
  keywords: [
    "mobile IV therapy Metro Detroit",
    "IV hydration Novi MI",
    "Myers Cocktail IV",
    "NAD+ IV therapy Michigan",
    "mobile IV nurse Detroit",
    "IV rejuvenation Novi",
    "hangover IV therapy",
    "immune boost IV",
  ],
  alternates: {
    canonical: `${SITE_URL}/iv-rejuvenation`,
  },
  openGraph: {
    title: "Clear Choice IV & Rejuvenation | Premium Mobile IV Therapy",
    description:
      "Hospital-grade mobile IV therapy formulated by Clear Choice Pharmacy. Licensed RNs dispatched across Metro Detroit.",
    url: `${SITE_URL}/iv-rejuvenation`,
    type: "website",
  },
}

export default function IvRejuvenationRoute() {
  const businessJsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: "Clear Choice IV & Rejuvenation",
    url: `${SITE_URL}/iv-rejuvenation`,
    description:
      "Premium mobile IV therapy and rejuvenation services formulated by Clear Choice Pharmacy. Licensed RN administration across Metro Detroit.",
    telephone: PHARMACY_PHONE,
    address: PHARMACY_ADDRESS,
    areaServed: AREA_SERVED,
    parentOrganization: {
      "@type": "Pharmacy",
      name: "Clear Choice Pharmacy",
    },
  }

  const jsonLd = [businessJsonLd, buildFaqJsonLd(IV_REJUVENATION_FAQS)]

  return (
    <>
      {jsonLd.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
      <IvRejuvenationPage />
    </>
  )
}
