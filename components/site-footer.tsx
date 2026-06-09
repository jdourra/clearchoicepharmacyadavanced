import Link from "next/link"
import { MapPin, Phone, Printer } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t py-10 bg-background">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Clear Choice Pharmacy</h3>
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
              <a href="tel:248-987-6182" className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Phone className="h-4 w-4 shrink-0" />
                <span>(248) 987-6182</span>
              </a>
              <div className="flex items-center gap-2">
                <Printer className="h-4 w-4 shrink-0" />
                <span>Fax: (248) 987-4963</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Quick Links</h3>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="/medications" className="text-muted-foreground hover:text-foreground transition-colors">
                Medications
              </Link>
              <Link href="/mens-health" className="text-muted-foreground hover:text-foreground transition-colors">
                Men&apos;s Health
              </Link>
              <Link href="/weight-loss" className="text-muted-foreground hover:text-foreground transition-colors">
                Weight Loss
              </Link>
              <Link href="/iv-rejuvenation" className="text-muted-foreground hover:text-foreground transition-colors">
                IV Rejuvenation
              </Link>
              <Link href="/specialty-pharmacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Specialty Care
              </Link>
              <Link href="/auth/sign-up" className="text-muted-foreground hover:text-foreground transition-colors">
                Sign Up
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">About</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Clear Choice Pharmacy is your transparent, cash-pay pharmacy. No insurance middlemen, no hidden fees
              — just honest pricing on the medications you need.
            </p>
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
