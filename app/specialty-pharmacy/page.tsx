import type { Metadata } from "next"
import {
  ClinicalLandingShell,
  ContentSection,
  FaqSection,
  FeatureGrid,
  PremiumCta,
  PremiumDisclaimer,
  PremiumHero,
  ProcessSteps,
  SectionIntro,
  TrustRibbon,
} from "@/components/clinical-landing-shell"
import { SITE_URL, AREA_SERVED, PHARMACY_ADDRESS, PHARMACY_PHONE } from "@/lib/clinical-seo"


export const metadata: Metadata = {
  title: "Specialty Pharmacy Care | All Insurances Accepted - Prior Auth & Copay Support",
  description:
    "Clear Choice Pharmacy simplifies specialty medications. All major insurance accepted. In-house Prior Authorization team expedites clinical approvals. Copay assistance programs can lower out-of-pocket costs to as low as $0. Transfer your specialty care to Novi, MI.",
  keywords: [
    "specialty pharmacy",
    "specialty medications",
    "high-cost prescription medications",
    "prior authorization pharmacy",
    "copay assistance programs",
    "specialty pharmacy insurance accepted",
    "transfer specialty pharmacy",
    "clinical prior authorization",
    "manufacturer copay cards",
    "specialty drug pharmacy Michigan",
    "Novi MI specialty pharmacy",
  ],
  alternates: {
    canonical: `${SITE_URL}/specialty-pharmacy`,
  },
  openGraph: {
    title: "Specialized Pharmacy Care. All Insurances Accepted.",
    description:
      "Expedited in-house Prior Authorizations & copay support for specialty medications. Transfer your specialty care to Clear Choice Pharmacy.",
    url: `${SITE_URL}/specialty-pharmacy`,
    type: "website",
  },
}

