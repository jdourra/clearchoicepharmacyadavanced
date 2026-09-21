"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, MapPin, ShieldCheck, Stethoscope } from "lucide-react"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { ED_FORMULATIONS } from "@/lib/ed-troche-catalog"
import { formatUsd, getBestEdPlan, getEdDosesPerSupply } from "@/lib/pricing-clarity"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CASH_PAY_ED_TABLETS, type CashPayEdTabletSlug } from "@/lib/cash-pay-ed-tablets"
import { fetchPopularMedication, type HomeMedication } from "@/lib/pharmacy-medication"

const COMMERCIAL_ED_TABLETS: {
  slug: CashPayEdTabletSlug
  label: string
  description: string
}[] = [
  {
    slug: "sildenafil",
    label: "Sildenafil tablets",
    description: "Generic Viagra for as-needed use",
  },
  {
    slug: "tadalafil",
    label: "Tadalafil tablets",
    description: "Generic Cialis for longer-duration support",
  },
]

export default function HomePage() {
  const [selectedTablet, setSelectedTablet] = useState<CashPayEdTabletSlug>("sildenafil")
  const [tabletMedications, setTabletMedications] = useState<
    Partial<Record<CashPayEdTabletSlug, HomeMedication | null>>
  >({})

  useEffect(() => {
    let cancelled = false

    async function loadCommercialEdTablets() {
      const entries = await Promise.all(
        COMMERCIAL_ED_TABLETS.map(async (option) => [
          option.slug,
          await fetchPopularMedication(CASH_PAY_ED_TABLETS[option.slug].searchQuery),
        ] as const)
      )

      if (!cancelled) {
        setTabletMedications(Object.fromEntries(entries))
      }
    }

    loadCommercialEdTablets()

    return () => {
      cancelled = true
    }
  }, [])

  const selectedTabletGuide = CASH_PAY_ED_TABLETS[selectedTablet]
  const selectedTabletMedication = tabletMedications[selectedTablet]
  const selectedTabletHref = selectedTabletMedication
    ? `/medications/${selectedTabletMedication.id}`
    : selectedTabletGuide.path

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
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
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance max-w-2xl mb-3 sm:mb-4">
              <span className="block text-sky-300">ED Medications</span>
              <span className="block text-sky-300">Sildenafil &amp; Tadalafil</span>
              <span className="block mt-1 text-white text-[0.72em] sm:text-[0.78em] font-bold leading-tight">
                in Michigan
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-200 text-balance max-w-xl mb-6 sm:mb-8 leading-relaxed">
              Provider-reviewed ED medication with pharmacy-compounded Sildenafil, Tadalafil, and combination
              sublingual troches—fulfilled discreetly from Novi for qualifying Michigan patients.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto max-w-md sm:max-w-none">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto bg-sky-500 hover:bg-sky-400 text-white border-0 shadow-lg shadow-sky-900/30"
              >
                <Link href="/mens-health#ed-troches">
                  Shop ED Medications
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-white/10 border-white/35 text-white hover:bg-white/20 hover:text-white"
              >
                <Link href="/mens-health">View ED pricing</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-10 md:py-14 bg-background border-b">
          <div className="container max-w-5xl mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-8 md:mb-10">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-2">ED medication kits</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-balance">
                Sildenafil &amp; Tadalafil from $39/mo
              </h2>
              <p className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed">
                Transparent cash-pay pricing for qualifying Michigan patients after clinician review—provider review,
                compounding, discreet packaging, and shipping or pickup included.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              {ED_FORMULATIONS.map((product) => {
                const bestPlan = getBestEdPlan(product)
                return (
                  <Card key={product.id} className="overflow-hidden p-0 border-primary/25 bg-primary/5 flex flex-col">
                    <div className="relative aspect-[4/3] w-full bg-muted/40">
                      <Image
                        src={product.image.src}
                        alt={product.image.alt}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover object-center"
                      />
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-2xl md:text-3xl font-bold tracking-tight">{product.name}</h3>
                      <p className="text-sm text-primary font-medium mt-1">{product.subtitle}</p>
                      <p className="text-sm text-muted-foreground mt-3 mb-4 flex-1">{product.description}</p>
                      <p className="text-2xl font-bold text-primary mb-1">
                        {formatUsd(bestPlan.pricePerMonth)}
                        <span className="text-sm font-normal text-muted-foreground">/mo</span>
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">
                        About {formatUsd(bestPlan.pricePerDose, 2)}/dose ·{" "}
                        {getEdDosesPerSupply(product.id)} troches per 30 days
                      </p>
                      <Button asChild size="sm" className="w-fit">
                        <Link href={`/mens-health/ed/${product.id}`}>
                          View {product.name}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Compounded ED medications are prepared pursuant to a patient-specific prescription after clinical review.
              They are not the same as brand-name Viagra or Cialis tablets.{" "}
              <Link href="/mens-health#ed-troches" className="text-primary hover:underline">
                Compare ED medication options
              </Link>
              .
            </p>
          </div>
        </section>

        <section id="commercial-ed-tablets" className="py-10 md:py-14 bg-slate-50 border-b">
          <div className="container max-w-5xl mx-auto px-4">
            <div className="grid gap-6 md:grid-cols-[1.15fr_0.85fr] md:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-2">
                  Commercial ED tablets
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-balance mb-3">
                  Prefer generic Viagra or Cialis tablets?
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-2xl">
                  Choose a commercially available ED medication to see cash-pay tablet pricing. The next page lets you
                  choose strength and quantity using the same low-cost prescription pricing flow: Drug Cost + 15% + $5.
                </p>
              </div>

              <Card className="p-5 bg-background shadow-sm">
                <label
                  htmlFor="commercial-ed-tablet"
                  className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Select ED tablet
                </label>
                <Select
                  value={selectedTablet}
                  onValueChange={(value) => setSelectedTablet(value as CashPayEdTabletSlug)}
                >
                  <SelectTrigger id="commercial-ed-tablet" className="mt-3 w-full">
                    <SelectValue placeholder="Choose Sildenafil or Tadalafil" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMERCIAL_ED_TABLETS.map((option) => (
                      <SelectItem key={option.slug} value={option.slug}>
                        {option.label} · {CASH_PAY_ED_TABLETS[option.slug].brandReference} generic
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="mt-4 rounded-md border bg-muted/30 p-3">
                  <p className="font-medium text-sm">{selectedTabletGuide.genericName}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {COMMERCIAL_ED_TABLETS.find((option) => option.slug === selectedTablet)?.description}
                  </p>
                  {selectedTabletMedication ? (
                    <p className="text-xs text-muted-foreground mt-2">
                      Opens {selectedTabletMedication.strength} {selectedTabletMedication.form.toLowerCase()} so you
                      can adjust quantity and compare price.
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-2">
                      Opens the low-cost {selectedTabletGuide.genericName} page where you can search by strength.
                    </p>
                  )}
                </div>

                <Button asChild className="mt-4 w-full">
                  <Link href={selectedTabletHref}>
                    Choose strength &amp; quantity
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  These are standard prescription tablets, separate from compounded sublingual troches.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-b bg-slate-50">
          <div className="container max-w-5xl mx-auto px-4 py-4 sm:py-5">
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center sm:text-left text-xs sm:text-sm text-slate-600">
              <li className="flex items-center justify-center sm:justify-start gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>Serving Michigan patients from Novi</span>
              </li>
              <li className="flex items-center justify-center sm:justify-start gap-2">
                <Stethoscope className="h-4 w-4 text-primary shrink-0" />
                <span>Licensed clinician review before Rx</span>
              </li>
              <li className="flex items-center justify-center sm:justify-start gap-2">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <span>Discreet fulfillment · transparent pricing</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-background">
          <div className="container max-w-5xl mx-auto px-4">
            <div className="max-w-3xl mb-10">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-2">ED medication</p>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Why choose Clear Choice Pharmacy for ED meds
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Clear Choice Pharmacy helps qualifying Michigan patients access provider-reviewed Sildenafil,
                Tadalafil, and dual-action ED troches. A licensed clinician reviews your intake before any prescription
                is written. When appropriate, our Novi pharmacy compounds and fulfills patient-specific medication with
                clear cash-pay pricing and discreet delivery.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-12">
              <Card className="p-5">
                <h3 className="font-semibold mb-2">How ED treatment works</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Choose an ED medication, complete a secure intake, and upload your photo ID. Your clinician reviews
                  safety and eligibility. If approved, Clear Choice prepares your medication.
                </p>
                <Link href="/mens-health#ed-troches" className="text-sm text-primary hover:underline">
                  See program steps
                </Link>
              </Card>
              <Card className="p-5">
                <h3 className="font-semibold mb-2">Sildenafil &amp; Tadalafil</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Compare fast-acting Sildenafil, extended-duration Tadalafil, and dual-action combination troches
                  compounded for sublingual use after clinical review.
                </p>
                <Link href="/mens-health#ed-troches" className="text-sm text-primary hover:underline">
                  Compare ED medication options
                </Link>
              </Card>
              <Card className="p-5">
                <h3 className="font-semibold mb-2">Private clinical review</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Eligibility depends on clinical review—heart history, blood pressure, nitrate use, and other
                  contraindications matter. Medication is never automatic without evaluation.
                </p>
                <Link href="/mens-health" className="text-sm text-primary hover:underline">
                  Read ED medication FAQ
                </Link>
              </Card>
            </div>

            <div className="rounded-lg border bg-muted/30 p-6 md:p-8">
              <h2 className="text-xl font-bold mb-3">Michigan service area</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Clear Choice Pharmacy is located at 40890 Grand River Ave in Novi and currently dispenses ED medication
                programs to qualifying Michigan patients. We commonly serve patients from Novi, Northville, Farmington
                Hills, Wixom, South Lyon, and greater Metro Detroit.
              </p>
              <Link href="/contact" className="text-sm text-primary hover:underline">
                Contact the pharmacy
              </Link>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-primary text-primary-foreground">
          <div className="container max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to start ED medication?</h2>
            <p className="text-sm opacity-90 mb-8 max-w-xl mx-auto">
              Review Sildenafil, Tadalafil, and combination troche options, or call (248) 987-6182 with questions. A
              clinician must evaluate eligibility before any ED medication is prescribed.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" variant="secondary">
                <Link href="/mens-health#ed-troches">
                  Shop ED Medications
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                <Link href="/mens-health">
                  ED medication FAQ
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 bg-background border-t">
          <div className="container max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <div className="grid gap-6 max-w-3xl mx-auto">
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Do you offer Sildenafil and Tadalafil ED medication in Michigan?
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Yes. Clear Choice Pharmacy offers provider-reviewed Sildenafil, Tadalafil, and combination ED troches
                  for qualifying Michigan patients after clinician review. Individual results may vary.{" "}
                  <Link href="/mens-health#ed-troches" className="text-primary hover:underline">
                    Explore ED medication options
                  </Link>
                  .
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Is Tadalafil the same as Cialis?</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Tadalafil is the active ingredient in brand-name Cialis. Clear Choice Pharmacy compounds Tadalafil
                  troches pursuant to a patient-specific prescription. We do not sell brand-name Cialis through this
                  program.{" "}
                  <Link href="/mens-health/ed/tadalafil-daily" className="text-primary hover:underline">
                    Learn about Tadalafil troches
                  </Link>
                  .
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Is Sildenafil the same as Viagra?</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Sildenafil is the active ingredient in brand-name Viagra. Our ED program compounds Sildenafil
                  sublingual troches for qualifying patients after clinician review.{" "}
                  <Link href="/mens-health/ed/sildenafil-fast" className="text-primary hover:underline">
                    Learn about Sildenafil troches
                  </Link>
                  .
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">How do ED troches work?</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Troches dissolve under the tongue so medication can absorb through the oral mucosa. This can support
                  faster onset than swallowed tablets and helps avoid food-related delays.{" "}
                  <Link href="/mens-health" className="text-primary hover:underline">
                    Read the ED medication FAQ
                  </Link>
                  .
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
                Clear Choice Pharmacy is a Novi, Michigan compounding pharmacy focused on{" "}
                <Link href="/mens-health#ed-troches" className="text-primary hover:underline">
                  provider-reviewed ED medication
                </Link>
                . Sildenafil, Tadalafil, and combination troches are prepared after licensed clinician review for
                qualifying Michigan patients. Individual results may vary. This content is informational and does not
                replace medical advice from your provider.
              </p>
              <p className="leading-relaxed">
                Serving Novi, Northville, Farmington Hills, Wixom, South Lyon, and Metro Detroit communities.{" "}
                <Link href="/contact" className="text-primary hover:underline">
                  Contact us
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
