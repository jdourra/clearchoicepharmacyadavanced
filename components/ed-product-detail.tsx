"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Check, Package, Stethoscope, Truck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  ED_FORMULATION_ADD_ONS,
  getEdAddOnMonthlyPrice,
  type EdFormulationAddOn,
} from "@/lib/ed-add-ons"
import type { EdProductContent } from "@/lib/ed-product-content"
import { buildEdIntakeUrl } from "@/lib/intake-prefill"
import {
  calculateEdOrderPricing,
  formatEdBillingLabel,
  type EdBillingPlan,
  type EdTrocheProduct,
} from "@/lib/ed-troche-catalog"
import { formatUsd, getBestEdPlan, getEdDosesPerSupply, getEdPricePerDose } from "@/lib/pricing-clarity"
import { cn } from "@/lib/utils"

type EdProductDetailProps = {
  product: EdTrocheProduct
  content: EdProductContent
}

export function EdProductDetail({ product, content }: EdProductDetailProps) {
  const defaultPlan =
    product.pricing.find((p) => p.badge === "Best Seller" || p.badge === "Best Value")?.plan ||
    product.pricing.find((p) => p.plan === "quarterly")?.plan ||
    product.pricing[0]?.plan ||
    "quarterly"
  const [billingPlan, setBillingPlan] = useState<EdBillingPlan>(defaultPlan)
  const [addOns, setAddOns] = useState<EdFormulationAddOn[]>([])

  const orderPricing = useMemo(
    () => calculateEdOrderPricing(product.id, billingPlan, addOns),
    [product.id, billingPlan, addOns]
  )

  const intakeUrl = buildEdIntakeUrl(product.id, { plan: billingPlan, addOns })

  const toggleAddOn = (id: EdFormulationAddOn, checked: boolean) => {
    setAddOns((prev) => (checked ? [...prev, id] : prev.filter((a) => a !== id)))
  }

  const bestPlan = getBestEdPlan(product)
  const startingPrice = bestPlan.pricePerMonth

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 md:py-12">
      <Button asChild variant="ghost" className="mb-6">
        <Link href="/mens-health#ed-troches">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to ED troches
        </Link>
      </Button>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <div className="relative aspect-square max-w-lg mx-auto lg:mx-0 rounded-2xl border bg-muted/30 overflow-hidden">
            <Image
              src={product.image.src}
              alt={product.image.alt}
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
            <p className="text-lg text-muted-foreground mt-2">{product.subtitle}</p>
            <p className="mt-4">
              <span className="text-3xl font-bold text-primary">from ${startingPrice}</span>
              <span className="text-muted-foreground ml-1">
                /mo · {formatEdBillingLabel(bestPlan.plan).toLowerCase()}
              </span>
            </p>
            <p className="text-sm font-medium text-foreground mt-1">{product.supplyLabel}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">In stock</Badge>
            <Badge variant="outline">Prescription required</Badge>
            <Badge variant="outline">Discreet shipping</Badge>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  Choose billing
                </p>
                <RadioGroup
                  value={billingPlan}
                  onValueChange={(v) => setBillingPlan(v as EdBillingPlan)}
                  className="space-y-3"
                >
                  {product.pricing.map((tier) => (
                    <label
                      key={tier.plan}
                      htmlFor={`ed-plan-${tier.plan}`}
                      className={cn(
                        "flex items-center justify-between gap-4 rounded-lg border p-4 cursor-pointer transition-colors",
                        billingPlan === tier.plan && "border-primary bg-primary/5"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value={tier.plan} id={`ed-plan-${tier.plan}`} />
                        <div>
                          <Label htmlFor={`ed-plan-${tier.plan}`} className="font-medium cursor-pointer capitalize">
                            {tier.plan} billing
                          </Label>
                          <p className="text-xs text-muted-foreground">{formatEdBillingLabel(tier.plan)}</p>
                          {tier.badge && <p className="text-xs text-primary font-medium mt-0.5">{tier.badge}</p>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">${tier.pricePerMonth}</p>
                        <p className="text-xs text-muted-foreground">/mo</p>
                        <p className="text-xs text-muted-foreground">
                          {formatUsd(getEdPricePerDose(tier.pricePerMonth, product.id), 2)}/dose ·{" "}
                          {getEdDosesPerSupply(product.id)} troches
                        </p>
                        {tier.plan !== "monthly" && (
                          <p className="text-xs text-muted-foreground">${tier.totalBilled} total</p>
                        )}
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  Optional add-ons
                </p>
                <div className="space-y-3">
                  {ED_FORMULATION_ADD_ONS.map((addOn) => {
                    const addOnPrice = getEdAddOnMonthlyPrice(addOn.id, billingPlan)
                    return (
                      <div key={addOn.id} className="flex items-start gap-3 rounded-lg border p-3">
                        <Checkbox
                          id={`ed-addon-${addOn.id}`}
                          checked={addOns.includes(addOn.id)}
                          onCheckedChange={(checked) => toggleAddOn(addOn.id, checked === true)}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between gap-2">
                            <Label htmlFor={`ed-addon-${addOn.id}`} className="font-medium cursor-pointer">
                              {addOn.label}
                            </Label>
                            <span className="text-sm font-semibold text-primary shrink-0">+${addOnPrice}/mo</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{addOn.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Program</span>
                  <span>${orderPricing.baseMonthly}/mo</span>
                </div>
                {orderPricing.addOnLineItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-muted-foreground">
                    <span>{item.label}</span>
                    <span>+${item.pricePerMonth}/mo</span>
                  </div>
                ))}
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span>Due upon approval</span>
                  <span className="text-primary">${orderPricing.totalBilled}</span>
                </div>
                <p className="text-xs text-muted-foreground pt-1">{product.supplyLabel} · shipping included</p>
              </div>

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
          <h2 className="text-xl font-bold">How to use</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{content.procedure}</p>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-bold">How it works</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{content.howItWorks}</p>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Dosage</h2>
          <p className="text-sm text-muted-foreground">{product.dosage}</p>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Frequency</h2>
          <p className="text-sm text-muted-foreground">{product.frequency}</p>
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
        Compounded medications are prepared pursuant to a patient-specific prescription. Individual results may vary.
        This page is for informational purposes and does not replace medical advice from your provider.
      </p>
    </div>
  )
}
