import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
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
import { Button } from "@/components/ui/button"
import { ServiceBuyButton } from "@/components/service-buy-button"
import {
  SITE_URL,
  MENS_HEALTH_FAQS,
  buildFaqJsonLd,
  pharmacyProviderSchema,
} from "@/lib/clinical-seo"
import { TRT_PROGRAMS, getTrtStartingMonthlyPrice } from "@/lib/trt-catalog"
import { ED_FORMULATIONS, formatEdBillingLabel } from "@/lib/ed-troche-catalog"
import { buildEdProductUrl, buildTrtProductUrl } from "@/lib/intake-prefill"
import { PRIMARY_PHYSICIAN } from "@/lib/clinical-provider"
import {
  ALL_IN_INCLUSIONS,
  formatUsd,
  getBestEdPlan,
  getEdDosesPerSupply,
  getEdPricePerDose,
} from "@/lib/pricing-clarity"
import { AllInInclusions, PricingCompareNote } from "@/components/pricing-clarity"

const ED_LANDING_URL = "/mens-health#ed-troches"
const TRT_LANDING_URL = "/mens-health#trt"

export const metadata: Metadata = {
  title: "Sildenafil from $39/mo, Tadalafil & TRT from $109/mo | Men's Health",
  description:
    "Sildenafil ED troches from $39/mo, Tadalafil from $49/mo on quarterly billing, and physician-supervised TRT from $109/mo. Transparent cash-pay pricing for Michigan patients. Clear Choice Pharmacy, Novi.",
  keywords: [
    "tadalafil",
    "sildenafil",
    "cialis",
    "viagra",
    "ED medication",
    "erectile dysfunction",
    "ED troches",
    "TRT",
    "TRT cost",
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
    title: "Sildenafil from $39/mo, Tadalafil & TRT from $109/mo | Clear Choice Pharmacy",
    description:
      "ED medications from $39/mo on quarterly billing and testosterone replacement therapy from $109/mo with discreet pharmacy fulfillment in Novi, MI.",
    url: `${SITE_URL}/mens-health`,
    type: "website",
  },
}

export default function MensHealthPage() {
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: "Sildenafil from $39/mo, Tadalafil & TRT from $109/mo | Clear Choice Pharmacy",
    url: `${SITE_URL}/mens-health`,
    description:
      "Sildenafil and Tadalafil ED medications from $39/mo on quarterly billing and testosterone replacement therapy from $109/mo at Clear Choice Pharmacy in Novi, MI.",
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
        subheadline="Sildenafil from $39/mo, Tadalafil from $49/mo on quarterly billing, and TRT from $109/mo—transparent cash-pay pricing."
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
          description="Compounded sublingual troches with transparent monthly pricing and clear $/dose math. Provider review required."
        />
        <AllInInclusions items={ALL_IN_INCLUSIONS.ed} className="mt-6" />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {ED_FORMULATIONS.map((formulation) => {
            const best = getBestEdPlan(formulation)
            const monthlyPlan = formulation.pricing.find((p) => p.plan === "monthly")
            const doses = getEdDosesPerSupply(formulation.id)
            const monthlyDosePrice = getEdPricePerDose(
              monthlyPlan?.pricePerMonth ?? best.pricePerMonth,
              formulation.id
            )
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
                <div className="mt-5 pt-4 border-t space-y-2">
                  <p className="text-3xl font-bold text-primary">
                    {formatUsd(best.pricePerMonth)}
                    <span className="text-base font-normal text-muted-foreground">/mo all-in</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    About {formatUsd(best.pricePerDose, 2)}/dose on {formatEdBillingLabel(best.plan).toLowerCase()} ·{" "}
                    {doses} troches / 30 days
                  </p>
                  {monthlyPlan ? (
                    <p className="text-xs text-muted-foreground">
                      Monthly plan {formatUsd(monthlyPlan.pricePerMonth)}/mo ({formatUsd(monthlyDosePrice, 2)}/dose)
                    </p>
                  ) : null}
                  <div className="mt-4">
                    <ServiceBuyButton href={buildEdProductUrl(formulation.id)} fullWidth label="Shop now" />
                  </div>
                </div>
                </div>
              </Card>
            )
          })}
        </div>

        <PricingCompareNote
          className="mt-8"
          title="How our ED troches compare"
          body="National telehealth brands often price generic tablets from ~$2/dose or compounded combo mints around $6–$12/dose. Our sublingual troches are a compounded, food-resistant format with physician review included—from about $39/mo Sildenafil and $49/mo Tadalafil on quarterly billing (~$3.90/dose and ~$1.63/dose). Monthly plans are also available. Prefer plain generic tablets? Use our low cost prescription drugs search for cash-pay tablet pricing."
        />

        <p className="text-xs text-muted-foreground mt-4">
          Prescription required. Payment authorized as a hold and captured only upon provider approval.
        </p>
      </ContentSection>

      <ContentSection id="trt" tone="muted">
        <SectionIntro
          eyebrow="TRT · Testosterone Replacement Therapy"
          title="Physician-Supervised Testosterone Therapy"
          description="All-in cash-pay programs from $109/mo on quarterly billing—medication, supplies, and Michigan shipping or pickup included."
        />
        <AllInInclusions items={ALL_IN_INCLUSIONS.trt} className="mt-6" />
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          {TRT_PROGRAMS.map((program) => {
            const startingPrice = getTrtStartingMonthlyPrice(program)
            const quarterly = program.pricing.find((p) => p.plan === "quarterly")
            const monthly = program.pricing.find((p) => p.plan === "monthly")
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
                <div className="mt-5 pt-4 border-t space-y-2">
                  <p className="text-3xl font-bold text-primary">
                    {formatUsd(startingPrice)}
                    <span className="text-base font-normal text-muted-foreground">/mo all-in</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {monthly ? `${formatUsd(monthly.pricePerMonth)} monthly` : null}
                    {monthly && quarterly ? " · " : null}
                    {quarterly ? `${formatUsd(quarterly.pricePerMonth)} quarterly` : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Labs may be ordered separately when clinically required—ask during intake.
                  </p>
                  <div className="mt-4">
                    <ServiceBuyButton href={buildTrtProductUrl(program.id)} fullWidth label="Shop now" />
                  </div>
                </div>
                </div>
              </Card>
            )
          })}
        </div>

        <PricingCompareNote
          className="mt-8"
          title="How our TRT pricing compares"
          body="Online TRT platforms commonly charge $99–$300/mo. Budget ads near $99 often exclude labs or use thinner monitoring. Our injectable program starts at $109/mo quarterly ($129 monthly) with medication, supplies, and shipping included for Michigan patients after physician review."
        />

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

      <ContentSection>
        <SectionIntro
          eyebrow="Learn"
          title="Men's Health Guides"
          description="Educational articles on Tadalafil, Sildenafil, Cialis/Viagra comparisons, and testosterone replacement therapy."
        />
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/learn/tadalafil-vs-cialis">Tadalafil vs Cialis</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/learn/sildenafil-vs-viagra">Sildenafil vs Viagra</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/learn/testosterone-replacement-therapy-trt">TRT guide</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/learn">All Learn articles</Link>
          </Button>
        </div>
      </ContentSection>

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
