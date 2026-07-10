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
        alt: "Clear Choice Pharmacy — Michigan prescriptions, weight loss, IV therapy, and men's health in Novi, MI",
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
    question: "Who can use Clear Choice Pharmacy?",
    answer:
      "Clear Choice Pharmacy currently serves Michigan patients only. We fill and ship prescriptions within Michigan, offer clinical services for eligible Michigan residents, and provide mobile IV therapy across Metro Detroit.",
  },
  {
    question: "What services does Clear Choice Pharmacy offer for Michigan patients?",
    answer:
      "Clear Choice Pharmacy in Novi, MI offers low-cost cash-pay prescriptions, GLP-1 medical weight loss, ED medications and TRT, mobile IV rejuvenation across Metro Detroit, rejuvenation vials, and specialty pharmacy care with prior authorization and copay assistance support.",
  },
  {
    question: "Does Clear Choice Pharmacy offer GLP-1 weight loss in Michigan?",
    answer:
      "Yes. Medical weight management with Semaglutide and Tirzepatide is available for qualifying Michigan patients in Novi and Metro Detroit with licensed provider review and transparent pricing.",
  },
  {
    question: "Does Clear Choice Pharmacy compound ED medications for Michigan patients?",
    answer:
      "Yes. Custom sublingual ED troches with Sildenafil and Tadalafil are compounded in-house for Michigan patients, plus physician-supervised TRT programs with transparent cash-pay pricing.",
  },
  {
    question: "Does Clear Choice Pharmacy offer mobile IV therapy in Metro Detroit?",
    answer:
      "Yes. Clear Choice IV & Rejuvenation delivers pharmacy-formulated mobile IV therapy across Metro Detroit with licensed RN administration. Rejuvenation vial homekits are available to Michigan patients after physician approval.",
  },
  {
    question: "Does Clear Choice Pharmacy accept insurance for specialty medications?",
    answer:
      "Yes. All major insurance plans are accepted for specialty therapies for Michigan patients, with an in-house Prior Authorization team and copay assistance programs.",
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
