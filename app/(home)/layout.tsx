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
        alt: "Clear Choice Pharmacy — Semaglutide and Tirzepatide weight loss pharmacy care in Michigan",
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
    question: "Do you offer Semaglutide and Tirzepatide weight loss in Michigan?",
    answer:
      "Yes. Clear Choice Pharmacy offers provider-guided weight management with compounded Semaglutide and Tirzepatide for qualifying Michigan patients after clinician review. Individual results may vary.",
  },
  {
    question: "Is compounded Semaglutide the same as Ozempic?",
    answer:
      "No. Ozempic and Wegovy are FDA-approved brand products that contain Semaglutide. We compound Semaglutide pursuant to a patient-specific prescription when a clinician determines it is appropriate. We do not dispense brand-name Ozempic or Wegovy through this program.",
  },
  {
    question: "Who evaluates and who fills the medication?",
    answer:
      "A licensed clinician reviews your intake and decides whether a prescription is appropriate. Clear Choice Pharmacy compounds and fulfills approved prescriptions for Michigan patients.",
  },
  {
    question: "How do Semaglutide and Tirzepatide kits work?",
    answer:
      "After clinician approval, Clear Choice Pharmacy compounds a patient-specific kit with transparent cash-pay pricing. Review dosing, inclusions, and starter options on each program page.",
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
