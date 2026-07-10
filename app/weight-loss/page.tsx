import type { Metadata } from "next"
import Image from "next/image"
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
import { ServiceBuyButton } from "@/components/service-buy-button"
import { MIC_B12_HOW_IT_WORKS, MIC_B12_WEIGHT_LOSS, WEIGHT_LOSS_PROGRAMS, getWeightLossStartingKitPrice } from "@/lib/weight-loss-catalog"
import { buildVialProductUrl, buildWeightLossProductUrl } from "@/lib/intake-prefill"
import { PRIMARY_PHYSICIAN } from "@/lib/clinical-provider"
import {
  SITE_URL,
  WEIGHT_LOSS_FAQS,
  buildFaqJsonLd,
  pharmacyProviderSchema,
} from "@/lib/clinical-seo"

const PROGRAMS_URL = "/weight-loss#programs"

export const metadata: Metadata = {
  title: "Weight Loss & GLP-1 for Michigan Patients",
  description:
    "Semaglutide and Tirzepatide medical weight management for Michigan patients in Novi and Metro Detroit. Transparent cash-pay GLP-1 pricing with licensed provider review.",
  keywords: [
    "medical weight loss Novi MI",
    "GLP-1 weight loss Michigan",
    "Semaglutide Novi Michigan",
    "Tirzepatide Metro Detroit",
    "compounded weight loss pharmacy Michigan",
    "GLP weight management Novi",
    "medical weight management Michigan patients",
    "weight loss clinic Novi MI",
  ],
  alternates: {
    canonical: `${SITE_URL}/weight-loss`,
  },
  openGraph: {
    title: "Medical Weight Loss & GLP Therapy | Michigan | Clear Choice Pharmacy",
    description:
      "Semaglutide and Tirzepatide for Michigan patients in Novi and Metro Detroit. Custom GLP-1 formulations with transparent pricing.",
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
      { "@type": "MedicalTherapy", name: "MIC + B12 Metabolic Weight Support" },
    ],
    provider: pharmacyProviderSchema(),
  }

  return (
    <ClinicalLandingShell jsonLd={[pageJsonLd, buildFaqJsonLd(WEIGHT_LOSS_FAQS)]}>
      <PremiumHero
        badge="Clear Choice Weight Management"
        headline="Medical Weight Loss & GLP Therapy in Novi, MI"
        subheadline="Semaglutide and Tirzepatide programs with transparent, upfront pricing."
        description="Achieving long-term metabolic health requires premium clinical tools. Clear Choice Pharmacy compounds customized GLP-1 formulations designed to match your specific titration schedule—without insurance opacity or PBM middlemen."
        highlight="📊 Custom titration · Pharmacy-compounded · Reviewed by Dr. Dourra"
        heroImage={{
          src: "/images/weight-loss-hero.png",
          alt: "Woman measuring waist progress during medical weight loss program",
        }}
        primaryCta={{
          label: "Shop GLP Programs",
          href: PROGRAMS_URL,
          scrollTo: "#programs",
        }}
        secondaryCta={{ label: "Explore GLP Benefits", href: "#benefits", scrollTo: "#benefits" }}
      />

      <ContentSection id="programs">
        <SectionIntro
          eyebrow="Choose Your Program"
          title="Semaglutide, Tirzepatide & MIC + B12"
          description="Buy online with transparent pricing. Provider review and pharmacy fulfillment included."
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {WEIGHT_LOSS_PROGRAMS.map((program) => {
            const startingPrice = getWeightLossStartingKitPrice(program)
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
                <div className="mt-5 pt-4 border-t">
                  <p className="text-3xl font-bold text-primary">
                    ${startingPrice}
                    <span className="text-base font-normal text-muted-foreground">+</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">starting at per 30-day kit · 4 weekly injections</p>
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
        <p className="text-xs text-muted-foreground mt-4">
          Prescription required after provider review.
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
          title="Semaglutide & Tirzepatide Medical Programs"
          description="Complete a secure online intake and access transparently priced GLP-1 programs through Clear Choice Pharmacy."
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
        title="Frequently Asked Questions"
        subtitle="What to know before starting GLP-1 therapy"
        items={WEIGHT_LOSS_FAQS}
      />

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
