import type { Metadata } from "next"
import Link from "next/link"
import {
  ClinicalLandingShell,
  ContentSection,
  FeatureGrid,
  PremiumCta,
  PremiumDisclaimer,
  PremiumHero,
  SectionIntro,
} from "@/components/clinical-landing-shell"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SITE_URL, buildBreadcrumbJsonLd } from "@/lib/clinical-seo"
import { formatUsd, getWeightLossPriceRange } from "@/lib/pricing-clarity"
import { MIC_B12_WEIGHT_LOSS, WEIGHT_LOSS_PROGRAMS } from "@/lib/weight-loss-catalog"

export const metadata: Metadata = {
  title: { absolute: "Weight Loss Medications in Michigan | Clear Choice Pharmacy" },
  description:
    "Compare provider-guided Semaglutide, Tirzepatide, and MIC + B12 metabolic support options compounded for qualifying Michigan patients at Clear Choice Pharmacy.",
  alternates: { canonical: `${SITE_URL}/weight-loss/medications` },
  openGraph: {
    title: "Weight Loss Medications in Michigan | Clear Choice Pharmacy",
    description:
      "Overview of Semaglutide, Tirzepatide, and MIC + B12 options for provider-guided weight management in Michigan.",
    url: `${SITE_URL}/weight-loss/medications`,
    type: "website",
  },
}

export default function WeightLossMedicationsPage() {
  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Medical Weight Loss", path: "/weight-loss" },
    { name: "Medications", path: "/weight-loss/medications" },
  ])

  const sema = WEIGHT_LOSS_PROGRAMS.find((p) => p.id === "semaglutide")
  const tirz = WEIGHT_LOSS_PROGRAMS.find((p) => p.id === "tirzepatide")
  const semaRange = sema ? getWeightLossPriceRange(sema) : null
  const tirzRange = tirz ? getWeightLossPriceRange(tirz) : null

  return (
    <ClinicalLandingShell jsonLd={[breadcrumbs]}>
      <PremiumHero
        badge="Medication options"
        headline="Weight Loss Medications in Michigan"
        subheadline="Semaglutide, Tirzepatide, and metabolic support—after clinician review."
        description="Use this page to compare the therapies Clear Choice Pharmacy compounds for qualifying Michigan patients. Your licensed clinician decides which option, if any, is appropriate."
        highlight="Not a drug catalog search · Clinical evaluation required"
        primaryCta={{ label: "View Semaglutide kits", href: "/weight-loss/semaglutide" }}
        secondaryCta={{ label: "View Tirzepatide kits", href: "/weight-loss/tirzepatide" }}
      />

      <ContentSection>
        <SectionIntro
          eyebrow="Compare"
          title="Primary GLP-1 options"
          description="Both kits include clinician review, compounding, supplies, and Michigan shipping or pickup when prescribed."
        />
        <div className="mt-8 grid md:grid-cols-2 gap-4">
          <Card className="p-6 flex flex-col">
            <h3 className="text-xl font-bold mb-1">Semaglutide</h3>
            <p className="text-sm text-primary font-medium mb-3">GLP-1 receptor agonist</p>
            <p className="text-sm text-muted-foreground mb-4 flex-1">
              Once-weekly injectable therapy for provider-guided weight management. Patients often compare the active
              ingredient class to brand-name Ozempic and Wegovy. Compounded Semaglutide is not those brand products.
            </p>
            {semaRange && (
              <p className="text-lg font-semibold mb-4">
                from {formatUsd(semaRange.fromQuarterly)}
                <span className="text-sm font-normal text-muted-foreground">/mo · 60-day</span>
              </p>
            )}
            <Button asChild className="w-fit">
              <Link href="/weight-loss/semaglutide">Semaglutide kit details</Link>
            </Button>
          </Card>
          <Card className="p-6 flex flex-col">
            <h3 className="text-xl font-bold mb-1">Tirzepatide</h3>
            <p className="text-sm text-primary font-medium mb-3">Dual GLP-1 / GIP pathway</p>
            <p className="text-sm text-muted-foreground mb-4 flex-1">
              Once-weekly injectable therapy when a clinician recommends dual-pathway support. Patients often compare
              the active ingredient class to brand-name Mounjaro and Zepbound. Compounded Tirzepatide is not those brand
              products.
            </p>
            {tirzRange && (
              <p className="text-lg font-semibold mb-4">
                from {formatUsd(tirzRange.fromQuarterly)}
                <span className="text-sm font-normal text-muted-foreground">/mo · 60-day</span>
              </p>
            )}
            <Button asChild className="w-fit">
              <Link href="/weight-loss/tirzepatide">Tirzepatide kit details</Link>
            </Button>
          </Card>
        </div>
      </ContentSection>

      <ContentSection tone="muted">
        <SectionIntro
          eyebrow="Supportive option"
          title="MIC + B12 metabolic support"
          description={`${MIC_B12_WEIGHT_LOSS.description} Priced at $${MIC_B12_WEIGHT_LOSS.price} per kit.`}
        />
        <Button asChild variant="outline" className="mt-6">
          <Link href={`/iv-rejuvenation/vials/${MIC_B12_WEIGHT_LOSS.id}`}>MIC + B12 kit details</Link>
        </Button>
      </ContentSection>

      <ContentSection>
        <SectionIntro
          eyebrow="Important"
          title="How to choose responsibly"
          description="Medication selection is a clinical decision—not a shopping preference alone."
        />
        <FeatureGrid
          items={[
            {
              icon: "file-check",
              title: "Clinician decides",
              description: "Eligibility, contraindications, and dose plans are determined after intake review.",
            },
            {
              icon: "shield",
              title: "Brand clarity",
              description: "Compounded preparations are not FDA-approved brand-name Ozempic, Wegovy, Zepbound, or Mounjaro.",
            },
            {
              icon: "activity",
              title: "Results vary",
              description: "Outcomes depend on clinical factors and lifestyle. No therapy guarantees weight loss.",
            },
          ]}
        />
        <p className="mt-8 text-sm text-muted-foreground">
          Looking for everyday generic tablets instead? Use our{" "}
          <Link href="/medications" className="text-primary hover:underline">
            medication price lookup
          </Link>{" "}
          (separate from this clinical weight management program).
        </p>
      </ContentSection>

      <PremiumDisclaimer>
        This comparison page is informational. A valid prescription and clinical evaluation are required. Individual
        results may vary.
      </PremiumDisclaimer>

      <PremiumCta
        icon="scale"
        title="Return to the medical weight loss program"
        description="See how provider-guided care works end to end at Clear Choice Pharmacy."
        primaryCta={{ label: "Medical weight loss overview", href: "/weight-loss" }}
        secondaryCta={{ label: "GLP-1 overview", href: "/weight-loss/glp-1" }}
      />
    </ClinicalLandingShell>
  )
}
