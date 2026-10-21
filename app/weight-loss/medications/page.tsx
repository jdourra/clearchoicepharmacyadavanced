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
import { WEIGHT_LOSS_PROGRAMS } from "@/lib/weight-loss-catalog"

export const metadata: Metadata = {
  title: { absolute: "Weight Loss Medications in Michigan | Clear Choice Pharmacy" },
  description:
    "Compare provider-guided semaglutide and tirzepatide filled by a licensed partner pharmacy.",
  alternates: { canonical: `${SITE_URL}/weight-loss/medications` },
  openGraph: {
    title: "Weight Loss Medications in Michigan | Clear Choice Pharmacy",
    description:
      "Overview of semaglutide and tirzepatide filled by a licensed partner pharmacy.",
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
        subheadline="Semaglutide and tirzepatide, after a doctor reviews your intake."
        description="A licensed partner pharmacy fills semaglutide and tirzepatide after a doctor approves treatment. Clear Choice Pharmacy does not compound or ship these vials."
        highlight="Not a drug catalog search · Clinical evaluation required"
        primaryCta={{ label: "View Semaglutide kits", href: "/weight-loss/semaglutide" }}
        secondaryCta={{ label: "View Tirzepatide kits", href: "/weight-loss/tirzepatide" }}
      />

      <ContentSection>
        <SectionIntro
          eyebrow="Compare"
          title="Primary GLP-1 options"
          description="Both kits include doctor review. A licensed partner pharmacy compounds and ships the medication. Clear Choice Pharmacy does not compound or ship these vials."
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
                <span className="text-sm font-normal text-muted-foreground">/mo · 90-day</span>
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
                <span className="text-sm font-normal text-muted-foreground">/mo · 90-day</span>
              </p>
            )}
            <Button asChild className="w-fit">
              <Link href="/weight-loss/tirzepatide">Tirzepatide kit details</Link>
            </Button>
          </Card>
        </div>
      </ContentSection>

      <ContentSection>
        <SectionIntro
          eyebrow="Important"
          title="How to choose responsibly"
          description="Medication selection is a clinical decision. Start your intake after a provider reviews it."
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
