import type { Metadata } from "next"
import { TrtIntakeForm } from "@/components/trt-intake-form"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Shield, Lock, Clock, Phone, Mail } from "lucide-react"
import { TRT_PROGRAMS, type TrtBillingPlan } from "@/lib/trt-catalog"
import { HORMONE_THERAPY_CONTROLLED_NOTE, NATIONAL_PARTNER_CARE_NOTE } from "@/lib/site-config"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://clearchoicepharmacy.com"

export const metadata: Metadata = {
  title: "Start Your Intake | Hormone Therapy | Clear Choice Pharmacy",
  description:
    "Start a secure intake for hormone therapy. A clinician licensed in your state reviews it. A pharmacy licensed in your state fills an approved prescription.",
  alternates: {
    canonical: `${SITE_URL}/mens-health/trt/start`,
  },
  openGraph: {
    title: "Start Your Intake | Hormone Therapy | Clear Choice Pharmacy",
    description:
      "Secure hormone-therapy intake. A clinician licensed in your state reviews it before a pharmacy licensed in your state fills an approved prescription.",
    url: `${SITE_URL}/mens-health/trt/start`,
    type: "website",
  },
}

type PageProps = {
  searchParams: Promise<{ program?: string; plan?: string }>
}

export default async function TrtStartPage({ searchParams }: PageProps) {
  const params = await searchParams
  const programId = params.program?.trim() || ""
  const initialProgram = programId && TRT_PROGRAMS.some((p) => p.id === programId) ? programId : undefined
  const planParam = params.plan as TrtBillingPlan | undefined
  const initialBillingPlan = planParam === "monthly" || planParam === "quarterly" ? planParam : "quarterly"

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
          <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
            <div className="lg:col-span-3">
              <div className="mb-8">
                <p className="text-sm font-medium text-primary mb-2">Clear Choice TRT</p>
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Complete Your TRT Order
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                  Finish your secure intake for physician-reviewed hormone therapy. A clinician licensed in your state
                  reviews it. If approved, a pharmacy licensed to dispense in your state fills and ships it.
                </p>
                <p className="mt-3 text-sm text-muted-foreground">{HORMONE_THERAPY_CONTROLLED_NOTE}</p>
                <p className="mt-2 text-sm text-muted-foreground">{NATIONAL_PARTNER_CARE_NOTE}</p>
              </div>
              <TrtIntakeForm initialProgram={initialProgram} initialBillingPlan={initialBillingPlan} />
            </div>

            <div className="lg:col-span-2">
              <div className="sticky top-24 space-y-8">
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-semibold text-foreground mb-4">Your Privacy is Protected</h3>
                  <div className="space-y-4">
                    {[
                      { icon: Shield, title: "HIPAA Compliant", description: "Protected by federal healthcare privacy laws" },
                      { icon: Lock, title: "256-bit Encryption", description: "Bank-level security for medical data" },
                      { icon: Clock, title: "Review time", description: "A clinician licensed in your state reviews your intake." },
                    ].map((feature) => (
                      <div key={feature.title} className="flex items-start gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <feature.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{feature.title}</p>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-muted p-6">
                  <h3 className="font-semibold text-foreground mb-2">Need Help?</h3>
                  <div className="space-y-3 text-sm">
                    <a href="tel:+12489876182" className="flex items-center gap-2 text-primary hover:underline">
                      <Phone className="h-4 w-4" /> (248) 987-6182
                    </a>
                    <a href="mailto:info@clearchoicepharmacy.com" className="flex items-center gap-2 text-primary hover:underline">
                      <Mail className="h-4 w-4" /> info@clearchoicepharmacy.com
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
