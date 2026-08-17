import type { Metadata } from "next"
import Link from "next/link"
import {
  ClinicalLandingShell,
  ContentSection,
  FaqSection,
  PremiumCta,
  PremiumDisclaimer,
  PremiumHero,
  SectionIntro,
} from "@/components/clinical-landing-shell"
import { SITE_URL, WEIGHT_LOSS_FAQS, buildBreadcrumbJsonLd, buildFaqJsonLd } from "@/lib/clinical-seo"

export const metadata: Metadata = {
  title: { absolute: "Medical Weight Loss FAQ | Clear Choice Pharmacy Michigan" },
  description:
    "Answers about provider-guided medical weight loss in Michigan: Semaglutide, Tirzepatide, eligibility, pricing, and how Clear Choice Pharmacy compounds GLP-1 kits after clinician review.",
  alternates: { canonical: `${SITE_URL}/weight-loss/faq` },
  openGraph: {
    title: "Medical Weight Loss FAQ | Clear Choice Pharmacy Michigan",
    description:
      "Common questions about GLP-1 weight management, compounded Semaglutide and Tirzepatide, eligibility, and pricing.",
    url: `${SITE_URL}/weight-loss/faq`,
    type: "website",
  },
}

const EXTRA_FAQS = [
  {
    question: "What does Clear Choice Pharmacy do versus the prescribing clinician?",
    answer:
      "A licensed clinician reviews your intake and decides whether a prescription is appropriate. Clear Choice Pharmacy compounds and fulfills approved, patient-specific medications for qualifying Michigan patients from our Novi location.",
  },
  {
    question: "Do you guarantee weight loss results?",
    answer:
      "No. We do not guarantee weight loss or specific outcomes. Response to GLP-1 therapy varies. Your clinician discusses expected benefits, risks, and alternatives based on your health profile.",
  },
  {
    question: "Can patients outside Michigan enroll?",
    answer:
      "Clear Choice Pharmacy currently dispenses these clinical weight management programs to Michigan patients only. Contact the pharmacy if you have questions about service area.",
  },
  {
    question: "Where can I read more educational content?",
    answer:
      "Visit our Learn guides for Semaglutide, Tirzepatide, and comparisons with brand-name products. Educational articles do not replace clinician advice.",
  },
]

const ALL_FAQS = [...WEIGHT_LOSS_FAQS, ...EXTRA_FAQS]

export default function WeightLossFaqPage() {
  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Medical Weight Loss", path: "/weight-loss" },
    { name: "FAQ", path: "/weight-loss/faq" },
  ])

  return (
    <ClinicalLandingShell jsonLd={[buildFaqJsonLd(ALL_FAQS), breadcrumbs]}>
      <PremiumHero
        badge="FAQ"
        headline="Medical Weight Loss FAQ"
        subheadline="Clear answers about GLP-1 care, eligibility, and pricing in Michigan."
        description="These questions cover how provider-guided weight management works at Clear Choice Pharmacy. For kit details and pricing tables, visit the program page."
        highlight="Informational only · Individual results may vary"
        primaryCta={{ label: "Medical weight loss program", href: "/weight-loss" }}
        secondaryCta={{ label: "Compare medications", href: "/weight-loss/medications" }}
      />

      <FaqSection
        title="Common questions"
        subtitle="Semaglutide, Tirzepatide, eligibility, cost, and pharmacy roles"
        items={ALL_FAQS}
      />

      <ContentSection>
        <SectionIntro
          eyebrow="Next steps"
          title="Still have questions?"
          description="Call the pharmacy or review related pages before starting an intake."
        />
        <ul className="mt-6 space-y-2 text-sm text-muted-foreground max-w-2xl">
          <li>
            <Link href="/weight-loss/glp-1" className="text-primary hover:underline">
              GLP-1 weight management overview
            </Link>
          </li>
          <li>
            <Link href="/weight-loss/semaglutide" className="text-primary hover:underline">
              Semaglutide kits
            </Link>
          </li>
          <li>
            <Link href="/weight-loss/tirzepatide" className="text-primary hover:underline">
              Tirzepatide kits
            </Link>
          </li>
          <li>
            <Link href="/contact" className="text-primary hover:underline">
              Contact Clear Choice Pharmacy
            </Link>
          </li>
          <li>
            <Link href="/learn" className="text-primary hover:underline">
              Educational Learn guides
            </Link>
          </li>
        </ul>
      </ContentSection>

      <PremiumDisclaimer>
        FAQs are informational and do not constitute medical advice. A licensed clinician must evaluate eligibility
        before any prescription is written.
      </PremiumDisclaimer>

      <PremiumCta
        icon="scale"
        title="Explore the medical weight loss program"
        description="Review kits, how the process works, and transparent cash-pay pricing."
        primaryCta={{ label: "Go to program page", href: "/weight-loss" }}
        secondaryCta={{ label: "Contact us", href: "/contact" }}
      />
    </ClinicalLandingShell>
  )
}
