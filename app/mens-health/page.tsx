import type { Metadata } from "next"
import Image from "next/image"
import {
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
import { Card } from "@/components/ui/card"
import { ServiceBuyButton } from "@/components/service-buy-button"
import {
  SITE_URL,
  MENS_HEALTH_FAQS,
  buildFaqJsonLd,
  pharmacyProviderSchema,
} from "@/lib/clinical-seo"
import { TRT_PROGRAMS, getTrtStartingMonthlyPrice } from "@/lib/trt-catalog"
import { ED_FORMULATIONS, getEdStartingMonthlyPrice } from "@/lib/ed-troche-catalog"
import { buildEdProductUrl, buildTrtProductUrl } from "@/lib/intake-prefill"
import { PRIMARY_PHYSICIAN } from "@/lib/clinical-provider"

const ED_LANDING_URL = "/mens-health#ed-troches"
const TRT_LANDING_URL = "/mens-health#trt"

export const metadata: Metadata = {
  title: "ED Medications & TRT for Michigan Patients",
  description:
    "Custom sublingual ED troches and physician-supervised TRT for Michigan patients in Novi and Metro Detroit. Transparent cash-pay testosterone therapy from $109/mo.",
  keywords: [
    "TRT Novi MI",
    "testosterone replacement therapy Michigan",
    "ED troches Michigan",
    "compounding pharmacy Metro Detroit",
    "Sildenafil troche Novi",
    "testosterone cypionate Michigan",
    "men's health pharmacy Novi MI",
  ],
  alternates: {
    canonical: `${SITE_URL}/mens-health`,
  },
  openGraph: {
    title: "Men's Health | ED Troches & TRT | Michigan | Clear Choice Pharmacy",
    description:
      "ED troches and testosterone replacement therapy for Michigan patients, with discreet fulfillment from our Novi pharmacy.",
    url: `${SITE_URL}/mens-health`,
    type: "website",
  },
}

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
        description="Whether you need fast-acting sublingual ED troches or testosterone replacement therapy, Clear Choice Pharmacy delivers pharmacy compounding and upfront pricing—no insurance middlemen."
        highlight="🔒 Buy online · Provider review · Pharmacy-formulated · Discreet delivery"
        primaryCta={{
          label: "Shop ED Troches",
          href: ED_LANDING_URL,
          scrollTo: "#ed-troches",
        }}
        secondaryCta={{ label: "Shop TRT Programs", href: TRT_LANDING_URL, scrollTo: "#trt" }}
      />

      <ContentSection id="ed-troches">
        <SectionIntro
          eyebrow="Sublingual ED Troches"
          title="Sildenafil, Tadalafil & Dual Combination"
          description="Choose a formulation and buy online. Optional add-ons (Oxytocin, Apomorphine, PE support) can be added before checkout. Prescription required after provider review."
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {ED_FORMULATIONS.map((formulation) => {
            const startingPrice = getEdStartingMonthlyPrice(formulation)
            return (
              <Card key={formulation.id} className="overflow-hidden p-0 flex flex-col h-full">
                <div className="relative aspect-[4/3] w-full bg-muted/40">
                  <Image
                    src={formulation.image.src}
                    alt={formulation.image.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-center"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {formulation.highlight && <Badge variant="secondary">{formulation.highlight}</Badge>}
                </div>
                <h3 className="text-xl font-bold">{formulation.name}</h3>
                <p className="text-sm text-primary font-medium mt-1">{formulation.subtitle}</p>
                <p className="text-sm text-muted-foreground mt-3 flex-1">{formulation.description}</p>
                <div className="mt-5 pt-4 border-t">
                  <p className="text-3xl font-bold text-primary">
                    ${startingPrice}
                    <span className="text-base font-normal text-muted-foreground">+</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">/mo starting at · {formulation.supplyLabel}</p>
                  <div className="mt-4">
                    <ServiceBuyButton href={buildEdProductUrl(formulation.id)} fullWidth label="Shop now" />
                  </div>
                </div>
                </div>
              </Card>
            )
          })}
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Prescription required. Payment authorized as a hold and captured only upon provider approval.
        </p>
      </ContentSection>

      <ContentSection id="trt" tone="muted">
        <SectionIntro
          eyebrow="Testosterone Replacement Therapy"
          title="Physician-Supervised TRT With Transparent Pricing"
          description="Buy a TRT program online. Injectable programs from $109/mo on quarterly billing, including medication, supplies, and shipping. Provider review required."
        />
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          {TRT_PROGRAMS.map((program) => {
            const startingPrice = getTrtStartingMonthlyPrice(program)
            return (
              <Card key={program.id} className="overflow-hidden p-0 flex flex-col h-full">
                <div className="relative aspect-[4/3] w-full bg-muted/40">
                  <Image
                    src={program.image.src}
                    alt={program.image.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-center"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {program.highlight && <Badge variant="secondary">{program.highlight}</Badge>}
                </div>
                <h3 className="text-xl font-bold">{program.name}</h3>
                <p className="text-sm text-primary font-medium mt-1">{program.subtitle}</p>
                <p className="text-sm text-muted-foreground mt-3 flex-1">{program.description}</p>
                <div className="mt-5 pt-4 border-t">
                  <p className="text-3xl font-bold text-primary">
                    ${startingPrice}
                    <span className="text-base font-normal text-muted-foreground">+</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">/mo starting at · {program.supplyLabel}</p>
                  <div className="mt-4">
                    <ServiceBuyButton href={buildTrtProductUrl(program.id)} fullWidth label="Shop now" />
                  </div>
                </div>
                </div>
              </Card>
            )
          })}
        </div>

        <p className="text-sm text-muted-foreground mt-6 max-w-2xl">
          Unlike nutrient-only hormone balance injections, our TRT programs deliver physician-supervised testosterone
          therapy with pharmacy fulfillment—designed for men seeking real hormone optimization with upfront pricing.
        </p>
      </ContentSection>

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
            description: "Confidential checkout and direct delivery",
          },
          {
            icon: "shield",
            title: "Transparent Pricing",
            description: "Clear Choice cash-pay model—no hidden fees",
          },
        ]}
      />

      <ProcessSteps
        title="How It Works"
        subtitle="From purchase to compounded care at your door"
        steps={[
          {
            step: 1,
            title: "Review Your HomeKit",
            description: "Explore ED troche or TRT kit details, optional add-ons, and pricing — then start your secure intake.",
          },
          {
            step: 2,
            title: "Physician Approval",
            description: `${PRIMARY_PHYSICIAN.name} reviews your intake and approves a customized protocol.`,
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
        Compounded medications are prepared pursuant to a patient-specific prescription. Provider clinical
        evaluation is required. Individual results may vary. Testosterone is a controlled substance requiring
        physician supervision.
      </PremiumDisclaimer>

      <PremiumCta
        icon="heart"
        title="Ready to Get Started?"
        description="Buy ED troches or testosterone replacement therapy with transparent pricing and discreet fulfillment."
        primaryCta={{
          label: "Shop ED Troches",
          href: ED_LANDING_URL,
          scrollTo: "#ed-troches",
        }}
        secondaryCta={{
          label: "Shop TRT Programs",
          href: TRT_LANDING_URL,
          scrollTo: "#trt",
        }}
      />
    </ClinicalLandingShell>
  )
}
