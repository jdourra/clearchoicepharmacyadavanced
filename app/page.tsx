"use client"

import Link from "next/link"
import { ArrowRight, CheckCircle2, HeartPulse, ShieldCheck } from "lucide-react"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { ClinicalServicesGrid } from "@/components/clinical-services-grid"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="relative py-12 md:py-20 bg-background">
          <div className="container max-w-5xl mx-auto px-4">
            <div className="text-center mb-10">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-3">
                Clear Choice Pharmacy · Novi, MI
              </p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance mb-4">
                Pharmacy care that puts{" "}
                <span className="text-primary">you first</span>
              </h1>
              <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
                From everyday prescriptions at honest prices to GLP-1 weight loss, men&apos;s health, IV therapy, and
                specialty medications—we solve the problems that make healthcare expensive and confusing.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">The problems we solve</h2>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-destructive shrink-0">✕</span>
                    Prescription costs hidden behind insurance and PBMs
                  </li>
                  <li className="flex gap-2">
                    <span className="text-destructive shrink-0">✕</span>
                    Specialty meds stuck in prior authorization limbo
                  </li>
                  <li className="flex gap-2">
                    <span className="text-destructive shrink-0">✕</span>
                    Fragmented care across multiple providers and pharmacies
                  </li>
                </ul>
              </Card>
              <Card className="p-6 border-primary/30 bg-primary/5">
                <h2 className="text-lg font-semibold mb-4">How we help</h2>
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    Transparent cash-pay pricing with no middlemen
                  </li>
                  <li className="flex gap-2">
                    <HeartPulse className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    Clinical programs with licensed provider review
                  </li>
                  <li className="flex gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    In-house prior auth and copay assistance for specialty therapies
                  </li>
                </ul>
              </Card>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">What we provide</h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-sm">
                Five paths to better health—all compounded and coordinated by our Novi pharmacy team.
              </p>
            </div>
            <ClinicalServicesGrid />
          </div>
        </section>

        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How can we help you today?</h2>
            <p className="text-sm opacity-90 mb-8 max-w-xl mx-auto">
              Choose the service that fits your needs—or call us at (248) 987-6182 and we&apos;ll point you in the right
              direction.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" variant="secondary">
                <Link href="/prescriptions">
                  Look up prescription prices
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                <Link href="/services">
                  View all services
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <section className="py-16 bg-background border-t">
        <div className="container max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="grid gap-6 max-w-3xl mx-auto">
            <div>
              <h3 className="font-semibold text-lg mb-2">Does Clear Choice Pharmacy offer GLP-1 weight loss in Michigan?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Yes. We offer medical weight management with Semaglutide and Tirzepatide GLP-1 therapies for qualifying
                patients in Novi and Metro Detroit. Programs include licensed provider review, custom titration, and
                transparent cash-pay pricing.{" "}
                <Link href="/weight-loss" className="text-primary hover:underline">
                  Learn about our GLP-1 weight loss programs
                </Link>
                .
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Do you compound custom ED troches in Novi, MI?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Yes. Clear Choice Pharmacy compounds custom sublingual ED troches with Sildenafil and Tadalafil. Troches
                absorb faster than standard pills and are not affected by food. Start with a private online consultation.{" "}
                <Link href="/mens-health" className="text-primary hover:underline">
                  Explore men&apos;s health and ED compounding
                </Link>
                .
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Do you offer mobile IV therapy in Metro Detroit?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Yes. Clear Choice IV &amp; Rejuvenation delivers pharmacy-formulated IV therapy to your home or office
                with licensed RN administration. Myers&apos; Cocktail, NAD+, hydration, and immunity drips available.{" "}
                <Link href="/iv-rejuvenation" className="text-primary hover:underline">
                  View mobile IV therapy options
                </Link>
                .
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">
                Does Clear Choice Pharmacy accept insurance for specialty medications?
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Yes. For specialty and high-cost therapies, we accept all major insurance plans. Our in-house Prior
                Authorization team works with your doctor to expedite clinical approvals, and our clinical advocates
                help connect you with manufacturer copay assistance programs.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">
                How can I transfer my specialty prescriptions to Clear Choice Pharmacy?
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Call us at (248) 987-6182 or visit our Novi, MI location. We coordinate with your physician and current
                pharmacy to transfer your specialty care and begin prior authorization and copay support from day one.{" "}
                <Link href="/specialty-pharmacy" className="text-primary hover:underline">
                  Learn more about our specialty pharmacy services
                </Link>
                .
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Where can I look up low cost prescription drug prices?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Visit our{" "}
                <Link href="/prescriptions" className="text-primary hover:underline">
                  low cost prescription drugs page
                </Link>{" "}
                to search medications instantly. Most common meds hover around $5 for a 30-day supply with our formula:
                Drug Cost + 15% + $5 dispensing fee.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-muted/30 border-t">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <h2 className="text-2xl font-bold text-foreground mb-4">About Clear Choice Pharmacy</h2>
            <p className="leading-relaxed mb-4">
              Clear Choice Pharmacy is a full-service pharmacy in Novi, Michigan, dedicated to making healthcare more
              affordable and accessible. We provide{" "}
              <Link href="/prescriptions" className="text-primary hover:underline">
                low cost prescription drugs
              </Link>{" "}
              with transparent cash-pay pricing, plus specialized clinical services coordinated by our in-house pharmacy
              team.
            </p>
            <p className="leading-relaxed mb-4">
              Our services include{" "}
              <Link href="/weight-loss" className="text-primary hover:underline">
                GLP-1 medical weight loss
              </Link>
              ,{" "}
              <Link href="/mens-health" className="text-primary hover:underline">
                men&apos;s health and ED compounding
              </Link>
              ,{" "}
              <Link href="/iv-rejuvenation" className="text-primary hover:underline">
                mobile IV rejuvenation
              </Link>
              , and{" "}
              <Link href="/specialty-pharmacy" className="text-primary hover:underline">
                specialty pharmacy care
              </Link>
              . All major insurance plans are accepted for specialty therapies, with an in-house Prior Authorization
              team and copay assistance support that can reduce out-of-pocket costs to as low as $0.
            </p>
            <p className="leading-relaxed">
              Serving the communities of Novi, Northville, Farmington Hills, Wixom, and South Lyon, Clear Choice Pharmacy
              is your local partner for affordable prescriptions and comprehensive pharmacy care.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
