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
        alt: "Clear Choice Pharmacy — Semaglutide, Sildenafil, Tadalafil, TRT, and low cost prescription drugs in Novi, MI",
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
    question: "Does Clear Choice Pharmacy offer Semaglutide and Tirzepatide?",
    answer:
      "Yes. Physician-supervised medical weight loss with compounded Semaglutide and Tirzepatide (GLP-1) is available for qualifying Michigan patients with transparent cash-pay pricing.",
  },
  {
    question: "Do you offer Tadalafil, Sildenafil, and TRT?",
    answer:
      "Yes. We compound Tadalafil and Sildenafil ED troches and offer physician-supervised testosterone replacement therapy (TRT) with transparent cash-pay pricing.",
  },
  {
    question: "What services does Clear Choice Pharmacy offer?",
    answer:
      "Low cost prescription drugs, Semaglutide and Tirzepatide weight loss, Tadalafil and Sildenafil ED medications, TRT, mobile IV therapy (Myers' Cocktail, NAD+), and specialty pharmacy with prior authorization support—from our Novi, MI pharmacy.",
  },
  {
    question: "Do you offer mobile IV therapy?",
    answer:
      "Yes. Clear Choice IV & Rejuvenation delivers pharmacy-formulated mobile IV therapy across Metro Detroit with licensed RN administration.",
  },
  {
    question: "Do you accept insurance for specialty medications?",
    answer:
      "Yes. All major insurance plans are accepted for specialty therapies, with an in-house Prior Authorization team and copay assistance programs.",
  },
  {
    question: "Who can use Clear Choice Pharmacy?",
    answer:
      "Clear Choice Pharmacy currently serves Michigan patients only for dispensing and clinical programs. Mobile IV serves Metro Detroit.",
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
