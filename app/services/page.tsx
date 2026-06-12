import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ClinicalServicesGrid } from "@/components/clinical-services-grid"
import { Button } from "@/components/ui/button"
import { SITE_URL } from "@/lib/clinical-seo"

export const metadata: Metadata = {
  title: "Clinical Programs | Clear Choice Pharmacy",
  description:
    "Clear Choice clinical programs in Novi and Metro Detroit: GLP-1 weight loss, men's health ED compounding, mobile IV rejuvenation, and specialty pharmacy care with prior authorization support.",
  alternates: {
    canonical: `${SITE_URL}/services`,
  },
  openGraph: {
    title: "Clinical Programs | Clear Choice Pharmacy",
    description:
      "GLP-1 weight loss, ED troches, mobile IV therapy, and specialty medications—all from Clear Choice Pharmacy in Novi, MI.",
    url: `${SITE_URL}/services`,
    type: "website",
  },
}

export default function ServicesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 py-12 md:py-16">
        <div className="container max-w-4xl mx-auto px-4">
          <Button asChild variant="ghost" className="mb-6">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to home
            </Link>
          </Button>

          <div className="text-center mb-10">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-2">Clear Choice Health</p>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Clinical Programs</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Specialized care compounded and coordinated by Clear Choice Pharmacy in Novi, MI. Each program has a
              clear path—online consultation, provider review, and pharmacy fulfillment.
            </p>
          </div>

          <ClinicalServicesGrid showViewAll={false} />

          <div className="mt-12 rounded-lg border bg-muted/40 p-6 text-center">
            <h2 className="font-semibold text-lg mb-2">Looking for everyday prescription prices?</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Search 6,000+ medications with transparent cash-pay pricing—Drug Cost + 15% + $5.
            </p>
            <Button asChild>
              <Link href="/">Search prescription prices</Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
