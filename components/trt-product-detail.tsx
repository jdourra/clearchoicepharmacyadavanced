"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Check, Package, Stethoscope, Truck, Activity } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { TrtProductContent } from "@/lib/trt-product-content"
import { buildTrtIntakeUrl } from "@/lib/intake-prefill"
import {
  formatTrtBillingLabel,
  getTrtPrice,
  getTrtStartingMonthlyPrice,
  type TrtBillingPlan,
  type TrtProgram,
} from "@/lib/trt-catalog"
import { cn } from "@/lib/utils"

type TrtProductDetailProps = {
  program: TrtProgram
  content: TrtProductContent
}

export function TrtProductDetail({ program, content }: TrtProductDetailProps) {
  const defaultPlan =
    program.pricing.find((p) => p.badge === "Best Value")?.plan || program.pricing[0]?.plan || "quarterly"
  const [billingPlan, setBillingPlan] = useState<TrtBillingPlan>(defaultPlan)

  const selectedPricing = useMemo(
    () => getTrtPrice(program.id, billingPlan),
    [program.id, billingPlan]
  )

  const intakeUrl = buildTrtIntakeUrl(program.id, billingPlan)
  const startingPrice = getTrtStartingMonthlyPrice(program)

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 md:py-12">
      <Button asChild variant="ghost" className="mb-6">
        <Link href="/mens-health#trt">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to TRT programs
        </Link>
      </Button>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <div className="relative aspect-square max-w-lg mx-auto lg:mx-0 rounded-2xl border bg-muted/30 overflow-hidden">
            <Image
              src={program.image.src}
              alt={program.image.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
              priority
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-2">{content.tagline}</p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{content.homeKitTitle}</h1>
            <p className="text-lg text-muted-foreground mt-2">{program.subtitle}</p>
            <p className="mt-4">
              <span className="text-3xl font-bold text-primary">${startingPrice}</span>
              <span className="text-muted-foreground ml-1">/mo starting at</span>
            </p>
            <p className="text-sm font-medium text-foreground mt-1">{program.supplyLabel}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">In stock</Badge>
            <Badge variant="outline">Prescription required</Badge>
            <Badge variant="outline">Physician supervised</Badge>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  Choose billing
                </p>
                <RadioGroup
                  value={billingPlan}
                  onValueChange={(v) => setBillingPlan(v as TrtBillingPlan)}
                  className="space-y-3"
                >
                  {program.pricing.map((tier) => (
                    <label
                      key={tier.plan}
                      htmlFor={`trt-plan-${tier.plan}`}
                      className={cn(
                        "flex items-center justify-between gap-4 rounded-lg border p-4 cursor-pointer transition-colors",
                        billingPlan === tier.plan && "border-primary bg-primary/5"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value={tier.plan} id={`trt-plan-${tier.plan}`} />
                        <div>
                          <Label htmlFor={`trt-plan-${tier.plan}`} className="font-medium cursor-pointer capitalize">
                            {tier.plan} billing
                          </Label>
                          <p className="text-xs text-muted-foreground">{formatTrtBillingLabel(tier.plan)}</p>
                          {tier.badge && <p className="text-xs text-primary font-medium mt-0.5">{tier.badge}</p>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">${tier.pricePerMonth}</p>
                        <p className="text-xs text-muted-foreground">/mo</p>
                        {tier.plan === "quarterly" && (
                          <p className="text-xs text-muted-foreground">${tier.totalBilled} quarterly</p>
                        )}
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              {selectedPricing && (
                <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-1">
                  <p className="font-medium">
                    {billingPlan === "monthly"
                      ? `$${selectedPricing.totalBilled} per month`
                      : `$${selectedPricing.totalBilled} every 3 months ($${selectedPricing.pricePerMonth}/mo)`}
                  </p>
                  <p className="text-muted-foreground">
                    {program.supplyLabel} · physician review, medication, supplies, and shipping included.
                  </p>
                </div>
              )}

              <Button asChild size="lg" className="w-full text-base">
                <Link href={intakeUrl}>Buy now</Link>
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Secure health questionnaire · Charged only after provider approval
              </p>
            </CardContent>
          </Card>

          <div>
            <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Home kit includes
            </h2>
            <ul className="space-y-2">
              {content.kitIncludes.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-14 grid gap-8 md:grid-cols-2">
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Procedure</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{content.procedure}</p>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-bold">How it works</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{content.howItWorks}</p>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Dosage</h2>
          <p className="text-sm text-muted-foreground">{program.dosage}</p>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Frequency</h2>
          <p className="text-sm text-muted-foreground">{program.frequency}</p>
        </section>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold mb-3">Benefits</h2>
        <ul className="grid sm:grid-cols-2 gap-2">
          {content.benefits.map((benefit) => (
            <li key={benefit} className="flex gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              {benefit}
            </li>
          ))}
        </ul>
      </section>

      <Card className="mt-10 border-sky-200 bg-sky-50/50">
        <CardContent className="pt-6 flex gap-3">
          <Activity className="h-5 w-5 text-sky-700 shrink-0" />
          <div>
            <h2 className="font-bold text-sky-900">Lab monitoring</h2>
            <p className="text-sm text-sky-900/90 mt-2 leading-relaxed">{content.monitoringNote}</p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="flex gap-3 rounded-lg border p-5">
          <Stethoscope className="h-5 w-5 text-primary shrink-0" />
          <div>
            <h3 className="font-semibold mb-1">Physician review</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{content.physicianConsent}</p>
          </div>
        </div>
        <div className="flex gap-3 rounded-lg border p-5">
          <Truck className="h-5 w-5 text-primary shrink-0" />
          <div>
            <h3 className="font-semibold mb-1">Shipping</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{content.shipping}</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-8 leading-relaxed">
        Testosterone is a controlled substance requiring physician supervision. Compounded medications are prepared
        pursuant to a patient-specific prescription. Individual results may vary.
      </p>
    </div>
  )
}
