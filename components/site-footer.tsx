import Link from "next/link"
import { MapPin, Phone, Printer } from "lucide-react"
import { SiteLogo } from "@/components/site-logo"

export function SiteFooter() {
  return (
    <footer className="border-t py-10 bg-background">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
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
            <h3 className="font-semibold text-foreground">Patient portal</h3>
            <div className="flex flex-col gap-2 text-sm mb-4">
              <Link href="/account" className="text-muted-foreground hover:text-foreground transition-colors">
                Sign in / My account
              </Link>
              <Link href="/auth/sign-up" className="text-muted-foreground hover:text-foreground transition-colors">
                Create account
              </Link>
            </div>
            <h3 className="font-semibold text-foreground">Prescription prices</h3>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/prescriptions" className="text-muted-foreground hover:text-foreground transition-colors">
                Search medications
              </Link>
              <Link href="/medications" className="text-muted-foreground hover:text-foreground transition-colors">
                See medication costs
              </Link>
              <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Pricing formula
              </Link>
            </div>
          </div>

          <div className="space-y-3 md:col-span-1">
            <h3 className="font-semibold text-foreground">Services</h3>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/services" className="text-muted-foreground hover:text-foreground transition-colors">
                All services
              </Link>
              <Link href="/prescriptions" className="text-muted-foreground hover:text-foreground transition-colors">
                Low cost prescriptions
              </Link>
              <Link href="/weight-loss" className="text-muted-foreground hover:text-foreground transition-colors">
                GLP-1 weight loss
              </Link>
              <Link href="/mens-health" className="text-muted-foreground hover:text-foreground transition-colors">
                Men&apos;s health &amp; ED
              </Link>
              <Link href="/iv-rejuvenation" className="text-muted-foreground hover:text-foreground transition-colors">
                IV rejuvenation
              </Link>
              <Link href="/specialty-pharmacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Specialty medications
              </Link>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed pt-2">
              Transparent pharmacy for everyday prescriptions and specialized clinical care in Novi and Metro Detroit.
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
