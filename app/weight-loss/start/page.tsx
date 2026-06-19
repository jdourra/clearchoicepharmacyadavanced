import type { Metadata } from "next"
import { WeightLossIntakeForm } from "@/components/weight-loss-intake-form"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Shield, Lock, Clock, Phone, Mail } from "lucide-react"
import { WEIGHT_LOSS_PROGRAMS } from "@/lib/weight-loss-catalog"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://clearchoicepharmacy.com"

export const metadata: Metadata = {
  title: "Buy GLP Weight Loss Program | Clear Choice Pharmacy",
  description:
    "Complete secure checkout for medical weight loss with Semaglutide or Tirzepatide. Licensed provider review and pharmacy compounding through Clear Choice Pharmacy in Novi, MI.",
  alternates: {
    canonical: `${SITE_URL}/weight-loss/start`,
  },
  openGraph: {
    title: "Buy GLP Weight Loss Program | Clear Choice Pharmacy",
    description:
      "Secure checkout for GLP-1 medical weight management. Transparent pricing and pharmacy fulfillment in Novi, MI.",
    url: `${SITE_URL}/weight-loss/start`,
    type: "website",
  },
}

type PageProps = {
  searchParams: Promise<{ program?: string; plan?: string }>
}

export default async function WeightLossStartPage({ searchParams }: PageProps) {
  const params = await searchParams
  const programId = params.program?.trim() || ""
  const initialProgram =
    programId && WEIGHT_LOSS_PROGRAMS.some((p) => p.id === programId) ? programId : undefined
  const planParam = params.plan
  const initialBillingPlan = planParam === "quarterly" || planParam === "monthly" ? planParam : "monthly"

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
          <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
            <div className="lg:col-span-3">
              <div className="mb-8">
                <p className="text-sm font-medium text-primary mb-2">Clear Choice Weight Management</p>
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Complete Your GLP Order
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                  Finish your secure intake for custom compounded Semaglutide or Tirzepatide. A licensed provider
                  reviews your information before Clear Choice Pharmacy prepares your therapy.
                </p>
              </div>

              <WeightLossIntakeForm initialProgram={initialProgram} initialBillingPlan={initialBillingPlan} />
            </div>

            <div className="lg:col-span-2">
              <div className="sticky top-24 space-y-8">
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-semibold text-foreground mb-4">Your Privacy is Protected</h3>
                  <div className="space-y-4">
                    {trustFeatures.map((feature) => (
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

                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-semibold text-foreground mb-4">How It Works</h3>
                  <ol className="space-y-3">
                    {processSteps.map((step, index) => (
                      <li key={step} className="flex items-start gap-3">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                          {index + 1}
                        </span>
                        <span className="text-sm text-muted-foreground">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="rounded-xl border border-border bg-muted p-6">
                  <h3 className="font-semibold text-foreground mb-2">Need Help?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Our team is available to answer questions about GLP-1 therapy and checkout.
                  </p>
                  <div className="space-y-3">
                    <a
                      href="tel:+12489876182"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Phone className="h-4 w-4" />
                      1-248-987-6182
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

const trustFeatures = [
  {
    icon: Shield,
    title: "HIPAA Compliant",
    description: "Your information is protected by federal healthcare privacy laws",
  },
  {
    icon: Lock,
    title: "256-bit Encryption",
    description: "Bank-level security for all personal and medical data",
  },
  {
    icon: Clock,
    title: "Fast Review",
    description: "Provider review typically within 2-4 business hours",
  },
]

const processSteps = [
  "Review your selected GLP program",
  "Complete the secure medical questionnaire and vitals",
  "Answer clinical screening questions",
  "Licensed provider reviews your eligibility",
  "If approved, Clear Choice Pharmacy compounds and ships your GLP therapy",
]
