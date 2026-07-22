import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
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
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ServiceBuyButton } from "@/components/service-buy-button"
import { MIC_B12_HOW_IT_WORKS, MIC_B12_WEIGHT_LOSS, WEIGHT_LOSS_PROGRAMS } from "@/lib/weight-loss-catalog"
import { buildVialProductUrl, buildWeightLossProductUrl } from "@/lib/intake-prefill"
import { PRIMARY_PHYSICIAN } from "@/lib/clinical-provider"
import {
  SITE_URL,
  WEIGHT_LOSS_FAQS,
  buildFaqJsonLd,
  pharmacyProviderSchema,
} from "@/lib/clinical-seo"
import {
  ALL_IN_INCLUSIONS,
  formatUsd,
  getWeightLossPriceRange,
  getWeightLossQuarterlySavingsPercent,
} from "@/lib/pricing-clarity"
import { AllInInclusions, PricingCompareNote } from "@/components/pricing-clarity"

const PROGRAMS_URL = "/weight-loss#programs"

export const metadata: Metadata = {
  title: "Semaglutide from $134/mo & Tirzepatide from $149/mo | Michigan Weight Loss",
  description:
    "Compounded Semaglutide from $134/mo and Tirzepatide from $149/mo on quarterly starter kits. Physician-supervised GLP-1 programs for Michigan patients—all-in kits with review, supplies, and shipping.",
  keywords: [
    "semaglutide",
    "tirzepatide",
    "semaglutide cost",
    "tirzepatide cost",
    "ozempic",
    "wegovy",
    "zepbound",
    "GLP-1",
    "GLP-1 weight loss",
    "medical weight loss",
    "weight loss injections",
    "weight loss clinic",
    "Michigan",
    "semaglutide Michigan",
    "tirzepatide Novi",
  ],
  alternates: {
    canonical: `${SITE_URL}/weight-loss`,
  },
  openGraph: {
    title: "Semaglutide from $134/mo & Tirzepatide from $149/mo | Clear Choice Pharmacy",
    description:
      "All-in medical weight loss kits for Michigan patients. Semaglutide from $134/mo, Tirzepatide from $149/mo on quarterly starter billing.",
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
    name: "Semaglutide from $134/mo & Tirzepatide from $149/mo | Clear Choice Pharmacy",
    url: `${SITE_URL}/weight-loss`,
    description:
      "Compounded Semaglutide from $134/mo and Tirzepatide from $149/mo at Clear Choice Pharmacy in Novi, MI.",
    about: [
      { "@type": "MedicalTherapy", name: "Semaglutide Weight Loss" },
      { "@type": "MedicalTherapy", name: "Tirzepatide Weight Loss" },
      { "@type": "MedicalTherapy", name: "GLP-1 Weight Loss Injections" },
      { "@type": "MedicalTherapy", name: "MIC + B12 Metabolic Weight Support" },
    ],
    provider: pharmacyProviderSchema(),
  }

  return (
    <ClinicalLandingShell jsonLd={[pageJsonLd, buildFaqJsonLd(WEIGHT_LOSS_FAQS)]}>
      <PremiumHero
        badge="Medical Weight Loss · GLP-1"
        headline="Semaglutide & Tirzepatide Weight Loss"
        subheadline="All-in kits from $134/mo Semaglutide and $149/mo Tirzepatide on quarterly starter billing."
        description="Looking for medical weight loss, weight loss injections, or alternatives patients compare to Ozempic, Wegovy, and Zepbound? Clear Choice Pharmacy compounds Semaglutide and Tirzepatide after provider review—for qualifying Michigan patients."
        highlight="Custom titration · Pharmacy-compounded · Reviewed by Dr. Dourra · Michigan patients"
        heroImage={{
          src: "/images/weight-loss-hero.png",
          alt: "Semaglutide and Tirzepatide medical weight loss program",
        }}
        primaryCta={{
          label: "Shop Semaglutide & Tirzepatide",
          href: PROGRAMS_URL,
          scrollTo: "#programs",
        }}
        secondaryCta={{ label: "How GLP-1 Works", href: "#benefits", scrollTo: "#benefits" }}
      />

      <ContentSection id="programs">
        <SectionIntro
          eyebrow="Weight Loss Injections"
          title="Semaglutide, Tirzepatide & MIC + B12"
          description="All-in kit pricing — physician review, compounding, supplies, and Michigan shipping or pickup included. No hidden membership fee."
        />
        <AllInInclusions items={ALL_IN_INCLUSIONS.weightLoss} className="mt-6" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {WEIGHT_LOSS_PROGRAMS.map((program) => {
            const range = getWeightLossPriceRange(program)
            const savePct = getWeightLossQuarterlySavingsPercent(program)
            return (
              <Card key={program.id} className="overflow-hidden p-0 flex flex-col h-full">
                <div className="relative aspect-[4/3] w-full bg-muted/40">
                  <Image
                    src={program.image.src}
                    alt={program.image.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-contain object-center p-3"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-2" />
                <h3 className="text-xl font-bold">{program.name}</h3>
                <p className="text-sm text-primary font-medium mt-1">{program.subtitle}</p>
                <p className="text-sm text-muted-foreground mt-3 flex-1">{program.description}</p>
                <div className="mt-5 pt-4 border-t space-y-2">
                  <p className="text-3xl font-bold text-primary">
                    from {formatUsd(range.fromQuarterly)}
                    <span className="text-base font-normal text-muted-foreground">/mo quarterly</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Monthly from {formatUsd(range.fromMonthly)} · up to {formatUsd(range.toMonthly)} by vial mg
                  </p>
                  {savePct > 0 && (
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                      Save ~{savePct}% vs monthly on quarterly starter kits
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {program.doses.length} vial strengths · choose your mg at checkout
                  </p>
                  <div className="mt-4">
                    <ServiceBuyButton href={buildWeightLossProductUrl(program.id)} fullWidth label="Shop now" />
                  </div>
                </div>
                </div>
              </Card>
            )
          })}
          <Card className="overflow-hidden p-0 flex flex-col h-full">
            <div className="relative aspect-[4/3] w-full bg-muted/40">
              <Image
                src={MIC_B12_WEIGHT_LOSS.image.src}
                alt={MIC_B12_WEIGHT_LOSS.image.alt}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-contain object-center p-3"
              />
            </div>
            <div className="p-6 flex flex-col flex-1">
            <h3 className="text-xl font-bold">MIC + B12 Skinny Shot</h3>
            <p className="text-sm text-primary font-medium mt-1">Lipotropic Metabolic Support</p>
            <p className="text-sm text-muted-foreground mt-3 flex-1">{MIC_B12_WEIGHT_LOSS.description}</p>
            <div className="mt-5 pt-4 border-t">
              <p className="text-3xl font-bold text-primary">
                ${MIC_B12_WEIGHT_LOSS.price}
                <span className="text-base font-normal text-muted-foreground">/kit</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">{MIC_B12_WEIGHT_LOSS.supply}</p>
              <div className="mt-4">
                <ServiceBuyButton href={buildVialProductUrl(MIC_B12_WEIGHT_LOSS.id)} fullWidth label="Shop now" />
              </div>
            </div>
            </div>
          </Card>
        </div>
        <PricingCompareNote
          className="mt-8"
          title="How we stay competitive on Semaglutide & Tirzepatide"
          body="Many cash-pay telehealth ads quote $99–$175 starter Semaglutide or $300–$500 Tirzepatide—sometimes with membership fees or prices that rise sharply at maintenance. Our kits show starter-to-maintenance pricing up front, include provider review and supplies, and are compounded in Novi for Michigan patients—no separate membership fee."
        />
        <p className="text-xs text-muted-foreground mt-4">
          Prescription required after provider review. Kit price reflects prescribed dose strength (4 weekly injections).
        </p>
      </ContentSection>

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
          title="Semaglutide & Tirzepatide for Medical Weight Loss"
          description="Physician-supervised weight loss injections and weight management programs with transparent cash-pay pricing."
        />
        <BenefitList items={glpBenefits} />
      </ContentSection>

      <ContentSection id="mic-b12" tone="muted">
        <SectionIntro
          eyebrow="Metabolic Support"
          title="How MIC + B12 Supports Weight Loss"
          description="A lipotropic injection kit that supports fat metabolism, energy, and metabolic health — ideal on its own or alongside GLP-1 therapy."
        />
        <BenefitList
          items={MIC_B12_HOW_IT_WORKS.map(({ title, description }) => `${title}: ${description}`)}
        />
      </ContentSection>

      <ContentSection>
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
            title: "Review Your HomeKit",
            description: "Explore Semaglutide or Tirzepatide kit details, pricing, and titration — then start your secure intake.",
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
        title="Semaglutide, Tirzepatide & Weight Loss FAQs"
        subtitle="Ozempic, Wegovy, Zepbound comparisons, pricing, and eligibility"
        items={WEIGHT_LOSS_FAQS}
      />

      <ContentSection>
        <SectionIntro
          eyebrow="Learn"
          title="Weight Loss Guides"
          description="Read educational articles on Semaglutide, Tirzepatide, and how compounded GLP-1 compares to brand-name options."
        />
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/learn/semaglutide-weight-loss">Semaglutide guide</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/learn/tirzepatide-weight-loss">Tirzepatide guide</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/learn/semaglutide-vs-tirzepatide">Semaglutide vs Tirzepatide</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/learn">All Learn articles</Link>
          </Button>
        </div>
      </ContentSection>

      <PremiumDisclaimer>
        GLP-1 therapies require a valid prescription and clinical evaluation. Compounded medications are prepared
        pursuant to a patient-specific prescription. Individual results may vary. This page is for informational
        purposes and does not replace medical advice from your provider.
      </PremiumDisclaimer>

      <PremiumCta
        icon="scale"
        title="Ready to Begin Your Journey?"
        description="Buy Semaglutide or Tirzepatide medical weight loss through Clear Choice Pharmacy."
        primaryCta={{
          label: "Shop GLP Programs",
          href: PROGRAMS_URL,
          scrollTo: "#programs",
        }}
      />
    </ClinicalLandingShell>
  )
}
