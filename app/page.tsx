"use client"

import Link from "next/link"
import { ArrowRight, DollarSign, Shield, Clock } from "lucide-react"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/site-header"
import { MedicationAutocomplete } from "@/components/medication-autocomplete"
import { ClinicalServicesGrid } from "@/components/clinical-services-grid"
import { useEffect, useState } from "react"
import { fetchPopularMedication, type HomeMedication } from "@/lib/pharmacy-medication"

export default function HomePage() {

  const POPULAR_QUERIES = [
    // Blood pressure
    "Lisinopril",
    "Amlodipine",
    "Losartan",
    "Metoprolol",
    // Cholesterol
    "Atorvastatin",
    "Rosuvastatin",
    // Diabetes
    "Metformin",
    // Thyroid
    "Levothyroxine",
  ]

  const [popularMeds, setPopularMeds] = useState<HomeMedication[]>([])

  useEffect(() => {
    let cancelled = false

    async function loadPopular() {
      const results = await Promise.all(
        POPULAR_QUERIES.map((query) => fetchPopularMedication(query))
      )
      if (!cancelled) setPopularMeds(results.filter(Boolean) as HomeMedication[])
    }

    loadPopular()
    return () => {
      cancelled = true
    }
  }, [])

  // Forms that are dispensed as a single unit (not multiplied by quantity)
  const UNIT_BASED_FORMS = ["INHALER", "SOLUTION", "CREAM", "OINTMENT", "LOTION", "GEL", "SPRAY", "SYRINGE", "DROPS", "SUSPENSION", "PATCH", "VIAL", "PEN", "NEBULIZER"]

  const isUnitBasedForm = (form: string) => UNIT_BASED_FORMS.includes(form.toUpperCase())

  const calculatePrice = (perUnitCost: number, qty: number, form?: string) => {
    const effectiveQty = form && isUnitBasedForm(form) ? 1 : qty
    return (perUnitCost * effectiveQty * 1.15 + 5).toFixed(2)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero section */}
        <section className="relative py-12 md:py-20 bg-background">
          <div className="container max-w-5xl mx-auto px-4">
            <div className="text-center mb-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-3">
                Clear Choice Pharmacy · Novi, MI
              </p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance mb-4">
                Low Cost Prescription Drugs &amp;{" "}
                <span className="text-primary">Clinical Care</span>
              </h1>
              <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
                Look up everyday medication prices or explore clinical programs—all from one trusted pharmacy.
              </p>
            </div>

            <div className="max-w-2xl mx-auto mb-4">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                  Cash pay
                </Badge>
                <span className="text-sm font-medium">Look up a prescription price</span>
              </div>
              <MedicationAutocomplete />
              <p className="text-center text-sm font-semibold text-foreground mt-3">
                Drug Cost + 15% + $5 dispensing fee. That&apos;s it.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground mb-12">
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

            <div className="border-t pt-10">
              <div className="text-center mb-8">
                <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Or explore clinical programs
                </p>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Clear Choice Health</h2>
                <p className="text-muted-foreground max-w-xl mx-auto text-sm">
                  GLP-1 weight loss, men&apos;s health, mobile IV therapy, and specialty medications—compounded and
                  coordinated by our Novi pharmacy team.
                </p>
              </div>
              <ClinicalServicesGrid />
            </div>
          </div>
        </section>

        {/* Popular medications */}
        <section className="py-16 bg-muted/30">
          <div className="container max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
              <Badge variant="secondary" className="mb-3 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                Cash pay
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Popular Medications</h2>
              <p className="text-muted-foreground">
                Blood pressure, cholesterol, diabetes, and thyroid medications
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
              {popularMeds.map((med) => {
                const isUnit = isUnitBasedForm(med.form)
                const price = calculatePrice(med.per_unit_cost, 30, med.form)
                const retail = (Number.parseFloat(price) * 3.5).toFixed(2)
                const save = (Number.parseFloat(retail) - Number.parseFloat(price)).toFixed(2)
                const supplyLabel = isUnit ? `per ${med.form.toLowerCase()}` : "for 30 tablets"

                return (
                  <Link key={med.id} href={`/medications/${med.id}`}>
                    <Card className="p-5 hover:border-primary hover:shadow-lg transition-all cursor-pointer h-full">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg leading-tight">{med.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {med.strength} {med.form}
                          </p>
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-primary">${price}</div>
                          <p className="text-xs text-muted-foreground">{supplyLabel}</p>
                        </div>
                        <div className="pt-2 border-t">
                          <p className="text-sm text-muted-foreground line-through">Retail: ${retail}</p>
                          <p className="text-sm font-semibold text-green-600">You save ${save}</p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 bg-background">
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

        {/* Why cash-pay benefits */}
        <section className="py-16 bg-muted/30">
          <div className="container max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Cash Pay?</h2>
              <p className="text-lg text-muted-foreground">
                No insurance? High deductible? We're often cheaper than your copay.
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
                <p className="text-sm text-muted-foreground">See exactly what you'll pay before checkout—every time</p>
              </Card>
              <Card className="p-6 text-center">
                <h3 className="font-semibold text-lg mb-2">Simple Math</h3>
                <p className="text-sm text-muted-foreground">
                  Drug cost + 15% + $5. That's our entire pricing formula.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container max-w-4xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">How can we help you today?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-xl bg-primary-foreground/10 border border-primary-foreground/20 p-6 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide opacity-80 mb-2">Prescription prices</p>
                <h3 className="text-xl font-bold mb-2">Look up a medication</h3>
                <p className="text-sm opacity-90 mb-5">
                  Cash-pay generics at true cost. Drug Cost + 15% + $5—no insurance required.
                </p>
                <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
                  <Link href="/medications">
                    Browse medications
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
              <div className="rounded-xl bg-primary-foreground/10 border border-primary-foreground/20 p-6 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide opacity-80 mb-2">Clinical programs</p>
                <h3 className="text-xl font-bold mb-2">Explore health services</h3>
                <p className="text-sm opacity-90 mb-5">
                  GLP-1 weight loss, men&apos;s health, IV therapy, and specialty pharmacy care.
                </p>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                >
                  <Link href="/services">
                    View clinical programs
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* SEO Content: Frequently Asked Questions */}
      <section className="py-16 bg-background border-t">
        <div className="container max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions About Cheap Prescription Medications</h2>
          <div className="grid gap-6 max-w-3xl mx-auto">
            <div>
              <h3 className="font-semibold text-lg mb-2">How do I buy cheap prescription medications at Clear Choice Pharmacy?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Simply search for your medication using our online tool, compare prescription drug prices, and place your order. We offer some of the most affordable prescription drugs available, with savings up to 80% compared to retail pharmacies. No insurance is needed -- just pay cash for your prescriptions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Are your generic drugs as effective as brand-name medications?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Yes. All our cheap generic drugs meet the same FDA standards for quality, safety, and effectiveness as their brand-name counterparts. By buying generic drugs online through Clear Choice Pharmacy, you get the same medication at a fraction of the cost.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Can I use Clear Choice Pharmacy without insurance?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Absolutely. Clear Choice Pharmacy is designed as a pharmacy without insurance hassles. Our cash-pay model eliminates PBM middlemen, giving you access to discounted prescription medications at true wholesale cost plus a small markup and dispensing fee.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">How does your prescription drug prices comparison work?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Our online pharmacy provides instant price comparisons. Search for any medication and see our transparent price breakdown alongside estimated retail prices. Our formula is simple: Drug Cost + 15% + $5 dispensing fee. You always know exactly what you will pay before ordering.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">What are the best ways to save money on prescriptions?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                The best way to save money on prescriptions is to use a low cost pharmacy like Clear Choice. We offer discount prescription drugs by eliminating insurance middlemen, buying directly from wholesalers, and passing the savings to you. Choosing cheap generic drugs over brand names saves even more.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Do you offer online pharmacy discounts for bulk orders?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Yes, ordering a 90-day supply instead of a 30-day supply can significantly reduce your per-pill cost. Our transparent pricing formula means you can see the exact savings for any quantity. We are committed to being the best online pharmacy for cheap prescriptions.
              </p>
            </div>
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
              <h3 className="font-semibold text-lg mb-2">Does Clear Choice Pharmacy accept insurance for specialty medications?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Yes. For specialty and high-cost therapies, we accept all major insurance plans. Our in-house Prior Authorization team works with your doctor to expedite clinical approvals, and our clinical advocates help connect you with manufacturer copay assistance programs.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">How can I transfer my specialty prescriptions to Clear Choice Pharmacy?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Call us at (248) 987-6182 or visit our Novi, MI location. We coordinate with your physician and current pharmacy to transfer your specialty care and begin prior authorization and copay support from day one.{" "}
                <Link href="/specialty-pharmacy" className="text-primary hover:underline">
                  Learn more about our specialty pharmacy services
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content: About Section */}
      <section className="py-12 bg-muted/30 border-t">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <h2 className="text-2xl font-bold text-foreground mb-4">About Clear Choice Pharmacy - Your Affordable Prescription Drug Source</h2>
            <p className="leading-relaxed mb-4">
              Clear Choice Pharmacy is a low cost pharmacy located in Novi, Michigan, offering cheap prescription medications at true wholesale cost. As a cash-pay pharmacy, we provide affordable prescription drugs without requiring insurance. Our transparent pricing model -- Drug Cost + 15% + $5 dispensing fee -- ensures you always know what you will pay. No hidden fees, no PBM middlemen, no surprises.
            </p>
            <p className="leading-relaxed mb-4">
              Whether you are looking to buy prescription drugs online, compare prescription drug prices, or find a pharmacy without insurance, Clear Choice Pharmacy has you covered. We carry over 1,600 medications including the most commonly prescribed cheap generic drugs, all available at discount prescription drug prices that can save you up to 80% compared to traditional retail pharmacies.
            </p>
            <p className="leading-relaxed mb-4">
              We also provide specialized clinical services including{" "}
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
              Serving the communities of Novi, Northville, Farmington Hills, Wixom, and South Lyon, Clear Choice Pharmacy is your local source for discounted prescription medications. Pay cash for prescriptions and start saving money today. We are proud to be recognized as one of the best online pharmacies for cheap prescriptions in Michigan.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
