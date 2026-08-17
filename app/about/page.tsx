import type { Metadata } from "next"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { SITE_URL, buildBreadcrumbJsonLd } from "@/lib/clinical-seo"
import { PHARMACY_PHONE_DISPLAY, PHARMACY_PHONE_TEL_HREF } from "@/lib/phone"

export const metadata: Metadata = {
  title: { absolute: "About Clear Choice Pharmacy | Medical Weight Loss & Compounding in Novi, MI" },
  description:
    "Clear Choice Pharmacy in Novi, Michigan provides provider-guided medical weight management and GLP-1 compounding, plus full-service prescriptions, specialty care, men's health, and IV therapy.",
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
              Clear Choice Pharmacy is a full-service compounding and retail pharmacy in Novi, Michigan. Our website
              focuses primarily on provider-guided medical weight management and GLP-1 care, while continuing to serve
              patients with everyday prescriptions and other clinical pharmacy services.
            </p>
          </div>
        </section>

        <section className="container max-w-3xl mx-auto px-4 py-12 space-y-8">
          <div>
            <h2 className="text-xl font-bold mb-3">What we do</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              We prepare patient-specific compounded medications—including Semaglutide and Tirzepatide kits when
              prescribed—and fill cash-pay and specialty prescriptions from our Novi location at 40890 Grand River Ave.
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
              ,{" "}
              <Link href="/iv-rejuvenation" className="text-primary hover:underline">
                mobile IV therapy
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
              A licensed clinician reviews telehealth intakes and decides whether a prescription is medically
              appropriate. Clear Choice Pharmacy compounds and dispenses medications pursuant to valid prescriptions for
              qualifying Michigan patients. We do not invent or advertise credentials beyond this factual workflow. For
              clinician identity used in current intake messaging, see program pages referencing the reviewing physician
              process.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-3">Location &amp; contact</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-2">
              40890 Grand River Ave, Novi, MI 48375
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
