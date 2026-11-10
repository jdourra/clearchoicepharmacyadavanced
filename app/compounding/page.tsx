import type { Metadata } from "next"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { SITE_URL, buildBreadcrumbJsonLd } from "@/lib/clinical-seo"

export const metadata: Metadata = {
  title: { absolute: "Compounded Medications | Clear Choice Pharmacy" },
  description:
    "Clear Choice Pharmacy is licensed in Michigan only and does not compound or dispense compounded medications. Ola Health reviews those intakes. RxAve fulfills approved 503A prescriptions.",
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
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Compounded medications</h1>
            <p className="text-muted-foreground leading-relaxed">
              Clear Choice Pharmacy is licensed in Michigan only. It does not compound or dispense compounded
              medications. Ola Health reviews the intake. If treatment is approved, RxAve fulfills and ships the 503A
              prescription, including semaglutide, tirzepatide, ED troches, and hormone therapy.
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
              , Ola Health reviews the intake. If a prescription is approved, RxAve fulfills and ships the semaglutide or
              tirzepatide. Clear Choice Pharmacy does not compound or dispense those vials. Learn
              more about{" "}
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
              ED troches are handled the same way as weight loss: Ola Health reviews the intake and RxAve fulfills an
              approved prescription. See{" "}
              <Link href="/mens-health" className="text-primary hover:underline">
                sildenafil and tadalafil
              </Link>
              . Non-compounded retail prescriptions for Michigan patients remain available via our{" "}
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
