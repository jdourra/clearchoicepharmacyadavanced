import type { Metadata } from "next"
import Link from "next/link"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  SITE_URL,
  MENS_HEALTH_FAQS,
  buildFaqJsonLd,
  pharmacyProviderSchema,
} from "@/lib/clinical-seo"
import { TRT_PROGRAMS } from "@/lib/trt-catalog"
import { ED_FORMULATIONS } from "@/lib/ed-troche-catalog"

const ED_CONSULTATION_URL = "/mens-health/start"
const TRT_CONSULTATION_URL = "/mens-health/trt/start"

export const metadata: Metadata = {
  title: "Men's Health | ED Troches & TRT | Clear Choice Pharmacy",
  description:
    "Custom sublingual ED troches and physician-supervised TRT in Novi, MI. Transparent cash-pay pricing for testosterone therapy starting at $109/mo. Start your private consultation online.",
  keywords: [
    "TRT Novi MI",
    "testosterone replacement therapy Michigan",
    "ED troches Novi MI",
    "compounding pharmacy Metro Detroit",
    "Sildenafil sublingual",
    "testosterone cypionate online",
    "men's health pharmacy Novi MI",
  ],
  alternates: {
    canonical: `${SITE_URL}/mens-health`,
  },
  openGraph: {
    title: "Men's Health | ED Troches & TRT | Clear Choice Pharmacy",
    description:
      "ED troches and testosterone replacement therapy with transparent pricing and discreet pharmacy fulfillment in Novi, MI.",
    url: `${SITE_URL}/mens-health`,
    type: "website",
  },
}

const trocheBenefits = [
  "Six formulation cards to choose from: Sildenafil, Tadalafil, dual combination, premature ejaculation combination, Apomorphine, and Oxytocin.",
]