export default function SpecialtyPharmacyPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Does Clear Choice Pharmacy accept insurance for specialty medications?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Clear Choice Pharmacy accepts all major insurance plans for specialty medications. Our team works directly with your doctor and insurer to streamline approvals and reduce your out-of-pocket costs.",
        },
      },
      {
        "@type": "Question",
        name: "How does Clear Choice Pharmacy handle Prior Authorizations for specialty drugs?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We utilize an advanced, in-house Prior Authorization (PA) team to expedite clinical approvals directly with your physician. This speeds up access to high-cost and specialty therapies without the usual insurance delays.",
        },
      },
      {
        "@type": "Question",
        name: "Can Clear Choice Pharmacy help lower copay costs on specialty medications?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. If your medication has a steep deductible or high copay, our clinical advocates connect you with manufacturer copay assistance programs that can reduce your out-of-pocket costs to as low as $0.",
        },
      },
      {
        "@type": "Question",
        name: "How do I transfer my specialty prescriptions to Clear Choice Pharmacy?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Call us at (248) 987-6182 or visit our Novi, MI location. We coordinate with your doctor and current pharmacy to transfer your specialty care and begin the prior authorization and copay support process from day one.",
        },
      },
    ],
  }

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: "Clear Choice Pharmacy - Specialty Pharmacy Services",
    url: `${SITE_URL}/specialty-pharmacy`,
    telephone: PHARMACY_PHONE,
    address: PHARMACY_ADDRESS,
    areaServed: AREA_SERVED,
    description:
      "Specialty pharmacy care with all major insurances accepted, expedited in-house prior authorizations, and manufacturer copay assistance support.",
    medicalSpecialty: "Pharmacy",
  }

  return (
    <ClinicalLandingShell jsonLd={[faqJsonLd, serviceJsonLd]}>
      <PremiumHero
        badge="Clear Choice Specialty Pharmacy"
        headline="Specialized Pharmacy Care. All Insurances Accepted."
        subheadline="Expedited in-house Prior Authorizations & copay assistance navigation."
        description="Getting your specialty medications shouldn't mean fighting with your insurance company or facing massive out-of-pocket costs. We accept all major insurance plans and handle the heavy lifting for you and your doctor."
        highlight="✓ In-house PA team · Copay assistance · All major insurances accepted"
        primaryCta={{ label: "Call to Transfer Care", href: "tel:248-987-6182" }}
        secondaryCta={{ label: "Browse Medications", href: "/medications" }}
      />

      <TrustRibbon
        items={[
          {
            icon: "shield",
            title: "All Major Insurances",
            description: "Specialty therapies billed through your insurance plan",
          },
          {
            icon: "file-check",
            title: "In-House Prior Auth",
            description: "Clinical team expedites approvals with your physician",
          },
          {
            icon: "heart-handshake",
            title: "Copay Assistance",
            description: "Manufacturer programs to reduce out-of-pocket costs",
          },
          {
            icon: "dollar-sign",
            title: "Cost Navigation",
            description: "Advocates work to lower your cost to as low as $0",
          },
        ]}
      />

      <ContentSection>
        <SectionIntro
          eyebrow="Specialty Support"
          title="How We Support Specialty Patients"
          description="We accept all major insurance plans and utilize an advanced, in-house Prior Authorization team to expedite clinical approvals directly with your doctor. If your medication has a steep deductible, our clinical advocates connect you with manufacturer copay assistance programs."
        />
        <FeatureGrid
          items={[
            {
              icon: "shield",
              title: "All Major Insurances Accepted",
              description:
                "We bill all major insurance plans for specialty and high-cost therapies—you are not limited to cash-pay options alone.",
            },
            {
              icon: "file-check",
              title: "Expedited Prior Authorizations",
              description:
                "Our in-house PA team works directly with your physician to speed up clinical approvals and reduce delays.",
            },
            {
              icon: "heart-handshake",
              title: "Copay Assistance Support",
              description:
                "Clinical advocates help enroll you in manufacturer copay programs that can lower your cost to as low as $0.",
            },
          ]}
        />
      </ContentSection>

      <ProcessSteps
        title="How It Works"
        subtitle="Transfer your specialty care in three straightforward steps"
        steps={[
          {
            step: 1,
            title: "Contact Our Team",
            description: "Call (248) 987-6182 or visit our Novi location to begin your specialty transfer.",
          },
          {
            step: 2,
            title: "Prior Authorization",
            description: "Our in-house PA team coordinates clinical approvals directly with your doctor and insurer.",
          },
          {
            step: 3,
            title: "Fulfillment & Support",
            description: "We fulfill your specialty prescription and navigate copay assistance on your behalf.",
          },
        ]}
      />

      <FaqSection
        title="Frequently Asked Questions"
        subtitle="Common questions about specialty pharmacy care"
        items={[
          {
            question: "Does Clear Choice Pharmacy accept insurance for specialty medications?",
            answer:
              "Yes. We accept all major insurance plans and coordinate benefits, prior authorizations, and fulfillment for specialty therapies.",
          },
          {
            question: "What is an in-house Prior Authorization team?",
            answer:
              "Our clinical team handles prior authorization paperwork and follow-up directly with your doctor and insurer, so approvals move faster than typical retail pharmacy workflows.",
          },
          {
            question: "Can you help with high deductibles and copays?",
            answer:
              "Yes. When eligible, we connect patients with manufacturer copay assistance and foundation support programs to reduce out-of-pocket costs.",
          },
          {
            question: "How do I transfer my specialty prescriptions?",
            answer:
              "Call (248) 987-6182 or visit us at 40890 Grand River Ave, Novi, MI 48375. We will coordinate the transfer and start PA and copay support right away.",
          },
        ]}
      />

      <PremiumDisclaimer>
        Copay assistance programs are subject to manufacturer eligibility requirements and are applicable only to patients
        with commercial health insurance. Patients with Medicare, Medicaid, or other government-funded plans are not
        eligible for manufacturer copay cards but may be screened for independent charitable foundation grants.
      </PremiumDisclaimer>

      <PremiumCta
        icon="phone"
        title="Ready to Transfer Your Specialty Care?"
        description="Get your specialty prescriptions filled without the insurance stress. Our team is ready to help today."
        primaryCta={{ label: "Call (248) 987-6182", href: "tel:248-987-6182" }}
        secondaryCta={{ label: "Browse Medications", href: "/medications" }}
      />
    </ClinicalLandingShell>
  )
}
