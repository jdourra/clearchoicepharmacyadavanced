import type { Metadata } from "next"
import { buildFaqJsonLd, HOME_DESCRIPTION, HOME_TITLE, SITE_KEYWORDS, SITE_URL } from "@/lib/clinical-seo"

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  keywords: [...SITE_KEYWORDS],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: SITE_URL,
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Clear Choice Pharmacy — Sildenafil and Tadalafil ED medication in Michigan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: ["/og-image.jpg"],
  },
}

const homeFaqJsonLd = buildFaqJsonLd([
  {
    question: "Do you offer Sildenafil and Tadalafil ED medication in Michigan?",
    answer:
      "Yes. Clear Choice Pharmacy offers provider-reviewed Sildenafil, Tadalafil, and combination ED troches for qualifying Michigan patients after clinician review. Individual results may vary.",
  },
  {
    question: "Is Tadalafil the same as Cialis?",
    answer:
      "Tadalafil is the active ingredient in brand-name Cialis. Clear Choice Pharmacy compounds Tadalafil troches pursuant to a patient-specific prescription. We do not sell brand-name Cialis through this program.",
  },
  {
    question: "Is Sildenafil the same as Viagra?",
    answer:
      "Sildenafil is the active ingredient in brand-name Viagra. Our ED program compounds Sildenafil sublingual troches for qualifying patients after clinician review.",
  },
  {
    question: "How do ED troches work?",
    answer:
      "Troches dissolve under the tongue so medication can absorb through the oral mucosa. This can support faster onset than swallowed tablets and helps avoid food-related delays.",
  },
])

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqJsonLd) }}
      />
      {children}
    </>
  )
}