export default function MensHealthPage() {
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: "Men's Health | ED Troches & TRT | Clear Choice Pharmacy",
    url: `${SITE_URL}/mens-health`,
    description:
      "Custom sublingual ED troches and testosterone replacement therapy at Clear Choice Pharmacy in Novi, MI.",
    about: [
      { "@type": "MedicalTherapy", name: "Sublingual ED Troches" },
      { "@type": "MedicalTherapy", name: "Testosterone Replacement Therapy" },
    ],
    provider: pharmacyProviderSchema(),
  }

  return (
    <ClinicalLandingShell jsonLd={[pageJsonLd, buildFaqJsonLd(MENS_HEALTH_FAQS)]}>
      <PremiumHero
        badge="Clear Choice Men's Health"
        headline="ED Troches & TRT in Novi, MI"
        subheadline="Custom compounded ED troches and physician-supervised testosterone therapy—with transparent cash-pay pricing."
        description="Whether you need fast-acting sublingual ED troches or testosterone replacement therapy, Clear Choice Pharmacy delivers discreet consultations, pharmacy compounding, and upfront pricing—no insurance middlemen."
        highlight="🔒 Private online consultation · Pharmacy-formulated · Discreet delivery"
        primaryCta={{
          label: "Start ED Consultation",
          href: ED_CONSULTATION_URL,
        }}
        secondaryCta={{ label: "Explore TRT Programs", href: "#trt", scrollTo: "#trt" }}
      />

      <TrustRibbon
        items={[
          {
            icon: "flask-conical",
            title: "Pharmacy Compounded",
            description: "ED troches and TRT prepared by licensed pharmacists",
          },
          {
            icon: "sparkles",
            title: "Faster Than Pills",
            description: "Sublingual ED troches bypass the digestive tract",
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
          title="Sildenafil, Tadalafil, PE & Libido Options"
          description="Choose from six compounded troche formulations—Sildenafil, Tadalafil, combinations, PE support, Apomorphine, or Oxytocin—with the same card-based intake as our TRT programs."
        />
        <BenefitList items={trocheBenefits} />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {ED_FORMULATIONS.map((formulation) => {
            const pricing = formulation.pricing.find((p) => p.plan === "quarterly") || formulation.pricing[0]
            return (
              <Card key={formulation.id} className="p-6 flex flex-col h-full">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {formulation.highlight && <Badge variant="secondary">{formulation.highlight}</Badge>}
                  {pricing.badge && <Badge>{pricing.badge}</Badge>}
                </div>
                <h3 className="text-xl font-bold">{formulation.name}</h3>
                <p className="text-sm text-primary font-medium mt-1">{formulation.subtitle}</p>
                <p className="text-sm text-muted-foreground mt-3 flex-1">{formulation.description}</p>
                <div className="mt-5 pt-4 border-t">
                  <p className="text-3xl font-bold text-primary">
                    ${pricing.pricePerMonth}
                    <span className="text-base font-normal text-muted-foreground">/mo</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {pricing.plan === "quarterly"
                      ? `$${pricing.totalBilled} billed quarterly · includes shipping`
                      : "Monthly billing available"}
                  </p>
                </div>
              </Card>
            )
          })}
        </div>

        <div className="mt-8">
          <Button asChild size="lg">
            <Link href={ED_CONSULTATION_URL}>Start ED Consultation</Link>
          </Button>
        </div>
      </ContentSection>

      <ContentSection id="trt" tone="muted">
        <SectionIntro
          eyebrow="Testosterone Replacement Therapy"
          title="Physician-Supervised TRT With Transparent Pricing"
          description="Restore energy, libido, and vitality with testosterone therapy reviewed by a licensed provider and fulfilled by Clear Choice Pharmacy. Competitive cash-pay pricing—injectable programs from $109/mo on quarterly billing, including medication, supplies, and shipping."
        />
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          {TRT_PROGRAMS.map((program) => {
            const pricing = program.pricing.find((p) => p.plan === "quarterly") || program.pricing[0]
            return (
              <Card key={program.id} className="p-6 flex flex-col h-full">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {program.highlight && <Badge variant="secondary">{program.highlight}</Badge>}
                  {pricing.badge && <Badge>{pricing.badge}</Badge>}
                </div>
                <h3 className="text-xl font-bold">{program.name}</h3>
                <p className="text-sm text-primary font-medium mt-1">{program.subtitle}</p>
                <p className="text-sm text-muted-foreground mt-3 flex-1">{program.description}</p>
                <div className="mt-5 pt-4 border-t">
                  <p className="text-3xl font-bold text-primary">${pricing.pricePerMonth}<span className="text-base font-normal text-muted-foreground">/mo</span></p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {pricing.plan === "quarterly" ? `$${pricing.totalBilled} billed quarterly · includes shipping` : "Monthly billing available"}
                  </p>
                </div>
              </Card>
            )
          })}
        </div>

        <p className="text-sm text-muted-foreground mt-6 max-w-2xl">
          Unlike nutrient-only hormone balance injections, our TRT programs deliver physician-supervised testosterone
          therapy with pharmacy fulfillment—designed for men seeking real hormone optimization with upfront pricing.
        </p>

        <div className="mt-8">
          <Button asChild size="lg">
            <Link href={TRT_CONSULTATION_URL}>Start TRT Consultation</Link>
          </Button>
        </div>
      </ContentSection>

      <ProcessSteps
        title="How It Works"
        subtitle="From consultation to compounded care at your door"
        steps={[
          {
            step: 1,
            title: "Start Your Consultation",
            description: "Complete a private online health review for ED troches or TRT—choose the program that fits your goals.",
          },
          {
            step: 2,
            title: "Physician Approval",
            description: "A licensed provider reviews your history and approves a customized ED or testosterone protocol.",
          },
          {
            step: 3,
            title: "Pharmacy Compounding",
            description: "Clear Choice Pharmacy compounds your medication and ships discreetly—or prepares it for pickup in Novi.",
          },
        ]}
      />

      <FaqSection
        title="Frequently Asked Questions"
        subtitle="Common questions about ED troches and TRT"
        items={MENS_HEALTH_FAQS}
      />

      <PremiumDisclaimer>
        Compounded medications are prepared pursuant to a patient-specific prescription. Consultation and clinical
        evaluation are required. Individual results may vary. Testosterone is a controlled substance requiring
        physician supervision.
      </PremiumDisclaimer>

      <PremiumCta
        icon="heart"
        title="Ready to Get Started?"
        description="Choose ED troches or testosterone replacement therapy—both with private consultations and transparent pricing."
        primaryCta={{
          label: "Start ED Consultation",
          href: ED_CONSULTATION_URL,
        }}
        secondaryCta={{
          label: "Start TRT Consultation",
          href: TRT_CONSULTATION_URL,
        }}
      />
    </ClinicalLandingShell>
  )
}
