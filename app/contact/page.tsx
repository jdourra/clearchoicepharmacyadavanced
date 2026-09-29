import type { Metadata } from "next"
import Link from "next/link"
import { MapPin, Phone, Printer } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { SITE_URL, buildBreadcrumbJsonLd } from "@/lib/clinical-seo"
import {
  PHARMACY_FAX_DISPLAY,
  PHARMACY_PHONE_DISPLAY,
  PHARMACY_PHONE_TEL_HREF,
} from "@/lib/phone"

export const metadata: Metadata = {
  title: { absolute: "Contact Clear Choice Pharmacy | Novi, Michigan" },
  description:
    "Contact Clear Choice Pharmacy in Novi, MI for medical weight loss questions, prescriptions, compounding, and pharmacy support. Call (248) 987-6182.",
  alternates: { canonical: `${SITE_URL}/contact` },
}

export default function ContactPage() {
  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Contact", path: "/contact" },
  ])

  return (
    <div className="flex min-h-screen flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b bg-slate-50">
          <div className="container max-w-3xl mx-auto px-4 py-12 md:py-16">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-2">Contact</p>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Contact Clear Choice Pharmacy</h1>
            <p className="text-muted-foreground leading-relaxed">
              Reach our Novi pharmacy team about medical weight management programs, prescriptions, compounding, or
              specialty care. We currently dispense clinical weight management kits to Michigan patients.
            </p>
          </div>
        </section>

        <section className="container max-w-3xl mx-auto px-4 py-12 grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Pharmacy details</h2>
            <a
              href="https://maps.google.com/?q=40890+Grand+River+Ave,+Novi,+MI+48375"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 text-sm text-muted-foreground hover:text-foreground"
            >
              <MapPin className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <span>
                40890 Grand River Ave
                <br />
                Novi, MI 48375
              </span>
            </a>
            <a href={PHARMACY_PHONE_TEL_HREF} className="flex items-center gap-3 text-sm hover:text-primary">
              <Phone className="h-5 w-5 shrink-0 text-primary" />
              {PHARMACY_PHONE_DISPLAY}
            </a>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Printer className="h-5 w-5 shrink-0 text-primary" />
              Fax: {PHARMACY_FAX_DISPLAY}
            </div>
            <p className="text-sm text-muted-foreground pt-2">
              Hours (general): Mon–Fri 9:00 a.m.–6:00 p.m.; Sat 10:00 a.m.–2:00 p.m. Please call to confirm.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold">Helpful links</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/weight-loss" className="text-primary hover:underline">
                  Medical weight loss program
                </Link>
              </li>
              <li>
                <Link href="/weight-loss/faq" className="text-primary hover:underline">
                  Weight loss FAQ
                </Link>
              </li>
              <li>
                <Link href="/prescriptions" className="text-primary hover:underline">
                  Prescription price lookup
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-primary hover:underline">
                  About the pharmacy
                </Link>
              </li>
              <li>
                <Link href="/account" className="text-primary hover:underline">
                  Patient portal
                </Link>
              </li>
            </ul>
            <Button asChild className="mt-4">
              <a href={PHARMACY_PHONE_TEL_HREF}>Call {PHARMACY_PHONE_DISPLAY}</a>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
