import type { Metadata } from "next"
import { buildFaqJsonLd, HOME_DESCRIPTION, HOME_TITLE, SITE_KEYWORDS, SITE_URL } from "@/lib/clinical-seo"
import { weightLossHowYouPay } from "@/lib/weight-loss-catalog"

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
      `Yes. ${weightLossHowYouPay()} A licensed doctor reviews the intake. If treatment is approved, a licensed partner pharmacy fills and ships compounded semaglutide or tirzepatide. Clear Choice Pharmacy does not compound or ship these vials. Individual results may vary.`,
  },
  {
    question: "Is compounded Semaglutide the same as Ozempic?",
    answer:
      "No. Ozempic and Wegovy are FDA-approved brand products that contain Semaglutide. We compound Semaglutide pursuant to a patient-specific prescription when a clinician determines it is appropriate. We do not dispense brand-name Ozempic or Wegovy through this program.",
  },
  {
    question: "Who evaluates and who fills the medication?",
    answer:
      "A licensed doctor reviews your intake and decides whether a prescription is appropriate. A licensed partner pharmacy compounds and ships approved semaglutide or tirzepatide. Clear Choice Pharmacy does not dispense the vial.",
  },
  {
    question: "How do Semaglutide and Tirzepatide kits work?",
    answer:
      `After a doctor approves treatment, a licensed partner pharmacy prepares a patient-specific kit and ships it. ${weightLossHowYouPay()}`,
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
