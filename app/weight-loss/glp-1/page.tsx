import type { Metadata } from "next"
import Link from "next/link"
import {
  BenefitList,
  ClinicalLandingShell,
  ContentSection,
  PremiumCta,
  PremiumDisclaimer,
  PremiumHero,
  SectionIntro,
} from "@/components/clinical-landing-shell"
import { Button } from "@/components/ui/button"
import { SITE_URL, buildBreadcrumbJsonLd } from "@/lib/clinical-seo"

export const metadata: Metadata = {
  title: { absolute: "GLP-1 Weight Management in Michigan | Clear Choice Pharmacy" },
  description:
    "Learn how GLP-1 medications support provider-guided weight management. Clear Choice Pharmacy compounds Semaglutide and Tirzepatide for qualifying Michigan patients after clinician review.",
  alternates: { canonical: `${SITE_URL}/weight-loss/glp-1` },
  openGraph: {
    title: "GLP-1 Weight Management in Michigan | Clear Choice Pharmacy",
    description:
      "Educational overview of GLP-1 therapies for weight management, plus how Clear Choice Pharmacy supports Michigan patients.",
    url: `${SITE_URL}/weight-loss/glp-1`,
    type: "website",
  },
}

export default function Glp1Page() {
  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Medical Weight Loss", path: "/weight-loss" },
    { name: "GLP-1", path: "/weight-loss/glp-1" },
  ])

  return (
    <ClinicalLandingShell jsonLd={[breadcrumbs]}>
      <PremiumHero
        badge="GLP-1 education"
        headline="GLP-1 Weight Management in Michigan"
        subheadline="How glucagon-like peptide-1 therapies fit into provider-guided care."
        description="GLP-1 receptor agonists are prescription medications used under clinician supervision for weight management and related metabolic care. Clear Choice Pharmacy compounds patient-specific Semaglutide and Tirzepatide after a licensed clinician reviews your intake."
        highlight="Educational overview · Not medical advice · Michigan pharmacy fulfillment"
        primaryCta={{ label: "View medical weight loss program", href: "/weight-loss" }}
        secondaryCta={{ label: "Compare medications", href: "/weight-loss/medications" }}
      />

      <ContentSection>
        <SectionIntro
          eyebrow="Basics"
          title="What are GLP-1 medications?"
          description="GLP-1 receptor agonists mimic a hormone involved in appetite regulation and glucose control. They are not over-the-counter supplements and require a prescription."
        />
        <div className="mt-6 prose prose-sm max-w-3xl text-muted-foreground space-y-4">
          <p>
            When clinically appropriate, GLP-1 therapies may help patients feel fuller sooner and support reduced calorie
            intake as part of a broader plan that includes nutrition, activity, and follow-up. Individual responses vary,
            and these medications are not appropriate for everyone.
          </p>
          <p>
            Brand-name products patients often research include Ozempic and Wegovy (Semaglutide) and Mounjaro and Zepbound
            (Tirzepatide). Clear Choice Pharmacy compounds Semaglutide and Tirzepatide pursuant to patient-specific
            prescriptions. Compounded medications are not the same as FDA-approved brand products.
          </p>
        </div>
      </ContentSection>

      <ContentSection tone="muted">
        <SectionIntro
          eyebrow="Options"
          title="Semaglutide and Tirzepatide"
          description="Both are once-weekly injectable options used under clinician supervision. Your provider recommends the pathway that fits your clinical profile."
        />
        <BenefitList
          items={[
            "Semaglutide: GLP-1 receptor agonist pathway used in provider-guided weight management kits at Clear Choice Pharmacy.",
            "Tirzepatide: Dual GLP-1/GIP pathway option when a clinician determines it is appropriate.",
            "Evaluation first: Intake, photo ID, and clinician review occur before any compounding or charge capture.",
            "Pharmacy role: Clear Choice compounds and fulfills approved kits for qualifying Michigan patients from Novi.",
          ]}
        />
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/weight-loss/semaglutide">Semaglutide kits</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/weight-loss/tirzepatide">Tirzepatide kits</Link>
          </Button>
        </div>
      </ContentSection>

      <ContentSection>
        <SectionIntro
          eyebrow="Expectations"
          title="What to expect"
          description="Starting a GLP-1 medication involves clinical screening, titration, and monitoring for side effects—especially gastrointestinal symptoms during dose increases."
        />
        <div className="mt-6 prose prose-sm max-w-3xl text-muted-foreground space-y-4">
          <p>
            Your clinician sets the starting dose and titration plan. Many patients experience nausea, fullness, or other
            GI effects early on; report concerning symptoms promptly. Serious risks are uncommon but require medical
            evaluation if they occur.
          </p>
          <p>
            For program steps, pricing, and eligibility, return to the{" "}
            <Link href="/weight-loss" className="text-primary hover:underline">
              medical weight loss program page
            </Link>{" "}
            or read the{" "}
            <Link href="/weight-loss/faq" className="text-primary hover:underline">
              weight loss FAQ
            </Link>
            .
          </p>
        </div>
      </ContentSection>

      <PremiumDisclaimer>
        This page is educational and does not replace advice from your licensed clinician. GLP-1 therapies require a
        valid prescription. Compounded medications are prepared pursuant to a patient-specific prescription. Individual
        results may vary.
      </PremiumDisclaimer>

      <PremiumCta
        icon="scale"
        title="Continue to the medical weight loss program"
        description="Review kits, pricing, and how provider-guided care works at Clear Choice Pharmacy."
        primaryCta={{ label: "Medical weight loss overview", href: "/weight-loss" }}
        secondaryCta={{ label: "Weight loss FAQ", href: "/weight-loss/faq" }}
      />
    </ClinicalLandingShell>
  )
}
