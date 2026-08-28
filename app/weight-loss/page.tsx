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
import {
  SITE_URL,
  WEIGHT_LOSS_FAQS,
  buildBreadcrumbJsonLd,
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
  title: { absolute: "Semaglutide & Tirzepatide Weight Loss in Michigan | Clear Choice Pharmacy" },
  description:
    "Provider-guided Semaglutide and Tirzepatide weight management in Michigan. Compounded kits after clinician review, fulfilled by Clear Choice Pharmacy in Novi. Transparent cash-pay pricing.",
  alternates: {
    canonical: `${SITE_URL}/weight-loss`,
  },
  openGraph: {
    title: "Semaglutide & Tirzepatide Weight Loss in Michigan | Clear Choice Pharmacy",
    description:
      "Provider-guided Semaglutide and Tirzepatide kits for qualifying Michigan patients. Compounded in Novi after clinician review.",
    url: `${SITE_URL}/weight-loss`,
    type: "website",
  },
}

const glpBenefits = [
  "Custom Titration: Semaglutide and Tirzepatide formulations compounded to match your clinician's titration schedule.",
  "Transparent Pricing: Clear cash-pay kit pricing with physician review, supplies, and Michigan shipping or pickup included.",
  "Licensed Provider Review: Complete a secure online intake reviewed by a licensed clinician before any compounding.",
  "Structured Support: Provider-guided weight management designed to support healthy habits alongside medication when appropriate.",
]

