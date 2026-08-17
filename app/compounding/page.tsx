import type { Metadata } from "next"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { SITE_URL, buildBreadcrumbJsonLd } from "@/lib/clinical-seo"

export const metadata: Metadata = {
  title: { absolute: "Compounding Pharmacy in Novi, MI | Clear Choice Pharmacy" },
  description:
    "Clear Choice Pharmacy compounds patient-specific medications in Novi, Michigan—including Semaglutide and Tirzepatide kits after clinician review—plus other customized pharmacy preparations.",
  alternates: { canonical: `${SITE_URL}/compounding` },
}

export default function CompoundingPage() {
  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Compounding", path: "/compounding" },
  ])

  return (
    <div className="flex min-h-screen flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b bg-slate-50">
          <div className="container max-w-3xl mx-auto px-4 py-12 md:py-16">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-2">Pharmacy services</p>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Compounding Pharmacy in Novi, MI</h1>
            <p className="text-muted-foreground leading-relaxed">
              Compounding prepares patient-specific medications pursuant to a valid prescription. Clear Choice Pharmacy
              compounds GLP-1 weight management kits and other customized formulations for qualifying Michigan patients.
            </p>
          </div>
        </section>

        <section className="container max-w-3xl mx-auto px-4 py-12 space-y-8">
          <div>
            <h2 className="text-xl font-bold mb-3">What compounding means</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A compounding pharmacy prepares medications tailored to an individual prescription—such as a specific
              strength, combination, or dosage form—when commercially available products may not meet that need. Compounded
              medications are not the same as FDA-approved brand-name finished products, even when they use related
              active ingredients.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3">Weight management compounding</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              For our{" "}
              <Link href="/weight-loss" className="text-primary hover:underline">
                medical weight loss program
              </Link>
              , compounded Semaglutide and Tirzepatide kits are prepared only after a licensed clinician reviews the
              patient intake and writes an appropriate prescription. Learn more about{" "}
              <Link href="/weight-loss/semaglutide" className="text-primary hover:underline">
                Semaglutide kits
              </Link>{" "}
              and{" "}
              <Link href="/weight-loss/tirzepatide" className="text-primary hover:underline">
                Tirzepatide kits
              </Link>
              .
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3">Other compounded services</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We also compound therapies related to{" "}
              <Link href="/mens-health" className="text-primary hover:underline">
                men&apos;s health
              </Link>{" "}
              and support{" "}
              <Link href="/iv-rejuvenation" className="text-primary hover:underline">
                IV and injectable wellness preparations
              </Link>{" "}
              under appropriate clinical pathways. Everyday retail prescriptions remain available via our{" "}
              <Link href="/prescriptions" className="text-primary hover:underline">
                cash-pay medication lookup
              </Link>
              .
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/weight-loss">Medical weight loss</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/contact">Contact the pharmacy</Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
