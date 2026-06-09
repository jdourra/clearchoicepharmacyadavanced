import type { Metadata } from "next"
import {
  BenefitList,
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://clearchoicepharmacy.com"
const CONSULTATION_URL = "/weight-loss/start"

export const metadata: Metadata = {
  title: "Medical Weight Loss & GLP Therapy | Clear Choice Pharmacy",
  description:
    "Semaglutide and Tirzepatide medical weight management in Novi, MI. Custom GLP-1 formulations with transparent pricing. Start your weight loss consultation online.",
  keywords: [
    "medical weight loss Novi",
    "GLP-1 weight loss Michigan",
    "Semaglutide Novi MI",
    "Tirzepatide Metro Detroit",
    "compounded weight loss pharmacy",
    "GLP weight management Novi",
    "medical weight management Michigan",
    "weight loss clinic Novi MI",
  ],
  alternates: {
    canonical: `${SITE_URL}/weight-loss`,
  },
  openGraph: {
    title: "Medical Weight Loss & GLP Therapy | Clear Choice Pharmacy",
    description:
      "Semaglutide and Tirzepatide medical weight management in Novi, MI. Custom GLP-1 formulations with transparent pricing.",
    url: `${SITE_URL}/weight-loss`,
    type: "website",
  },
}

const glpBenefits = [
  "Custom Titration: Semaglutide and Tirzepatide formulations compounded to match your specific titration schedule and clinical goals.",
  "Transparent Pricing: Bypass insurance restrictions and access high-quality metabolic therapies with clear, upfront cash-pay pricing.",
  "Licensed Provider Review: Complete a secure online intake reviewed by a licensed clinician before compounding.",
  "Long-Term Metabolic Support: Structured medical weight management designed for sustainable results—not quick-fix retail programs.",
]

export default function WeightLossPage() {
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: "Medical Weight Loss & GLP Therapy | Clear Choice Pharmacy",
    url: `${SITE_URL}/weight-loss`,
    description:
      "Medical weight management with Semaglutide and Tirzepatide GLP therapies at Clear Choice Pharmacy in Novi, MI.",
    about: [
      { "@type": "MedicalTherapy", name: "Semaglutide Weight Management" },
      { "@type": "MedicalTherapy", name: "Tirzepatide Weight Management" },
    ],
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
        badge="Clear Choice Weight Management"
        headline="Medical Weight Loss & GLP Therapy in Novi, MI"
        subheadline="Semaglutide and Tirzepatide programs with transparent, upfront pricing."
        description="Achieving long-term metabolic health requires premium clinical tools. Clear Choice Pharmacy compounds customized GLP-1 formulations designed to match your specific titration schedule—without insurance opacity or PBM middlemen."
        highlight="📊 Custom titration · Pharmacy-compounded · Licensed provider review"
        primaryCta={{
          label: "Start Your Weight Loss Consultation",
          href: CONSULTATION_URL,
        }}
        secondaryCta={{ label: "Explore GLP Benefits", href: "#benefits", scrollTo: "#benefits" }}
      />

      <TrustRibbon
        items={[
          {
            icon: "flask-conical",
            title: "Pharmacy Compounded",
            description: "Semaglutide & Tirzepatide prepared to your protocol",
          },
          {
            icon: "activity",
            title: "Clinical Oversight",
            description: "Licensed provider review and structured titration support",
          },
          {
            icon: "sparkles",
            title: "Custom Titration",
            description: "Formulations matched to your treatment schedule",
          },
          {
            icon: "shield",
            title: "Transparent Pricing",
            description: "Upfront cash-pay pricing with no hidden fees",
          },
        ]}
      />

      <ContentSection id="benefits">
        <SectionIntro
          eyebrow="GLP-1 Weight Loss"
          title="Semaglutide & Tirzepatide Medical Programs"
          description="Complete a secure online intake and access transparently priced GLP-1 programs through Clear Choice Pharmacy."
        />
        <BenefitList items={glpBenefits} />
      </ContentSection>

      <ContentSection tone="muted">
        <SectionIntro
          eyebrow="Why Clear Choice"
          title="Premium Clinical Tools for Lasting Results"
          description="We pair specialized compounding expertise with a transparent pricing model—giving you access to medical weight management without retail or PBM-driven opacity."
        />
        <FeatureGrid
          items={[
            {
              icon: "scale",
              title: "Semaglutide Programs",
              description: "Custom-compounded GLP-1 therapy tailored to your prescriber's titration protocol.",
            },
            {
              icon: "activity",
              title: "Tirzepatide Programs",
              description: "Dual-action metabolic support for patients requiring advanced GLP/GIP therapy.",
            },
            {
              icon: "shield",
              title: "Transparent Cash Pay",
              description: "Know exactly what you pay—no insurance surprises or hidden dispensing fees.",
            },
          ]}
        />
      </ContentSection>

      <ProcessSteps
        title="How It Works"
        subtitle="Three steps to start your medical weight loss journey"
        steps={[
          {
            step: 1,
            title: "Consultation & Screening",
            description: "Complete a digital health review to determine eligibility for GLP-1 medical weight management.",
          },
          {
            step: 2,
            title: "Personalized Protocol",
            description: "Your provider establishes a Semaglutide or Tirzepatide titration plan matched to your goals.",
          },
          {
            step: 3,
            title: "Pharmacy Fulfillment",
            description: "Clear Choice Pharmacy compounds and fulfills your GLP therapy with ongoing clinical support.",
          },
        ]}
      />

      <FaqSection
        title="Frequently Asked Questions"
        subtitle="What to know before starting GLP-1 therapy"
        items={[
          {
            question: "What is the difference between Semaglutide and Tirzepatide?",
            answer:
              "Semaglutide is a GLP-1 receptor agonist, while Tirzepatide activates both GLP-1 and GIP pathways. Your provider will recommend the option best suited to your clinical profile and goals.",
          },
          {
            question: "Do I need a prescription?",
            answer:
              "Yes. GLP-1 therapies require a valid prescription and clinical evaluation. Complete our online intake to begin the provider review process.",
          },
          {
            question: "Is pricing transparent?",
            answer:
              "Yes. Clear Choice Pharmacy offers upfront cash-pay pricing on compounded GLP formulations—no insurance middlemen or hidden fees.",
          },
        ]}
      />

      <PremiumDisclaimer>
        GLP-1 therapies require a valid prescription and clinical evaluation. Compounded medications are prepared
        pursuant to a patient-specific prescription. Individual results may vary. This page is for informational
        purposes and does not replace medical advice from your provider.
      </PremiumDisclaimer>

      <PremiumCta
        icon="scale"
        title="Ready to Begin Your Journey?"
        description="Start your medical weight loss consultation for Semaglutide or Tirzepatide through Clear Choice Pharmacy."
        primaryCta={{
          label: "Start Your Weight Loss Consultation",
          href: CONSULTATION_URL,
        }}
      />
    </ClinicalLandingShell>
  )
}
