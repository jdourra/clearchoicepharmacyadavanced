import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ClinicalServicesGrid } from "@/components/clinical-services-grid"
import { Button } from "@/components/ui/button"
import { SITE_URL } from "@/lib/clinical-seo"

export const metadata: Metadata = {
  title: "Pharmacy Services | Weight Loss, ED, IV, Specialty & Prescriptions",
  description:
    "Semaglutide and Tirzepatide weight loss, Tadalafil and Sildenafil ED meds, TRT, mobile IV therapy, specialty pharmacy, and low cost prescription drugs—Clear Choice Pharmacy, Novi, MI.",
  alternates: {
    canonical: `${SITE_URL}/services`,
  },
  openGraph: {
    title: "Pharmacy Services | Clear Choice Pharmacy",
    description:
      "GLP-1 weight loss, ED medications, TRT, mobile IV, specialty meds, and low-cost prescriptions from Clear Choice Pharmacy in Novi, MI.",
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
            <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-2">Clear Choice Pharmacy</p>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From everyday prescriptions at honest prices to specialized clinical programs—each service has a clear
              path to care, coordinated by our Novi pharmacy team.
            </p>
          </div>

          <ClinicalServicesGrid showViewAll={false} prescriptionLast />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
