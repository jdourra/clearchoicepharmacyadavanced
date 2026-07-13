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
  title: "Mobile IV Therapy | Myers Cocktail, NAD+ & Hydration",
  description:
    "Mobile IV therapy in Metro Detroit: Myers' Cocktail, NAD+ IV, hydration, immunity, and hangover drips. Pharmacy-formulated at Clear Choice Pharmacy in Novi. Licensed RNs.",
  keywords: [
    "mobile IV therapy",
    "IV therapy near me",
    "Myers Cocktail",
    "NAD IV",
    "NAD+ IV therapy",
    "IV hydration",
    "hangover IV",
    "immune boost IV",
    "mobile IV Metro Detroit",
    "IV therapy Novi",
  ],
  alternates: {
    canonical: `${SITE_URL}/iv-rejuvenation`,
  },
  openGraph: {
    title: "Mobile IV Therapy | Myers Cocktail & NAD+ | Clear Choice Pharmacy",
    description:
      "Hospital-grade mobile IV therapy across Metro Detroit. Myers' Cocktail, NAD+, hydration, and more—formulated in Novi, MI.",
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
