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
        alt: "Clear Choice Pharmacy — Semaglutide and Tirzepatide weight loss in every U.S. state",
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
    question: "Do you offer Semaglutide and Tirzepatide in every state?",
    answer:
      `Yes. Patients in every U.S. state can start an intake. ${weightLossHowYouPay()} Ola Health reviews it. RxAve routes an approved prescription to a licensed compounding pharmacy, which dispenses and ships an approved kit. Clear Choice Pharmacy does not compound or ship these vials. A few states require a live video visit.`,
  },
  {
    question: "Is compounded Semaglutide the same as Ozempic?",
    answer:
      "No. Ozempic and Wegovy are FDA-approved brand products that contain Semaglutide. Ola Health reviews the intake. If treatment is approved, RxAve routes the prescription to a licensed compounding pharmacy, which dispenses compounded semaglutide pursuant to a patient-specific prescription. Clear Choice Pharmacy does not compound or dispense compounded medication and does not dispense brand-name Ozempic or Wegovy.",
  },
  {
    question: "Who evaluates and who fills the medication?",
    answer:
      "A licensed doctor reviews your intake and decides whether a prescription is appropriate. RxAve routes an approved prescription to a licensed compounding pharmacy, which dispenses and ships approved semaglutide or tirzepatide. Clear Choice Pharmacy does not dispense the vial.",
  },
  {
    question: "How do Semaglutide and Tirzepatide kits work?",
    answer:
      `After a doctor approves treatment, RxAve routes the approved prescription to a licensed compounding pharmacy, which prepares and ships the kit. ${weightLossHowYouPay()}`,
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
