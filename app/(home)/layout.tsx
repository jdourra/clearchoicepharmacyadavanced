import type { Metadata } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://clearchoicepharmacy.com"

export const metadata: Metadata = {
  title: "Clear Choice Pharmacy | Affordable Prescriptions & Specialty Pharmacy Care in Novi, MI",
  description:
    "Clear Choice Pharmacy in Novi, MI offers affordable cash-pay prescriptions and specialized pharmacy care. All major insurances accepted for specialty medications. In-house Prior Authorization team and copay assistance support. Save up to 80% on generics or transfer your specialty care today.",
  keywords: [
    "specialty pharmacy",
    "specialty medications",
    "prior authorization pharmacy",
    "copay assistance programs",
    "all insurances accepted pharmacy",
    "cheap prescription medications",
    "affordable prescription drugs",
    "cash pay pharmacy",
    "Novi MI pharmacy",
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "Clear Choice Pharmacy | Affordable Prescriptions & Specialty Pharmacy Care",
    description:
      "Cash-pay savings on generics plus specialized pharmacy care with expedited prior authorizations and copay support. All major insurances accepted.",
    url: SITE_URL,
    type: "website",
  },
}

const specialtyFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Does Clear Choice Pharmacy accept insurance for specialty medications?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Clear Choice Pharmacy accepts all major insurance plans for specialty and high-cost medications, with an in-house Prior Authorization team and copay assistance support.",
      },
    },
    {
      "@type": "Question",
      name: "What specialty pharmacy services does Clear Choice Pharmacy offer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Clear Choice Pharmacy offers expedited in-house prior authorizations, manufacturer copay assistance enrollment, and fulfillment for specialty therapies in Novi, Michigan.",
      },
    },
    {
      "@type": "Question",
      name: "How do I transfer my specialty prescriptions to Clear Choice Pharmacy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Call (248) 987-6182 or visit 40890 Grand River Ave, Novi, MI 48375. The pharmacy coordinates with your doctor and current pharmacy to transfer specialty care.",
      },
    },
  ],
}

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(specialtyFaqJsonLd) }}
      />
      {children}
    </>
  )
}
