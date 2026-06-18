import type { Metadata } from "next"
import { TrtIntakeForm } from "@/components/trt-intake-form"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Shield, Lock, Clock, Phone, Mail } from "lucide-react"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://clearchoicepharmacy.com"

export const metadata: Metadata = {
  title: "Start Your TRT Consultation | Clear Choice Pharmacy",
  description:
    "Complete a secure online intake for testosterone replacement therapy. Physician-reviewed TRT with transparent pricing from $109/mo through Clear Choice Pharmacy.",
  alternates: {
    canonical: `${SITE_URL}/mens-health/trt/start`,
  },
  openGraph: {
    title: "Start Your TRT Consultation | Clear Choice Pharmacy",
    description: "Secure TRT intake with injectable, topical, and enclomiphene options. Transparent cash-pay pricing.",
    url: `${SITE_URL}/mens-health/trt/start`,
    type: "website",
  },
}

export default function TrtStartPage() {
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
                  Start Your Testosterone Replacement Consultation
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                  Complete our secure intake for physician-reviewed TRT. Programs include medication, supplies,
                  and discreet pharmacy fulfillment—with transparent pricing from $109/mo on quarterly billing.
                </p>
              </div>
              <TrtIntakeForm />
            </div>

            <div className="lg:col-span-2">
              <div className="sticky top-24 space-y-8">
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-semibold text-foreground mb-4">Your Privacy is Protected</h3>
                  <div className="space-y-4">
                    {[
                      { icon: Shield, title: "HIPAA Compliant", description: "Protected by federal healthcare privacy laws" },
                      { icon: Lock, title: "256-bit Encryption", description: "Bank-level security for medical data" },
                      { icon: Clock, title: "Fast Review", description: "Physician review typically within 2-4 business hours" },
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
                      <Phone className="h-4 w-4" /> 1-248-987-6182
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
