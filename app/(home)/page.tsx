"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, DollarSign, HeartPulse, MapPin, ShieldCheck, Stethoscope } from "lucide-react"
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
        {/* Hero — clinical background, mobile-first */}
        <section className="relative isolate overflow-hidden text-white">
          <Image
            src="/images/home-hero-clinical.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[75%_center] sm:object-[right_center]"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-slate-950/92 via-slate-900/78 to-slate-900/35 sm:from-slate-950/88 sm:via-slate-900/65 sm:to-transparent"
            aria-hidden
          />
          <div className="relative container max-w-5xl mx-auto px-4 py-10 sm:py-14 md:py-20 min-h-[min(85vh,640px)] flex flex-col justify-center">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-sky-200 mb-3">
              Clear Choice Pharmacy · Novi, MI
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-balance max-w-2xl mb-3 sm:mb-4">
              Semaglutide, Sildenafil, Tadalafil &amp;{" "}
              <span className="text-sky-300">low cost prescription drugs</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-200 text-balance max-w-xl mb-6 sm:mb-8 leading-relaxed">
              Medical weight loss patients compare to Ozempic &amp; Wegovy · ED meds with Sildenafil &amp; Tadalafil
              (Viagra &amp; Cialis active ingredients) · TRT · mobile IV — from your Novi, MI pharmacy.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto max-w-md sm:max-w-none">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto bg-sky-500 hover:bg-sky-400 text-white border-0 shadow-lg shadow-sky-900/30"
              >
                <Link href="/prescriptions">
                  Look up prescription prices
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-white/10 border-white/35 text-white hover:bg-white/20 hover:text-white"
              >
                <Link href="/services">Explore clinical services</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section className="border-b bg-slate-50">
          <div className="container max-w-5xl mx-auto px-4 py-4 sm:py-5">
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center sm:text-left text-xs sm:text-sm text-slate-600">
              <li className="flex items-center justify-center sm:justify-start gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>Novi, Michigan</span>
              </li>
              <li className="flex items-center justify-center sm:justify-start gap-2">
                <Stethoscope className="h-4 w-4 text-primary shrink-0" />
                <span>Licensed provider review</span>
              </li>
              <li className="flex items-center justify-center sm:justify-start gap-2">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <span>Transparent cash-pay pricing</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="relative py-10 md:py-16 bg-background">
          <div className="container max-w-5xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
              <Card className="p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="h-5 w-5 text-primary shrink-0" />
                  <h2 className="text-lg font-bold">Reduced prescription costs</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Make your health more affordable with transparent cash-pay pricing—no insurance surprises.
                </p>
                <p className="text-sm mb-1">
                  Most common medications hover around <span className="font-semibold">$5</span> for a 30-day supply.
                </p>
                <p className="text-xs text-muted-foreground mb-5">Drug cost + 15% + $5 dispensing fee.</p>
                <Button asChild variant="outline" size="sm" className="mt-auto w-fit">
                  <Link href="/prescriptions">
                    Look up prescription prices
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </Card>
              <Card className="p-6 border-primary/30 bg-primary/5 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <HeartPulse className="h-5 w-5 text-primary shrink-0" />
                  <h2 className="text-lg font-bold">Optimize your health—affordably</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Clinical programs reviewed by licensed providers:
                </p>
                <ul className="space-y-2 text-sm mb-5">
                  <li className="flex gap-2">
                    <span className="text-primary shrink-0">•</span>
                    <Link href="/weight-loss" className="hover:text-primary hover:underline">
                      Weight loss (GLP-1)
                    </Link>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary shrink-0">•</span>
                    <Link href="/mens-health" className="hover:text-primary hover:underline">
                      Men&apos;s health (ED, TRT &amp; more)
                    </Link>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary shrink-0">•</span>
                    <Link href="/iv-rejuvenation/vials/start" className="hover:text-primary hover:underline">
                      Rejuvenation injections
                    </Link>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary shrink-0">•</span>
                    <Link href="/iv-rejuvenation" className="hover:text-primary hover:underline">
                      Mobile IV therapy
                    </Link>
                  </li>
                </ul>
                <Button asChild size="sm" className="mt-auto w-fit">
                  <Link href="/services">
                    Explore clinical services
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
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
              <h3 className="font-semibold text-lg mb-2">Do you offer Semaglutide and Tirzepatide for weight loss?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Yes. We offer physician-supervised medical weight loss with compounded Semaglutide and Tirzepatide
                (GLP-1) injections—alternatives patients often compare to Ozempic, Wegovy, and Zepbound. Transparent
                cash-pay pricing for qualifying Michigan patients.{" "}
                <Link href="/weight-loss" className="text-primary hover:underline">
                  Shop Semaglutide &amp; Tirzepatide programs
                </Link>
                .
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Do you offer Tadalafil, Sildenafil, and TRT?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Yes. Clear Choice Pharmacy compounds Tadalafil and Sildenafil ED troches (active ingredients in Cialis
                and Viagra) and offers physician-supervised testosterone replacement therapy (TRT).{" "}
                <Link href="/mens-health" className="text-primary hover:underline">
                  Shop ED medications &amp; TRT
                </Link>
                .
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Do you offer mobile IV therapy near me?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Yes. Clear Choice IV &amp; Rejuvenation delivers pharmacy-formulated IV therapy across Metro Detroit with
                licensed RN administration. Myers&apos; Cocktail, NAD+ IV, hydration, and immunity drips available.{" "}
                <Link href="/iv-rejuvenation" className="text-primary hover:underline">
                  Book mobile IV therapy
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
                help connect you with manufacturer copay assistance programs.{" "}
                <Link href="/specialty-pharmacy" className="text-primary hover:underline">
                  Learn about specialty pharmacy
                </Link>
                .
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
