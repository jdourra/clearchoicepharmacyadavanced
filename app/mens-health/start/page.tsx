import type { Metadata } from "next"
import { ClinicalIntakeForm } from "@/components/clinical-intake-form"
import { MichiganOnlyNotice } from "@/components/michigan-only-notice"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Shield, Lock, Clock, Phone, Mail } from "lucide-react"
import { getEdTrocheProduct, type EdBillingPlan } from "@/lib/ed-troche-catalog"
import { parseEdAddOns } from "@/lib/ed-add-ons"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://clearchoicepharmacy.com"

export const metadata: Metadata = {
  title: "Buy ED Troches | Clear Choice Pharmacy",
  description:
    "Complete secure checkout for custom sublingual ED troches. Licensed provider review and pharmacy compounding through Clear Choice Pharmacy in Novi, MI.",
  alternates: {
    canonical: `${SITE_URL}/mens-health/start`,
  },
  openGraph: {
    title: "Buy ED Troches | Clear Choice Pharmacy",
    description: "Secure intake for custom compounded ED troches. Transparent pricing and discreet delivery.",
    url: `${SITE_URL}/mens-health/start`,
    type: "website",
  },
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
    description: "Physician review typically within 2-4 business hours",
  },
]

const processSteps = [
  "Review your selected troche formulation",
  "Complete the secure medical questionnaire",
  "Upload ID and authorize payment hold",
  "Licensed physician reviews your information",
  "If approved, Clear Choice Pharmacy compounds and ships discreetly",
]

type PageProps = {
  searchParams: Promise<{ product?: string; addons?: string; plan?: string; orderId?: string }>
}

export default async function MensHealthStartPage({ searchParams }: PageProps) {
  const params = await searchParams
  const productId = params.product?.trim() || ""
  const linkedOrderId = params.orderId?.trim() || ""
  const initialProduct = productId && getEdTrocheProduct(productId) ? productId : undefined
  const initialAddOns = parseEdAddOns(params.addons)
  const planParam = params.plan as EdBillingPlan | undefined
  const initialBillingPlan =
    planParam === "monthly" || planParam === "quarterly" || planParam === "annual" ? planParam : "quarterly"

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
          <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
            <div className="lg:col-span-3">
              <div className="mb-8">
                <p className="text-sm font-medium text-primary mb-2">Clear Choice Men&apos;s Health</p>
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Complete Your ED Troche Order
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                  Finish your secure intake for custom compounded ED troches. A licensed provider reviews your
                  information before Clear Choice Pharmacy prepares your prescription.
                </p>
                <div className="mt-4">
                  <MichiganOnlyNotice />
                </div>
                {linkedOrderId ? (
                  <p className="mt-3 text-sm rounded-lg border border-sky-200 bg-sky-50 text-sky-900 px-4 py-3">
                    Linked to prescription order <span className="font-mono font-medium">{linkedOrderId}</span>.
                    Complete this intake so our physician can review your troche request.
                  </p>
                ) : null}
              </div>

              <ClinicalIntakeForm
                initialProduct={initialProduct}
                initialAddOns={initialAddOns}
                initialBillingPlan={initialBillingPlan}
              />
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
                    Our team is available to answer questions about the checkout process.
                  </p>
                  <div className="space-y-3">
                    <a
                      href="tel:+12489876182"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
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
