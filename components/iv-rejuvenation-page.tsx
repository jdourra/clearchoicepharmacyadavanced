"use client"

import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  Check,
  DollarSign,
  FlaskConical,
  Shield,
  Stethoscope,
  Syringe,
  Zap,
} from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { IV_PACKAGES, IV_TRAVEL_FEE } from "@/lib/iv-catalog"
import { MIC_B12_WEIGHT_LOSS } from "@/lib/weight-loss-catalog"
import { REJUVENATION_VIALS, VIAL_CATEGORY_LABELS } from "@/lib/rejuvenation-vial-catalog"
import { IV_REJUVENATION_FAQS } from "@/lib/clinical-seo"
import { buildIvPackageProductUrl, buildVialProductUrl } from "@/lib/intake-prefill"

const TRUST_ITEMS = [
  {
    icon: FlaskConical,
    title: "Pharmacy Formulated",
    description: "Sourced & mixed by licensed pharmacists",
  },
  {
    icon: Stethoscope,
    title: "Provider Oversight",
    description: "Licensed telehealth review before every IV order",
  },
  {
    icon: Syringe,
    title: "Licensed RNs Only",
    description: "Safe, professional in-home administration",
  },
  {
    icon: DollarSign,
    title: "100% Upfront Pricing",
    description: "Drip prices shown separately; $50 flat mobile dispatch fee at checkout",
  },
]

const STEPS = [
  {
    step: 1,
    title: "Select & Customize",
    description: "Pick your baseline drip, then add optional pharmacy boosters when you book.",
  },
  {
    step: 2,
    title: "Telehealth Review",
    description: "Submit your intake online. Dr. Dourra reviews your screening for clinical eligibility.",
  },
  {
    step: 3,
    title: "Pharmacy Preparation",
    description: "If approved, your eRx is sent to Clear Choice Pharmacy in Novi, MI to compound your IV bag.",
  },
  {
    step: 4,
    title: "RN Dispatch",
    description: "After pharmacy preparation, a licensed RN is dispatched to your home, office, or hotel.",
  },
]

const VIAL_STEPS = [
  {
    step: 1,
    title: "Choose Your Kit",
    description: "Select a physician-reviewed injectable vial homekit from our rejuvenation menu.",
  },
  {
    step: 2,
    title: "Telehealth Review",
    description: "Submit your online intake. Dr. Dourra reviews your health screening.",
  },
  {
    step: 3,
    title: "Pharmacy Compounding",
    description: "If approved, Clear Choice Pharmacy prepares your 30-day kit with supplies.",
  },
  {
    step: 4,
    title: "Home Delivery",
    description: "Your kit ships to your door with injection instructions and physician access.",
  },
]

const VIAL_MENU_ITEMS = [...REJUVENATION_VIALS, MIC_B12_WEIGHT_LOSS]

