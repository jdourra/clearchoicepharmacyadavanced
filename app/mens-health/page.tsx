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
  title: "Tadalafil, Sildenafil & TRT | ED Medications",
  description:
    "Tadalafil and Sildenafil ED troches plus physician-supervised TRT and testosterone therapy. Transparent cash-pay pricing from $39/mo ED and $109/mo TRT. Clear Choice Pharmacy, Novi, MI.",
  keywords: [
    "tadalafil",
    "sildenafil",
    "cialis",
    "viagra",
    "ED medication",
    "erectile dysfunction",
    "ED troches",
    "TRT",
    "testosterone replacement therapy",
    "testosterone cypionate",
    "low testosterone",
    "men's health",
    "tadalafil Michigan",
    "sildenafil Novi",
  ],
  alternates: {
    canonical: `${SITE_URL}/mens-health`,
  },
  openGraph: {
    title: "Tadalafil, Sildenafil & TRT | Clear Choice Pharmacy",
    description:
      "ED medications (Tadalafil, Sildenafil) and testosterone replacement therapy with discreet pharmacy fulfillment in Novi, MI.",
    url: `${SITE_URL}/mens-health`,
    type: "website",
  },
}

export default function MensHealthPage() {
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: "Tadalafil, Sildenafil & TRT | Clear Choice Pharmacy",
    url: `${SITE_URL}/mens-health`,
    description:
      "Tadalafil and Sildenafil ED medications and testosterone replacement therapy at Clear Choice Pharmacy in Novi, MI.",
    about: [
      { "@type": "MedicalTherapy", name: "Tadalafil ED Treatment" },
      { "@type": "MedicalTherapy", name: "Sildenafil ED Treatment" },
      { "@type": "MedicalTherapy", name: "Testosterone Replacement Therapy" },
    ],
    provider: pharmacyProviderSchema(),
  }

  return (
    <ClinicalLandingShell jsonLd={[pageJsonLd, buildFaqJsonLd(MENS_HEALTH_FAQS)]}>
      <PremiumHero
        badge="Men's Health · ED & TRT"
        headline="Tadalafil, Sildenafil & TRT"
        subheadline="ED medications and physician-supervised testosterone therapy with transparent cash-pay pricing."
        description="Get compounded Tadalafil and Sildenafil troches (active ingredients in Cialis and Viagra) or start TRT with testosterone cypionate, cream, or enclomiphene—after provider review for Michigan patients."
        highlight="Buy online · Provider review · Pharmacy-compounded · Discreet delivery"
        primaryCta={{
          label: "Shop Tadalafil & Sildenafil",
          href: ED_LANDING_URL,
          scrollTo: "#ed-troches",
        }}
        secondaryCta={{ label: "Shop TRT Programs", href: TRT_LANDING_URL, scrollTo: "#trt" }}
      />

      <ContentSection id="ed-troches">
        <SectionIntro
          eyebrow="ED Medications"
          title="Tadalafil, Sildenafil & Dual Combination"
          description="Compounded sublingual troches for erectile dysfunction. Optional add-ons available before checkout. Prescription required after provider review."
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
          eyebrow="TRT · Testosterone Replacement Therapy"
          title="Physician-Supervised Testosterone Therapy"
          description="Injectable testosterone cypionate from $109/mo on quarterly billing, plus cream and enclomiphene options. Provider review required."
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
        title="Tadalafil, Sildenafil & TRT FAQs"
        subtitle="ED medications, Cialis/Viagra comparisons, and testosterone therapy"
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
