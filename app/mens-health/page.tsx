import type { Metadata } from "next"
import {
  BenefitList,
  ClinicalLandingShell,
  ContentSection,
  FaqSection,
  PremiumCta,
  PremiumDisclaimer,
  PremiumHero,
  ProcessSteps,
  SectionIntro,
  TrustRibbon,
} from "@/components/clinical-landing-shell"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://clearchoicepharmacy.com"
const CONSULTATION_URL = "/mens-health/start"

export const metadata: Metadata = {
  title: "Men's Health & Custom ED Compounding | Clear Choice Pharmacy",
  description:
    "Discover custom sublingual ED troches at Clear Choice Pharmacy in Novi, MI. Faster than regular pills, unaffected by food. Start your private consultation online.",
  keywords: [
    "ED troches Novi MI",
    "compounding pharmacy Metro Detroit",
    "Sildenafil sublingual",
    "Tadalafil combination",
    "sublingual ED troches Michigan",
    "erectile dysfunction compounding Novi",
    "custom ED lozenges",
    "men's health pharmacy Novi MI",
  ],
  alternates: {
    canonical: `${SITE_URL}/mens-health`,
  },
  openGraph: {
    title: "Men's Health & Custom ED Compounding | Clear Choice Pharmacy",
    description:
      "Discover custom sublingual ED troches at Clear Choice Pharmacy in Novi, MI. Faster than regular pills, unaffected by food. Start your private consultation online.",
    url: `${SITE_URL}/mens-health`,
    type: "website",
  },
}

const trocheBenefits = [
  "Rapid Absorption: Active ingredients (Sildenafil or Tadalafil) absorb directly through the oral mucosa, entering the bloodstream to work in half the time of standard pills.",
  "Zero Food Interference: Because it bypasses your gastrointestinal tract entirely, a sublingual troche is completely unaffected by what you eat—restoring date-night spontaneity.",
  "Custom Formulations: We craft tailored strengths and dual-action combination options (mixing Sildenafil and Tadalafil into a single lozenge) that you cannot find at regular retail chains.",
]

export default function MensHealthPage() {
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: "Men's Health & Custom ED Compounding | Clear Choice Pharmacy",
    url: `${SITE_URL}/mens-health`,
    description:
      "Custom sublingual ED troches compounded at Clear Choice Pharmacy in Novi, MI. Sildenafil and Tadalafil sublingual formulations.",
    about: [{ "@type": "MedicalTherapy", name: "Sublingual ED Troches" }],
    provider: {
      "@type": "Pharmacy",
      name: "Clear Choice Pharmacy",
      telephone: "+1-248-987-6182",
      address: {
        "@type": "PostalAddress",
        streetAddress: "40890 Grand River Ave",
        addressLocality: "Novi",
        addressRegion: "MI",
        postalCode: "48375",
        addressCountry: "US",
      },
    },
  }

  return (
    <ClinicalLandingShell jsonLd={pageJsonLd}>
      <PremiumHero
        badge="Clear Choice Men's Health"
        headline="Custom Compounded ED Troches in Novi, MI"
        subheadline="Sublingual formulations that work faster than standard pills—unaffected by food."
        description="Traditional mass-manufactured tablets aren't always the right fit. Our licensed compounding pharmacy delivers tailored Sildenafil and Tadalafil troches with transparent pricing and discreet, private consultations."
        highlight="🔒 Private online consultation · Pharmacy-formulated · Discreet delivery"
        primaryCta={{
          label: "Start Your Private Online Consultation",
          href: CONSULTATION_URL,
        }}
        secondaryCta={{ label: "Learn How Troches Work", href: "#benefits", scrollTo: "#benefits" }}
      />

      <TrustRibbon
        items={[
          {
            icon: "flask-conical",
            title: "Pharmacy Compounded",
            description: "Custom troches prepared by licensed pharmacists",
          },
          {
            icon: "sparkles",
            title: "Faster Than Pills",
            description: "Sublingual absorption bypasses the digestive tract",
          },
          {
            icon: "lock",
            title: "Private & Discreet",
            description: "Confidential consultations and direct delivery",
          },
          {
            icon: "shield",
            title: "Transparent Pricing",
            description: "Clear Choice cash-pay model—no hidden fees",
          },
        ]}
      />

      <ContentSection id="benefits">
        <SectionIntro
          eyebrow="Sublingual ED Troches"
          title="Faster, More Effective Than Regular Pills"
          description="If you struggle with performance anxiety or erectile dysfunction, swallowed pills come with planning burdens, digestive side effects, and food interference. Our expert compounding facility formulates specialized lozenges designed to melt gradually under your tongue."
        />
        <BenefitList items={trocheBenefits} />
      </ContentSection>

      <ProcessSteps
        title="How It Works"
        subtitle="From consultation to compounded troches at your door"
        steps={[
          {
            step: 1,
            title: "Start Your Consultation",
            description: "Complete a private online health review to determine if sublingual ED therapy is right for you.",
          },
          {
            step: 2,
            title: "Physician Approval",
            description: "A licensed provider reviews your history and approves a customized Sildenafil or Tadalafil protocol.",
          },
          {
            step: 3,
            title: "Pharmacy Compounding",
            description: "Clear Choice Pharmacy compounds your troches and ships discreetly—or prepares them for pickup in Novi.",
          },
        ]}
      />

      <FaqSection
        title="Frequently Asked Questions"
        subtitle="Common questions about custom ED troches"
        items={[
          {
            question: "Why choose sublingual troches over regular ED pills?",
            answer:
              "Troches absorb through the oral mucosa, often working in half the time of swallowed tablets. Because they bypass the digestive tract, they are not affected by food or heavy meals.",
          },
          {
            question: "Can you combine Sildenafil and Tadalafil?",
            answer:
              "Yes. Our compounding pharmacy can create dual-action combination troches with tailored strengths that are not available at retail chains.",
          },
          {
            question: "Is the consultation private?",
            answer:
              "Absolutely. The online consultation is confidential, and your medication is prepared and delivered discreetly through Clear Choice Pharmacy.",
          },
        ]}
      />

      <PremiumDisclaimer>
        Compounded medications are prepared pursuant to a patient-specific prescription. Consultation and clinical
        evaluation are required. Individual results may vary.
      </PremiumDisclaimer>

      <PremiumCta
        icon="heart"
        title="Ready to Get Started?"
        description="Start your private online consultation for custom sublingual ED troches—discreet, fast-acting, and tailored to you."
        primaryCta={{
          label: "Start Your Private Online Consultation",
          href: CONSULTATION_URL,
        }}
      />
    </ClinicalLandingShell>
  )
}
