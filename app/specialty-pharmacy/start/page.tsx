import type { Metadata } from "next"
import Link from "next/link"
import { Shield, Lock, Clock, Phone, Mail, ArrowLeft } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { SpecialtyIntakeForm } from "@/components/specialty-intake-form"
import { SITE_URL } from "@/lib/clinical-seo"

export const metadata: Metadata = {
  title: "Start Specialty Transfer | Clear Choice Pharmacy",
  description:
    "Start your specialty medicine transfer online. Create your profile, add insurance, and choose transfer, upload, or e-prescribe options.",
  alternates: {
    canonical: `${SITE_URL}/specialty-pharmacy/start`,
  },
  openGraph: {
    title: "Start Specialty Transfer | Clear Choice Pharmacy",
    description:
      "Request specialty pharmacy care with prior authorization and copay support at Clear Choice Pharmacy in Novi, MI.",
    url: `${SITE_URL}/specialty-pharmacy/start`,
    type: "website",
  },
}

const trustFeatures = [
  {
    icon: Shield,
    title: "HIPAA Compliant",
    description: "Your health information is protected under federal privacy laws",
  },
  {
    icon: Lock,
    title: "Secure submission",
    description: "Encrypted transfer of your profile, insurance, and prescription details",
  },
  {
    icon: Clock,
    title: "Fast follow-up",
    description: "Our specialty team typically responds within 1 business day",
  },
]

const processSteps = [
  "Create your patient profile (or sign in)",
  "Select your specialty medication and insurance",
  "Choose transfer, upload, or e-prescribe",
  "Our team coordinates prior auth and copay assistance",
  "Pickup or delivery when your prescription is ready",
]

type PageProps = {
  searchParams: Promise<{ medication?: string }>
}

export default async function SpecialtyPharmacyStartPage({ searchParams }: PageProps) {
  const params = await searchParams
  const initialMedication = params.medication?.trim() || undefined

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
          <Button asChild variant="ghost" className="mb-6">
            <Link href="/specialty-pharmacy">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to specialty program
            </Link>
          </Button>

          <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
            <div className="lg:col-span-3">
              <div className="mb-8">
                <p className="text-sm font-medium text-primary mb-2">Specialty Medicine Program</p>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Start Your Transfer</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                  Tell us about your specialty medication and insurance. We&apos;ll handle prior authorization,
                  pharmacy transfer, and copay assistance on your behalf.
                </p>
              </div>

              <SpecialtyIntakeForm initialMedication={initialMedication} />
            </div>

            <div className="lg:col-span-2">
              <div className="sticky top-24 space-y-8">
                <div className="rounded-xl border bg-card p-6">
                  <h3 className="font-semibold mb-4">Your information is protected</h3>
                  <div className="space-y-4">
                    {trustFeatures.map((feature) => (
                      <div key={feature.title} className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <feature.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{feature.title}</p>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border bg-card p-6">
                  <h3 className="font-semibold mb-4">What happens next</h3>
                  <ol className="space-y-3">
                    {processSteps.map((step, index) => (
                      <li key={step} className="flex items-start gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                          {index + 1}
                        </span>
                        <span className="text-sm text-muted-foreground">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="rounded-xl border bg-muted p-6">
                  <h3 className="font-semibold mb-2">Need help?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Our specialty pharmacy team can walk you through the process.
                  </p>
                  <div className="space-y-3">
                    <a href="tel:+12489876182" className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <Phone className="h-4 w-4" />
                      (248) 987-6182
                    </a>
                    <a
                      href="mailto:info@clearchoicepharmacy.com"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Mail className="h-4 w-4" />
                      info@clearchoicepharmacy.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