export default function WeightLossPage() {
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: "Semaglutide & Tirzepatide Weight Loss in Michigan | Clear Choice Pharmacy",
    url: `${SITE_URL}/weight-loss`,
    description:
      "Provider-guided Semaglutide and Tirzepatide weight management at Clear Choice Pharmacy in Novi, MI.",
    about: [
      { "@type": "MedicalTherapy", name: "Medical Weight Management" },
      { "@type": "MedicalTherapy", name: "GLP-1 Weight Management" },
      { "@type": "MedicalTherapy", name: "Semaglutide Weight Management" },
      { "@type": "MedicalTherapy", name: "Tirzepatide Weight Management" },
    ],
    provider: pharmacyProviderSchema(),
  }

  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Medical Weight Loss", path: "/weight-loss" },
  ])

  return (
    <ClinicalLandingShell jsonLd={[pageJsonLd, buildFaqJsonLd(WEIGHT_LOSS_FAQS), breadcrumbs]}>
      <PremiumHero
        badge="Medical Weight Loss · Michigan"
        headline={
          <>
            <span className="block text-sky-300">Semaglutide</span>
            <span className="block text-sky-300">&amp; Tirzepatide</span>
            <span className="block mt-1 text-white text-[0.72em] sm:text-[0.78em] font-bold leading-tight">
              Weight Loss in Michigan
            </span>
          </>
        }
        subheadline="Provider-guided compounded kits from $134/mo after clinician review."
        description={
          "Clear Choice Pharmacy helps qualifying Michigan patients access structured weight management with pharmacy-compounded Semaglutide and Tirzepatide. A licensed clinician reviews your health history before any prescription is written. Individual results may vary."
        }
        highlight="Clinician review · Pharmacy compounded in Novi · Transparent cash-pay kits"
        heroImage={{
          src: "/images/home-hero-clinical.png",
          alt: "Licensed clinician supporting medical weight management at Clear Choice Pharmacy",
        }}
        primaryCta={{
          label: "View Semaglutide & Tirzepatide kits",
          href: PROGRAMS_URL,
          scrollTo: "#programs",
        }}
        secondaryCta={{ label: "How the program works", href: "#how-it-works", scrollTo: "#how-it-works" }}
      />

      <ContentSection id="what-is">
        <SectionIntro
          eyebrow="Overview"
          title="What is medical weight management?"
          description="Medical weight management combines clinical evaluation with evidence-informed therapies—such as GLP-1 medications when appropriate—alongside lifestyle support. It is not a guarantee of weight loss and is not right for everyone."
        />
        <div className="mt-6 prose prose-sm max-w-3xl text-muted-foreground">
          <p>
            At Clear Choice Pharmacy, the pathway starts with an online intake. A licensed clinician reviews your
            information and decides whether a prescription is appropriate. If approved, our Novi pharmacy compounds and
            fulfills patient-specific Semaglutide or Tirzepatide kits for Michigan patients. Learn more about{" "}
            <Link href="/weight-loss/glp-1" className="text-primary hover:underline">
              GLP-1 weight management
            </Link>
            ,{" "}
            <Link href="/weight-loss/medications" className="text-primary hover:underline">
              medication options
            </Link>
            , or the{" "}
            <Link href="/weight-loss/faq" className="text-primary hover:underline">
              weight loss FAQ
            </Link>
            .
          </p>
        </div>
      </ContentSection>

      <ContentSection id="programs">
        <SectionIntro
          eyebrow="Medication options"
          title="Semaglutide, Tirzepatide & MIC + B12"
          description="All-in kit pricing includes clinician review, compounding, supplies, and Michigan shipping or pickup. No separate membership fee. Individual results may vary."
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
                  <h3 className="text-3xl md:text-4xl font-bold tracking-tight">{program.name}</h3>
                  <p className="text-sm text-primary font-medium mt-1">{program.subtitle}</p>
                  <p className="text-sm text-muted-foreground mt-3 flex-1">{program.description}</p>
                  <div className="mt-5 pt-4 border-t space-y-2">
                    <p className="text-3xl font-bold text-primary">
                      from {formatUsd(range.fromQuarterly)}
                      <span className="text-base font-normal text-muted-foreground">/mo · 60-day</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Monthly from {formatUsd(range.fromMonthly)} · up to {formatUsd(range.toMonthly)} by weekly dose
                    </p>
                    {savePct > 0 && (
                      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                        Save ~{savePct}% vs monthly on 60-day starter kits
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
              <h3 className="text-xl font-bold">MIC + B12 Metabolic Support</h3>
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
          title="Transparent Semaglutide & Tirzepatide pricing"
          body="Many cash-pay telehealth ads quote low starter prices that rise at maintenance or add membership fees. Our kits show starter-to-maintenance pricing up front, include provider review and supplies, and are compounded in Novi for Michigan patients—no separate membership fee."
        />
        <p className="text-xs text-muted-foreground mt-4">
          Prescription required after provider review. Kit price reflects prescribed dose strength (4 weekly injections).
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/weight-loss/semaglutide">Semaglutide details</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/weight-loss/tirzepatide">Tirzepatide details</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/weight-loss/medications">Compare medications</Link>
          </Button>
        </div>
      </ContentSection>

      <TrustRibbon
        items={[
          {
            icon: "flask-conical",
            title: "Pharmacy Compounded",
            description: "Patient-specific Semaglutide & Tirzepatide prepared in Novi",
          },
          {
            icon: "activity",
            title: "Clinical Oversight",
            description: "Licensed clinician review before any prescription",
          },
          {
            icon: "sparkles",
            title: "Custom Titration",
            description: "Formulations matched to your treatment schedule",
          },
          {
            icon: "shield",
            title: "Transparent Pricing",
            description: "Upfront cash-pay pricing with no hidden membership fee",
          },
        ]}
      />

      <ContentSection id="benefits">
        <SectionIntro
          eyebrow="GLP-1 therapies"
          title="How GLP-1 medications support weight management"
          description="GLP-1 receptor agonists may help regulate appetite and support metabolic health under clinician supervision. They are prescription therapies—not over-the-counter supplements."
        />
        <BenefitList items={glpBenefits} />
        <p className="mt-6 text-sm text-muted-foreground">
          Read our{" "}
          <Link href="/weight-loss/glp-1" className="text-primary hover:underline">
            GLP-1 weight management overview
          </Link>{" "}
          for a deeper explanation of how these medications work and what to expect during evaluation.
        </p>
      </ContentSection>

      <ContentSection id="eligibility" tone="muted">
        <SectionIntro
          eyebrow="Eligibility"
          title="Who may be a candidate"
          description="Eligibility is determined by a licensed clinician after reviewing your intake—not by an online quiz alone."
        />
        <div className="mt-6 prose prose-sm max-w-3xl text-muted-foreground">
          <p>
            Providers commonly consider BMI, weight-related conditions, medication history, and contraindications.
            Patients with certain thyroid cancer histories, MEN2, pregnancy, or other exclusion criteria are generally
            not candidates. Your clinician decides whether Semaglutide, Tirzepatide, or another approach is appropriate.
          </p>
          <p>
            See the{" "}
            <Link href="/weight-loss/faq" className="text-primary hover:underline">
              medical weight loss FAQ
            </Link>{" "}
            for common questions about eligibility, pricing, and brand-name comparisons.
          </p>
        </div>
      </ContentSection>

      <ProcessSteps
        id="how-it-works"
        title="How our medical weight loss program works"
        subtitle="Four clear steps from kit selection to pharmacy fulfillment"
        steps={[
          {
            step: 1,
            title: "Choose a kit",
            description:
              "Review Semaglutide or Tirzepatide kit details, weekly dose options, and transparent cash-pay pricing.",
          },
          {
            step: 2,
            title: "Complete intake & ID",
            description:
              "Submit a secure health questionnaire and upload photo ID. Payment is collected at the pharmacy after clinician approval.",
          },
          {
            step: 3,
            title: "Clinician evaluation",
            description:
              "A licensed clinician reviews your information, may request follow-up, and decides whether to prescribe.",
          },
          {
            step: 4,
            title: "Pharmacy fulfillment",
            description:
              "If approved, Clear Choice Pharmacy compounds your kit and ships or prepares pickup for Michigan patients.",
          },
        ]}
      />

      <ContentSection id="roles">
        <SectionIntro
          eyebrow="Trust & roles"
          title="Pharmacy vs prescribing clinician"
          description="Clear Choice Pharmacy compounds and dispenses medications. A licensed clinician evaluates medical appropriateness and writes the prescription when indicated."
        />
        <FeatureGrid
          items={[
            {
              icon: "file-check",
              title: "Clinician review",
              description: "Intake screening, eligibility decisions, and prescription authority remain with licensed providers.",
            },
            {
              icon: "flask-conical",
              title: "Pharmacy compounding",
              description: "Patient-specific preparations, quality controls, and Michigan fulfillment from our Novi pharmacy.",
            },
            {
              icon: "shield",
              title: "Informed consent",
              description: "You review telehealth, compounding, and refund disclosures before submitting your intake.",
            },
          ]}
        />
      </ContentSection>

      <ContentSection id="mic-b12" tone="muted">
        <SectionIntro
          eyebrow="Metabolic support"
          title="How MIC + B12 supports weight management"
          description="A lipotropic injection kit that supports metabolic wellness and energy—on its own or alongside GLP-1 therapy under provider guidance."
        />
        <BenefitList
          items={MIC_B12_HOW_IT_WORKS.map(({ title, description }) => `${title}: ${description}`)}
        />
      </ContentSection>

      <ContentSection id="michigan">
        <SectionIntro
          eyebrow="Local care"
          title="Medical weight loss in Michigan"
          description="Programs are available to qualifying Michigan patients. Clear Choice Pharmacy is located in Novi and commonly serves Metro Detroit communities."
        />
        <p className="mt-4 text-sm text-muted-foreground max-w-3xl leading-relaxed">
          Patients from Novi, Northville, Farmington Hills, Wixom, South Lyon, Livonia, Canton, Plymouth, and nearby
          communities can complete telehealth intake online. Dispensing is currently limited to Michigan.{" "}
          <Link href="/contact" className="text-primary hover:underline">
            Contact the pharmacy
          </Link>{" "}
          or{" "}
          <Link href="/about" className="text-primary hover:underline">
            learn more about Clear Choice
          </Link>
          .
        </p>
      </ContentSection>

      <FaqSection
        id="faq"
        title="Medical weight loss FAQ"
        subtitle="Eligibility, pricing, Semaglutide vs Tirzepatide, and brand comparisons"
        items={WEIGHT_LOSS_FAQS}
      />
      <div className="container max-w-5xl mx-auto px-4 -mt-8 mb-8">
        <Link href="/weight-loss/faq" className="text-sm text-primary hover:underline">
          View the full weight loss FAQ page
        </Link>
      </div>

      <ContentSection>
        <SectionIntro
          eyebrow="Learn"
          title="Weight management guides"
          description="Educational articles on Semaglutide, Tirzepatide, and how compounded GLP-1 compares to brand-name options."
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
            <Link href="/learn/compounded-semaglutide-vs-ozempic">Compounded vs Ozempic</Link>
          </Button>
        </div>
      </ContentSection>

      <PremiumDisclaimer>
        GLP-1 therapies require a valid prescription and clinical evaluation. Compounded medications are prepared
        pursuant to a patient-specific prescription and are not FDA-approved brand products. Individual results may
        vary. This page is for informational purposes and does not replace medical advice from your provider.
      </PremiumDisclaimer>

      <PremiumCta
        icon="scale"
        title="Explore medical weight loss kits"
        description="Review Semaglutide and Tirzepatide options for provider-guided weight management through Clear Choice Pharmacy."
        primaryCta={{
          label: "Shop GLP programs",
          href: "/weight-loss#programs",
        }}
        secondaryCta={{
          label: "GLP-1 overview",
          href: "/weight-loss/glp-1",
        }}
      />
    </ClinicalLandingShell>
  )
}
