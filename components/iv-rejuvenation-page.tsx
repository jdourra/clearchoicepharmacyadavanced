"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { IV_BOOSTERS, IV_PACKAGES, IV_TRAVEL_FEE, calculateIvSubtotal, calculateIvTotal, type IvPackage } from "@/lib/iv-catalog"
import { REJUVENATION_VIALS, VIAL_CATEGORY_LABELS } from "@/lib/rejuvenation-vial-catalog"
import { IV_REJUVENATION_FAQS } from "@/lib/clinical-seo"
import { IvBoosterPicker } from "@/components/iv-booster-picker"
import { buildIvBookUrl } from "@/lib/intake-prefill"

const BOOSTERS = IV_BOOSTERS

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
    description: "Submit your intake online. A licensed provider reviews your screening for clinical eligibility.",
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
    description: "Submit your online intake. A licensed provider reviews your health screening.",
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

export function IvRejuvenationPage() {
  const [selectedPackage, setSelectedPackage] = useState<IvPackage | null>(null)
  const [selectedBoosters, setSelectedBoosters] = useState<string[]>([])
  const [sheetOpen, setSheetOpen] = useState(false)

  const subtotalPrice = useMemo(() => {
    if (!selectedPackage) return 0
    return calculateIvSubtotal(selectedPackage.id, selectedBoosters)
  }, [selectedPackage, selectedBoosters])

  const totalPrice = useMemo(() => {
    if (!selectedPackage) return 0
    return calculateIvTotal(selectedPackage.id, selectedBoosters)
  }, [selectedPackage, selectedBoosters])

  const openBooking = (pkg?: IvPackage) => {
    if (!pkg) {
      scrollToMenu()
      return
    }
    setSelectedPackage((current) => {
      if (current?.id !== pkg.id) setSelectedBoosters([])
      return pkg
    })
    setSheetOpen(true)
  }

  const toggleBooster = (id: string) => {
    setSelectedBoosters((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const scrollToMenu = () => {
    setSheetOpen(false)
    document.getElementById("iv-menu")?.scrollIntoView({ behavior: "smooth" })
  }

  const scrollToVialMenu = () => {
    document.getElementById("vial-menu")?.scrollIntoView({ behavior: "smooth" })
  }

  const bookingUrl = useMemo(() => {
    if (!selectedPackage) return "/iv-rejuvenation/book"
    const params = new URLSearchParams({ package: selectedPackage.id })
    if (selectedBoosters.length > 0) params.set("boosters", selectedBoosters.join(","))
    return `/iv-rejuvenation/book?${params.toString()}`
  }, [selectedPackage, selectedBoosters])

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
                Tap <strong className="text-slate-800">Buy</strong> on a drip to add optional boosters and continue to checkout.
              </p>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {IV_PACKAGES.map((pkg) => (
                <Card
                  key={pkg.id}
                  className={cn(
                    "flex flex-col overflow-hidden p-0 border-slate-200 hover:border-sky-300 hover:shadow-lg transition-all duration-300",
                    selectedPackage?.id === pkg.id && "ring-2 ring-sky-500 border-sky-300",
                  )}
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
                  <CardFooter className="flex flex-col gap-2 px-6 pb-6">
                    <Button
                      className="w-full bg-slate-900 hover:bg-slate-800"
                      onClick={() => openBooking(pkg)}
                    >
                      Buy
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={buildIvBookUrl(pkg.id)}>Skip boosters — checkout now</Link>
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
              {REJUVENATION_VIALS.map((vial) => (
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
                        Ships nationwide
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
                      <Link href={`/iv-rejuvenation/vials/start?vial=${vial.id}`}>
                        Buy
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

      {/* Booking summary drawer */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle>Your IV Booking Summary</SheetTitle>
            <SheetDescription>
              Review your selections, then complete intake for telehealth provider review. Approved prescriptions
              are fulfilled by Clear Choice Pharmacy before RN dispatch.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-6 py-4 overflow-y-auto">
            <div className="rounded-xl border bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Selected Drip</p>
              {selectedPackage ? (
                <div>
                  <p className="font-semibold text-slate-900">{selectedPackage.title}</p>
                  <p className="text-sky-600 font-bold mt-1">${selectedPackage.price}</p>
                </div>
              ) : (
                <p className="text-sm text-slate-600">No drip selected yet. Choose a package from the IV menu.</p>
              )}
            </div>

            {selectedPackage && (
              <div className="rounded-xl border bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                  Optional Add-On Boosters
                </p>
                <p className="text-sm text-slate-600 mb-4">
                  Enhance your {selectedPackage.title.split("(")[0].trim()} with targeted pharmacy boosters.
                </p>
                <IvBoosterPicker
                  boosters={BOOSTERS}
                  selectedIds={selectedBoosters}
                  onToggle={toggleBooster}
                  compact
                />
              </div>
            )}

            {selectedPackage && (
              <div className="rounded-xl border bg-slate-50 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Drip subtotal</span>
                  <span className="font-medium text-slate-900">${subtotalPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Mobile travel &amp; dispatch</span>
                  <span className="font-medium text-slate-900">${IV_TRAVEL_FEE}</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between border-t pt-4">
              <span className="font-semibold text-slate-900">Estimated Total</span>
              <span className="text-2xl font-bold text-sky-600">${totalPrice}</span>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm text-slate-700">
              <BadgeCheck className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
              <p>
                100% upfront pricing. A <strong>${IV_TRAVEL_FEE} mobile travel &amp; dispatch fee</strong> is added at
                checkout for RN home visits. A licensed provider must approve your treatment before Clear Choice
                Pharmacy prepares your IV.
              </p>
            </div>
          </div>

          <SheetFooter className="flex-col gap-2 sm:flex-col">
            <Button
              className="w-full bg-sky-500 hover:bg-sky-400"
              disabled={!selectedPackage}
              asChild={!!selectedPackage}
            >
              {selectedPackage ? (
                <Link href={bookingUrl} onClick={() => setSheetOpen(false)}>
                  Continue to checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              ) : (
                <span>Select a Drip to Continue</span>
              )}
            </Button>
            <Button variant="outline" className="w-full" onClick={scrollToMenu}>
              Choose a different drip
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
