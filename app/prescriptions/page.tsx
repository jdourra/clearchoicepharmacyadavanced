"use client"

import Link from "next/link"
import { ArrowLeft, ArrowRight, Clock, DollarSign, Shield } from "lucide-react"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MedicationAutocomplete } from "@/components/medication-autocomplete"
import { PopularMedicationsMarquee } from "@/components/popular-medications-marquee"

export default function PrescriptionsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="relative py-12 md:py-20 bg-background">
          <div className="container max-w-5xl mx-auto px-4">
            <Button asChild variant="ghost" className="mb-6">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to home
              </Link>
            </Button>

            <div className="text-center mb-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-3">
                Cash-pay prescriptions · Novi, MI
              </p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance mb-4">
                Low-Cost Prescriptions for Michigan Patients
              </h1>
              <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
                Look up everyday medication prices with transparent cash-pay pricing—no insurance, no surprises.
              </p>
              <p className="text-sm text-muted-foreground mt-3 max-w-xl mx-auto">
                Michigan patients only — we can currently fill and ship prescriptions only within Michigan.
              </p>
            </div>

            <div className="max-w-2xl mx-auto mb-4">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Badge
                  variant="secondary"
                  className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                >
                  Cash pay
                </Badge>
                <span className="text-sm font-medium">Look up a prescription price</span>
              </div>
              <MedicationAutocomplete />
              <p className="text-center text-sm font-semibold text-foreground mt-3">
                Drug Cost + 15% + $5 dispensing fee. That&apos;s it.
              </p>
              <p className="text-center text-sm text-muted-foreground mt-1">
                Most common medications hover around $5 for a 30-day supply.
              </p>
            </div>

            <PopularMedicationsMarquee />

            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground mt-8">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span>No insurance needed</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>No hidden fees</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Instant price lookup</span>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-background border-t">
          <div className="container max-w-5xl mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How It Works</h2>
              <p className="text-lg text-muted-foreground">Get your medication in three simple steps</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground text-xl font-bold mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Search Your Medication</h3>
                <p className="text-sm text-muted-foreground">
                  Find your prescription and see the real price—no surprises
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground text-xl font-bold mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">Upload Prescription</h3>
                <p className="text-sm text-muted-foreground">Upload a photo or have your doctor e-prescribe to us</p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground text-xl font-bold mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">Pickup or Delivery</h3>
                <p className="text-sm text-muted-foreground">
                  Ready in 24-48 hours for pickup or delivered to your door
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Cash Pay?</h2>
              <p className="text-lg text-muted-foreground">
                No insurance? High deductible? We&apos;re often cheaper than your copay.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 text-center">
                <h3 className="font-semibold text-lg mb-2">No PBM Middlemen</h3>
                <p className="text-sm text-muted-foreground">
                  We eliminate pharmacy benefit managers and pass savings to you
                </p>
              </Card>
              <Card className="p-6 text-center">
                <h3 className="font-semibold text-lg mb-2">Know Your Price</h3>
                <p className="text-sm text-muted-foreground">See exactly what you&apos;ll pay before checkout—every time</p>
              </Card>
              <Card className="p-6 text-center">
                <h3 className="font-semibold text-lg mb-2">Simple Math</h3>
                <p className="text-sm text-muted-foreground">
                  Drug cost + 15% + $5. That&apos;s our entire pricing formula.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">See what your meds cost</h2>
            <p className="text-sm opacity-90 mb-6 max-w-xl mx-auto">
              Build your list and see a running total. Drug Cost + 15% + $5—no insurance required.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" variant="secondary">
                <Link href="/medications">
                  Calculate medication costs
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                <Link href="/pricing">How pricing works</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 bg-background border-t">
          <div className="container max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Frequently Asked Questions — Michigan Prescriptions
            </h2>
            <div className="grid gap-6 max-w-3xl mx-auto">
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  How do I buy cheap prescription medications at Clear Choice Pharmacy?
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Simply search for your medication using our online tool, compare prescription drug prices, and place
                  your order. We offer some of the most affordable prescription drugs available, with savings up to 80%
                  compared to retail pharmacies. No insurance is needed—just pay cash for your prescriptions.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Are your generic drugs as effective as brand-name medications?
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Yes. All our cheap generic drugs meet the same FDA standards for quality, safety, and effectiveness as
                  their brand-name counterparts. Michigan patients get the same medication at a fraction of the cost
                  through Clear Choice Pharmacy in Novi.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Can I use Clear Choice Pharmacy without insurance?</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Absolutely. Clear Choice Pharmacy is designed as a pharmacy without insurance hassles. Our cash-pay
                  model eliminates PBM middlemen, giving you access to discounted prescription medications at true
                  wholesale cost plus a small markup and dispensing fee.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  How does your prescription drug prices comparison work?
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Our online pharmacy provides instant price comparisons. Search for any medication and see our
                  transparent price breakdown alongside estimated retail prices. Our formula is simple: Drug Cost + 15%
                  + $5 dispensing fee. You always know exactly what you will pay before ordering.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">What are the best ways to save money on prescriptions?</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  The best way to save money on prescriptions is to use a low cost pharmacy like Clear Choice. We offer
                  discount prescription drugs by eliminating insurance middlemen, buying directly from wholesalers, and
                  passing the savings to you. Choosing cheap generic drugs over brand names saves even more.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Can I order if I live outside Michigan?</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Not at this time. Clear Choice Pharmacy can currently fill and ship prescriptions only for Michigan
                  patients. Pickup is available at our Novi location, and delivery is available to eligible Michigan
                  addresses. We plan to expand with a telehealth partner and will update eligibility when multi-state
                  coverage is available.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Do you offer discounts for 90-day supplies?</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Yes, ordering a 90-day supply instead of a 30-day supply can significantly reduce your per-pill cost.
                  Our transparent pricing formula means you can see the exact savings for any quantity before you order.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-muted/30 border-t">
          <div className="container max-w-5xl mx-auto px-4">
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                About Our Michigan Low-Cost Prescription Service
              </h2>
              <p className="leading-relaxed mb-4">
                Clear Choice Pharmacy is a cash-pay pharmacy in Novi, Michigan, serving Michigan patients with
                transparent prescription pricing. Our model—Drug Cost + 15% + $5 dispensing fee—means you always know
                what you will pay. No hidden fees, no PBM middlemen, no surprises.
              </p>
              <p className="leading-relaxed">
                Whether you need a pharmacy without insurance in Metro Detroit, want to compare cash-pay prescription
                prices, or prefer pickup in Novi with Michigan delivery options, Clear Choice Pharmacy has you covered.
                We carry thousands of commonly prescribed generics at prices that can save you up to 80% compared to
                traditional retail pharmacies—Michigan patients only.
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
