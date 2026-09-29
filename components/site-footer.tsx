import Link from "next/link"
import { MapPin, Phone, Printer } from "lucide-react"
import { SiteLogo } from "@/components/site-logo"
import {
  PHARMACY_FAX_DISPLAY,
  PHARMACY_PHONE_DISPLAY,
  PHARMACY_PHONE_TEL_HREF,
} from "@/lib/phone"

export function SiteFooter() {
  return (
    <footer className="border-t py-10 bg-background">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <SiteLogo href="/" height={72} />
            <div className="space-y-2 text-sm text-muted-foreground">
              <a
                href="https://maps.google.com/?q=40890+Grand+River+Ave,+Novi,+MI+48375"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 hover:text-foreground transition-colors"
              >
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  40890 Grand River Ave
                  <br />
                  Novi, MI 48375
                </span>
              </a>
              <a href={PHARMACY_PHONE_TEL_HREF} className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Phone className="h-4 w-4 shrink-0" />
                <span>{PHARMACY_PHONE_DISPLAY}</span>
              </a>
              <div className="flex items-center gap-2">
                <Printer className="h-4 w-4 shrink-0" />
                <span>Fax: {PHARMACY_FAX_DISPLAY}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed pt-1">
              Michigan pharmacy focused on provider-reviewed ED medication, low-cost prescriptions, and patient-specific
              compounding.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">ED Medications</h3>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/mens-health#ed-troches" className="text-muted-foreground hover:text-foreground transition-colors">
                ED medication overview
              </Link>
              <Link
                href="/mens-health/ed/sildenafil-fast"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Sildenafil troches
              </Link>
              <Link
                href="/mens-health/ed/tadalafil-daily"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Tadalafil troches
              </Link>
              <Link
                href="/mens-health/ed/combination-troche"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Combination ED troches
              </Link>
              <Link
                href="/sildenafil"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Low cost Sildenafil tablets
              </Link>
              <Link href="/tadalafil" className="text-muted-foreground hover:text-foreground transition-colors">
                Low cost Tadalafil tablets
              </Link>
              <Link href="/learn" className="text-muted-foreground hover:text-foreground transition-colors">
                ED medication guides
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Pharmacy services</h3>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/prescriptions" className="text-muted-foreground hover:text-foreground transition-colors">
                Low cost prescription drugs
              </Link>
              <Link href="/compounding" className="text-muted-foreground hover:text-foreground transition-colors">
                Compounding
              </Link>
              <Link href="/specialty-pharmacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Specialty pharmacy
              </Link>
              <Link href="/mens-health" className="text-muted-foreground hover:text-foreground transition-colors">
                Men&apos;s health
              </Link>
              <Link href="/iv-rejuvenation" className="text-muted-foreground hover:text-foreground transition-colors">
                Mobile IV therapy
              </Link>
              <Link href="/services" className="text-muted-foreground hover:text-foreground transition-colors">
                All services
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">About &amp; support</h3>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                About Clear Choice Pharmacy
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
              <Link href="/account" className="text-muted-foreground hover:text-foreground transition-colors">
                Patient portal
              </Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy policy
              </Link>
              <Link
                href="/terms-and-conditions"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms
              </Link>
              <Link href="/refund-policy" className="text-muted-foreground hover:text-foreground transition-colors">
                Refund policy
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <p className="text-sm text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} Clear Choice Pharmacy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
