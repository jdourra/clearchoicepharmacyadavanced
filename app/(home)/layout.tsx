import type { Metadata } from "next"
import { buildFaqJsonLd, HOME_DESCRIPTION, HOME_TITLE, SITE_URL } from "@/lib/clinical-seo"

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  keywords: [
    "pharmacy Novi MI",
    "Clear Choice Pharmacy",
    "low cost prescription drugs",
    "GLP-1 weight loss Novi",
    "ED medications Michigan",
    "TRT Novi MI",
    "mobile IV therapy Metro Detroit",
    "specialty pharmacy",
    "prior authorization pharmacy",
    "copay assistance programs",
    "cash pay pharmacy",
  ],
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
        alt: "Clear Choice Pharmacy — prescriptions, weight loss, IV therapy, and men's health in Novi, MI",
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
    question: "What services does Clear Choice Pharmacy offer?",
    answer:
      "Clear Choice Pharmacy in Novi, MI offers low-cost cash-pay prescriptions, GLP-1 medical weight loss, ED medications and TRT, mobile IV rejuvenation, rejuvenation vials, and specialty pharmacy care with prior authorization and copay assistance support.",
  },
  {
    question: "Does Clear Choice Pharmacy offer GLP-1 weight loss in Michigan?",
    answer:
      "Yes. Medical weight management with Semaglutide and Tirzepatide is available for qualifying patients in Novi and Metro Detroit with licensed provider review and transparent pricing.",
  },
  {
    question: "Does Clear Choice Pharmacy compound ED medications?",
    answer:
      "Yes. Custom sublingual ED troches with Sildenafil and Tadalafil are compounded in-house, plus physician-supervised TRT programs with transparent cash-pay pricing.",
  },
  {
    question: "Does Clear Choice Pharmacy offer mobile IV therapy?",
    answer:
      "Yes. Clear Choice IV & Rejuvenation delivers pharmacy-formulated mobile IV therapy across Metro Detroit with licensed RN administration.",
  },
  {
    question: "Does Clear Choice Pharmacy accept insurance for specialty medications?",
    answer:
      "Yes. All major insurance plans are accepted for specialty therapies, with an in-house Prior Authorization team and copay assistance programs.",
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
