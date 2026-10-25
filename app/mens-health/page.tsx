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
import { ED_FORMULATIONS, formatEdBillingLabel } from "@/lib/ed-troche-catalog"
import { buildEdProductUrl } from "@/lib/intake-prefill"
import { HORMONE_THERAPY_CONTROLLED_NOTE } from "@/lib/site-config"
import {
  ALL_IN_INCLUSIONS,
  formatUsd,
  getBestEdPlan,
  getEdDosesPerSupply,
  getEdPricePerDose,
} from "@/lib/pricing-clarity"
import { AllInInclusions, PricingCompareNote } from "@/components/pricing-clarity"

const ED_LANDING_URL = "/mens-health#ed-troches"

export const metadata: Metadata = {
  title: "Sildenafil from $39/mo and Tadalafil from $49/mo | Men's Health",
  description:
    "Sildenafil ED troches from $39/mo and Tadalafil from $49/mo on quarterly billing. A clinician licensed in your state reviews the intake. A pharmacy licensed in your state fills an approved prescription.",
  keywords: [
    "tadalafil",
    "sildenafil",
    "cialis",
    "viagra",
    "ED medication",
    "erectile dysfunction",
    "ED troches",
    "men's health",
    "tadalafil Michigan",
    "sildenafil Novi",
  ],
  alternates: {
    canonical: `${SITE_URL}/mens-health`,
  },
  openGraph: {
    title: "Sildenafil from $39/mo and Tadalafil from $49/mo | Clear Choice Pharmacy",
    description:
      "ED medications from $39/mo. A clinician licensed in your state reviews the intake. A pharmacy licensed in your state fills an approved prescription.",
    url: `${SITE_URL}/mens-health`,
    type: "website",
  },
}

export default function MensHealthPage() {
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: "Sildenafil from $39/mo and Tadalafil from $49/mo | Clear Choice Pharmacy",
    url: `${SITE_URL}/mens-health`,
    description:
      "Sildenafil and tadalafil after a clinician licensed in your state reviews the intake. A pharmacy licensed in your state fills an approved prescription.",
    about: [
      { "@type": "MedicalTherapy", name: "Tadalafil ED Treatment" },
      { "@type": "MedicalTherapy", name: "Sildenafil ED Treatment" },
    ],
    provider: pharmacyProviderSchema(),
  }

  return (
    <ClinicalLandingShell jsonLd={[pageJsonLd, buildFaqJsonLd(MENS_HEALTH_FAQS)]}>
      <PremiumHero
        badge="Men's Health · ED"
        headline="Tadalafil & Sildenafil"
        subheadline="Sildenafil from $39/mo and Tadalafil from $49/mo on quarterly billing—transparent cash-pay pricing."
        description="Sildenafil and tadalafil after a clinician licensed in your state reviews your intake. If approved, a pharmacy licensed in your state fills and ships the medication."
        highlight="Start your intake · Provider review · Pharmacy-compounded · Discreet delivery"
        primaryCta={{
          label: "Start your intake",
          href: ED_LANDING_URL,
          scrollTo: "#ed-troches",
        }}
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
                    <ServiceBuyButton href={buildEdProductUrl(formulation.id)} fullWidth label="Start your intake" />
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

      <TrustRibbon
        items={[
          {
            icon: "flask-conical",
            title: "Pharmacy Compounded",
            description: "ED troches prepared by licensed pharmacists",
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
        subtitle="From intake to a prescription filled in your state"
        steps={[
          {
            step: 1,
            title: "Review the medication",
            description: "Explore ED medication details and pricing, then start your secure intake.",
          },
          {
            step: 2,
            title: "Clinician review",
            description: "A clinician licensed in your state reviews your intake and decides whether a prescription is appropriate.",
          },
          {
            step: 3,
            title: "Pharmacy fulfillment",
            description: "If approved, a pharmacy licensed to dispense in your state fills and ships the medication.",
          },
        ]}
      />

      <FaqSection
        title="Tadalafil and Sildenafil FAQs"
        subtitle="ED medications and how they compare with brand-name products"
        items={MENS_HEALTH_FAQS}
      />

      <ContentSection>
        <SectionIntro
          eyebrow="Learn"
          title="Men's Health Guides"
          description="Educational articles on tadalafil, sildenafil, and how they compare with brand-name products."
        />
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/learn/tadalafil-vs-cialis">Tadalafil vs Cialis</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/learn/sildenafil-vs-viagra">Sildenafil vs Viagra</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/learn">All Learn articles</Link>
          </Button>
        </div>
      </ContentSection>

      <ContentSection id="hormone-therapy">
        <SectionIntro
          eyebrow="Hormone therapy"
          title="Testosterone therapy after a state-licensed review"
          description={HORMONE_THERAPY_CONTROLLED_NOTE}
        />
        <div className="mt-6">
          <Button asChild>
            <Link href="/mens-health/trt/start">Start your intake</Link>
          </Button>
        </div>
      </ContentSection>

      <PremiumDisclaimer>
        Compounded medications are prepared pursuant to a patient-specific prescription. Provider clinical
        evaluation is required. Individual results may vary.
      </PremiumDisclaimer>

      <PremiumCta
        icon="heart"
        title="Ready to Get Started?"
        description="Start your intake for ED medication. A clinician licensed in your state reviews it before a pharmacy licensed in your state fills an approved prescription."
        primaryCta={{
          label: "Start your intake",
          href: ED_LANDING_URL,
          scrollTo: "#ed-troches",
        }}
      />
    </ClinicalLandingShell>
  )
}
