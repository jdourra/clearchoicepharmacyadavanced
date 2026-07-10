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
  title: "IV Rejuvenation | Metro Detroit & Michigan",
  description:
    "Premium mobile IV therapy across Metro Detroit and rejuvenation vials for Michigan patients. Myers' Cocktail, NAD+, hydration, and immunity drips—pharmacy-formulated in Novi, MI.",
  keywords: [
    "mobile IV therapy Metro Detroit",
    "IV hydration Novi MI",
    "Myers Cocktail IV Michigan",
    "NAD+ IV therapy Michigan",
    "mobile IV nurse Detroit",
    "IV rejuvenation Novi Michigan",
    "hangover IV therapy Metro Detroit",
    "immune boost IV Novi",
  ],
  alternates: {
    canonical: `${SITE_URL}/iv-rejuvenation`,
  },
  openGraph: {
    title: "Clear Choice IV & Rejuvenation | Metro Detroit Mobile IV",
    description:
      "Hospital-grade mobile IV therapy formulated by Clear Choice Pharmacy in Novi. Licensed RNs dispatched across Metro Detroit. Michigan patients only for vial homekits.",
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
