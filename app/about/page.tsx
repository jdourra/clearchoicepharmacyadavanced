import type { Metadata } from "next"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { SITE_URL, buildBreadcrumbJsonLd } from "@/lib/clinical-seo"
import { PHARMACY_PHONE_DISPLAY, PHARMACY_PHONE_TEL_HREF } from "@/lib/phone"

export const metadata: Metadata = {
  title: { absolute: "About Clear Choice Pharmacy | Medical Weight Loss & Compounding in Westland, MI" },
  description:
    "LNR Associates LLC, doing business as Clear Choice Pharmacy in Westland, Michigan. Michigan pharmacy license 5301013716. Pharmacist-in-charge Joseph Dourra.",
  alternates: { canonical: `${SITE_URL}/about` },
}

export default function AboutPage() {
  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
  ])

  return (
    <div className="flex min-h-screen flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b bg-slate-50">
          <div className="container max-w-3xl mx-auto px-4 py-12 md:py-16">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-2">About us</p>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">About Clear Choice Pharmacy</h1>
            <p className="text-muted-foreground leading-relaxed">
              LNR Associates LLC does business as Clear Choice Pharmacy, a compounding and retail pharmacy in Westland,
              Michigan. Michigan pharmacy license 5301013716. Pharmacist-in-charge: Joseph Dourra. We dispense
              prescriptions to Michigan patients. Approved semaglutide and tirzepatide are filled and shipped by a
              licensed partner pharmacy, not by Clear Choice.
            </p>
          </div>
        </section>

        <section className="container max-w-3xl mx-auto px-4 py-12 space-y-8">
          <div>
            <h2 className="text-xl font-bold mb-3">What we do</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              From 8278 N Merriman Rd we fill cash-pay and specialty prescriptions and compound other patient-specific
              medications for Michigan patients. Semaglutide and tirzepatide weight-loss vials are not compounded or
              shipped from this pharmacy. A licensed partner pharmacy fills those after a doctor approves the intake.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Primary clinical focus on this site:{" "}
              <Link href="/weight-loss" className="text-primary hover:underline">
                medical weight loss and GLP-1 care
              </Link>
              . Secondary services include{" "}
              <Link href="/prescriptions" className="text-primary hover:underline">
                low cost prescriptions
              </Link>
              ,{" "}
              <Link href="/compounding" className="text-primary hover:underline">
                compounding
              </Link>
              ,{" "}
              <Link href="/mens-health" className="text-primary hover:underline">
                men&apos;s health
              </Link>
              , and{" "}
              <Link href="/specialty-pharmacy" className="text-primary hover:underline">
                specialty pharmacy
              </Link>
              .
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3">Pharmacy vs prescribing clinician</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A licensed doctor reviews a weight-loss intake and decides whether a prescription is appropriate. If it
              is approved, a licensed partner pharmacy compounds and ships the semaglutide or tirzepatide. Clear Choice
              Pharmacy collects the intake and the payment for that program and does not dispense the vial. Other
              prescriptions we fill are dispensed by Clear Choice Pharmacy to Michigan patients under Michigan pharmacy
              license 5301013716.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3">Location &amp; contact</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-2">
              8278 N Merriman Rd, Westland, MI 48185
              <br />
              Phone:{" "}
              <a href={PHARMACY_PHONE_TEL_HREF} className="text-primary hover:underline">
                {PHARMACY_PHONE_DISPLAY}
              </a>
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Hours (general): Monday–Friday 9:00 a.m.–6:00 p.m.; Saturday 10:00 a.m.–2:00 p.m. Confirm current hours by
              phone.
            </p>
            <Button asChild>
              <Link href="/contact">Contact page</Link>
            </Button>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3">Policies</h2>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="text-primary hover:underline">
                  Terms and conditions
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="text-primary hover:underline">
                  Refund policy
                </Link>
              </li>
              <li>
                <Link href="/telehealth-consent" className="text-primary hover:underline">
                  Telehealth consent
                </Link>
              </li>
            </ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