export function IvRejuvenationPage() {
  const scrollToMenu = () => {
    document.getElementById("iv-menu")?.scrollIntoView({ behavior: "smooth" })
  }

  const scrollToVialMenu = () => {
    document.getElementById("vial-menu")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_45%)]" />
          <div className="container relative max-w-6xl mx-auto px-4 py-16 md:py-24">
            <div className="max-w-3xl">
              <Badge className="mb-6 bg-sky-500/20 text-sky-100 border-sky-400/30 hover:bg-sky-500/20">
                Clear Choice IV &amp; Rejuvenation
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance mb-6">
                Premium Mobile IV Therapy Delivered to Your Door
              </h1>
              <p className="text-lg md:text-xl text-slate-200 leading-relaxed mb-8 max-w-2xl">
                Hospital-grade IV hydration, custom vitamins, and symptom relief administered by licensed RNs.
                Formulated by Clear Choice Pharmacy with transparent, upfront pricing.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  size="lg"
                  className="bg-sky-500 hover:bg-sky-400 text-white border-0 shadow-lg shadow-sky-500/25"
                  onClick={scrollToMenu}
                >
                  Buy Mobile IV
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white"
                  onClick={scrollToVialMenu}
                >
                  Shop Vial Kits
                </Button>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm text-sky-100">
                <Zap className="h-4 w-4 text-sky-300 shrink-0" />
                Provider-reviewed IV therapy · Compounded at Clear Choice Pharmacy · Mobile RN administration
              </div>
            </div>
          </div>
        </section>

        {/* IV Menu */}
        <section id="iv-menu" className="py-16 md:py-20 bg-white scroll-mt-20">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="max-w-2xl mb-10">
              <p className="text-sm font-semibold uppercase tracking-wide text-sky-600 mb-3">IV Treatment Menu</p>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Choose Your Drip
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Pharmacy-formulated IV packages with transparent pricing. Drip prices do not include the{" "}
                <strong className="text-slate-800">${IV_TRAVEL_FEE} mobile dispatch fee</strong>, added at checkout.
                Tap <strong className="text-slate-800">Shop now</strong> to view session details, optional boosters, and book.
              </p>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {IV_PACKAGES.map((pkg) => (
                <Card
                  key={pkg.id}
                  className="flex flex-col overflow-hidden p-0 border-slate-200 hover:border-sky-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative aspect-[4/3] w-full bg-slate-50">
                    <Image
                      src={pkg.image.src}
                      alt={pkg.image.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-contain object-center p-3"
                    />
                  </div>
                  <CardHeader className="space-y-3 px-6 pt-6">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-bold text-lg leading-tight text-slate-900">{pkg.title}</h3>
                      {pkg.badge && (
                        <Badge variant="outline" className={cn("shrink-0", pkg.badgeClass)}>
                          {pkg.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-3xl font-bold text-sky-600">${pkg.price}</p>
                    <p className="text-xs text-slate-500">{pkg.sessionLabel}</p>
                    <p className="text-xs text-slate-500">+ ${IV_TRAVEL_FEE} mobile dispatch at checkout</p>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4 px-6">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                        Key Ingredients
                      </p>
                      <ul className="space-y-1.5">
                        {pkg.ingredients.map((ingredient) => (
                          <li key={ingredient} className="flex gap-2 text-sm text-slate-700">
                            <Check className="h-4 w-4 text-sky-500 shrink-0 mt-0.5" />
                            <span>{ingredient}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{pkg.description}</p>
                    {pkg.note && (
                      <p className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                        *{pkg.note}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="px-6 pb-6">
                    <Button className="w-full bg-slate-900 hover:bg-slate-800" asChild>
                      <Link href={buildIvPackageProductUrl(pkg.id)}>
                        Shop now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Rejuvenation vial homekits */}
        <section id="vial-menu" className="py-16 md:py-20 bg-slate-50 border-y scroll-mt-20">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="max-w-2xl mb-10">
              <p className="text-sm font-semibold uppercase tracking-wide text-sky-600 mb-3">Rejuvenation Vials</p>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Injectable Homekits — Shipped to Your Door
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Physician-reviewed 30-day injection kits compounded at Clear Choice Pharmacy. Includes syringes,
                alcohol pads, telehealth consultation, and home delivery — no mobile dispatch fee.
              </p>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {VIAL_MENU_ITEMS.map((vial) => (
                <Card key={vial.id} className="flex flex-col overflow-hidden p-0 border-slate-200 hover:border-sky-300 hover:shadow-lg transition-all duration-300">
                  <div className="relative aspect-[4/3] w-full bg-slate-50">
                    <Image
                      src={vial.image.src}
                      alt={vial.image.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-contain object-center p-3"
                    />
                  </div>
                  <CardHeader className="space-y-3 px-6 pt-6">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-bold text-lg leading-tight text-slate-900">{vial.title}</h3>
                      {vial.badge && (
                        <Badge variant="outline" className={cn("shrink-0", vial.badgeClass)}>
                          {vial.badge}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs font-normal">
                        {VIAL_CATEGORY_LABELS[vial.category]}
                      </Badge>
                      <Badge variant="outline" className="text-xs font-normal text-emerald-700 border-emerald-200">
                        Michigan patients only
                      </Badge>
                    </div>
                    <p className="text-3xl font-bold text-sky-600">${vial.price}</p>
                    <p className="text-xs text-slate-500">{vial.supply}</p>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4 px-6">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                        Key Ingredients
                      </p>
                      <ul className="space-y-1.5">
                        {vial.ingredients.map((ingredient) => (
                          <li key={ingredient} className="flex gap-2 text-sm text-slate-700">
                            <Check className="h-4 w-4 text-sky-500 shrink-0 mt-0.5" />
                            <span>{ingredient}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{vial.description}</p>
                    <p className="text-xs text-slate-500">
                      {vial.route} · {vial.frequency}
                    </p>
                    {vial.shippingNote && (
                      <p className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                        *{vial.shippingNote}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="px-6 pb-6">
                    <Button className="w-full bg-sky-600 hover:bg-sky-500" asChild>
                      <Link href={buildVialProductUrl(vial.id)}>
                        Shop now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Trust ribbon */}
        <section className="border-y bg-slate-50">
          <div className="container max-w-6xl mx-auto px-4 py-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {TRUST_ITEMS.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="flex gap-4 items-start">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
              <p className="text-slate-600">From selection to in-home IV — with provider review and pharmacy fulfillment</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {STEPS.map((item) => (
                <div key={item.step} className="text-center">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-sky-500 text-white text-xl font-bold mb-5">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works — vials */}
        <section className="py-16 bg-slate-50 border-t">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How Rejuvenation Vials Work</h2>
              <p className="text-slate-600">From online intake to home delivery — compounded at Clear Choice Pharmacy</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {VIAL_STEPS.map((item) => (
                <div key={item.step} className="text-center">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-white text-xl font-bold mb-5">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-slate-50 border-t">
          <div className="container max-w-3xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-slate-600">Everything you need to know before your mobile IV appointment</p>
            </div>
            <Accordion type="single" collapsible className="rounded-xl border bg-white px-6">
              {IV_REJUVENATION_FAQS.map((faq) => (
                <AccordionItem key={faq.question} value={faq.question}>
                  <AccordionTrigger className="text-base font-semibold text-slate-900 hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 bg-gradient-to-r from-slate-900 to-sky-950 text-white">
          <div className="container max-w-3xl mx-auto px-4 text-center">
            <Shield className="h-10 w-10 text-sky-400 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready for IV Therapy or Rejuvenation Vials?</h2>
            <p className="text-lg text-slate-200 mb-8 opacity-90">
              Book mobile IV drips or request physician-reviewed injectable homekits — pharmacy-formulated with
              transparent pricing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/25"
                onClick={scrollToMenu}
              >
                Buy Mobile IV
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white"
                onClick={scrollToVialMenu}
              >
                Shop Vial Kits
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
