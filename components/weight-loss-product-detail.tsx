"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  Check,
  Package,
  Stethoscope,
  Truck,
  AlertTriangle,
  FlaskConical,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { WeightLossDoseTierPricing } from "@/components/weight-loss-dose-tier-pricing"
import type { WeightLossBillingPlan, WeightLossDoseId, WeightLossProgram } from "@/lib/weight-loss-catalog"
import {
  WEIGHT_LOSS_DOSE_SELECT_HINT,
  WEIGHT_LOSS_INTAKE_HOLD_NOTE,
  WEIGHT_LOSS_LIVE_VISIT_FEE_NOTE,
  formatDoseOptionLabel,
  formatKitBillingLabel,
  getDefaultWeightLossDoseId,
  getWeightLossDose,
  getWeightLossIntakeHoldQuote,
  getWeightLossStartingKitPrice,
} from "@/lib/weight-loss-catalog"
import type { WeightLossProductContent } from "@/lib/weight-loss-product-content"
import { getWeightLossFromPrice } from "@/lib/weight-loss-product-content"
import { buildWeightLossIntakeUrl } from "@/lib/intake-prefill"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type WeightLossProductDetailProps = {
  program: WeightLossProgram
  content: WeightLossProductContent
}

export function WeightLossProductDetail({ program, content }: WeightLossProductDetailProps) {
  const defaultPlan =
    program.billingPlans.find((p) => p.badge?.includes("Best Value"))?.plan ||
    program.billingPlans[0]?.plan ||
    "monthly"
  const [billingPlan, setBillingPlan] = useState<WeightLossBillingPlan>(defaultPlan)
  const [doseId, setDoseId] = useState<WeightLossDoseId>(getDefaultWeightLossDoseId(program))

  const selectedDose = getWeightLossDose(program, doseId)
  const holdQuote = useMemo(
    () => getWeightLossIntakeHoldQuote(program, billingPlan, doseId),
    [program, billingPlan, doseId]
  )

  const intakeUrl = buildWeightLossIntakeUrl(program.id, billingPlan, doseId)
  const startingPrice = getWeightLossStartingKitPrice(program)
  const fromPrice = getWeightLossFromPrice(program)

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 md:py-12">
      <Button asChild variant="ghost" className="mb-6">
        <Link href="/weight-loss#programs">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to GLP programs
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
              className="object-contain p-8"
              priority
            />
          </div>
          <p className="text-center lg:text-left text-xs text-muted-foreground mt-3">
            Compounded at Clear Choice Pharmacy · Novi, MI
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-2">
              {content.tagline}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{content.homeKitTitle}</h1>
            <p className="text-lg text-muted-foreground mt-2">{program.subtitle}</p>
            <p className="mt-4">
              <span className="text-3xl font-bold text-primary">from ${fromPrice}</span>
              <span className="text-muted-foreground ml-1">/mo on quarterly starter kits</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Monthly starter kits from ${startingPrice}/mo · intake review, compounding &amp; shipping included
            </p>
            <p className="text-sm text-muted-foreground mt-1">{WEIGHT_LOSS_LIVE_VISIT_FEE_NOTE}</p>
            <p className="text-sm font-medium text-foreground mt-1">{program.supplyLabel}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
              In stock
            </Badge>
            <Badge variant="outline">Prescription required</Badge>
            <Badge variant="outline">Priced by vial mg</Badge>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-5">
              <div className="rounded-xl border-2 border-primary bg-primary/5 p-4 space-y-3 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-bold text-foreground tracking-tight">
                      1. Choose your dose
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{WEIGHT_LOSS_DOSE_SELECT_HINT}</p>
                  </div>
                  <Badge className="shrink-0 bg-primary text-primary-foreground hover:bg-primary">
                    Required
                  </Badge>
                </div>
                <Label htmlFor="dose-select" className="sr-only">
                  Select your vial strength
                </Label>
                <Select value={doseId} onValueChange={setDoseId}>
                  <SelectTrigger
                    id="dose-select"
                    className="w-full h-12 text-base font-medium border-primary/40 bg-background shadow-sm"
                  >
                    <SelectValue placeholder="Select vial mg strength" />
                  </SelectTrigger>
                  <SelectContent>
                    {program.doses.map((dose) => (
                      <SelectItem key={dose.id} value={dose.id}>
                        {formatDoseOptionLabel(dose, billingPlan)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedDose && (
                  <p className="text-sm font-medium text-foreground">
                    Selected: {selectedDose.label}
                    <span className="font-normal text-muted-foreground"> · {selectedDose.detail}</span>
                  </p>
                )}
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  2. Choose billing
                </p>
                <RadioGroup
                  value={billingPlan}
                  onValueChange={(v) => setBillingPlan(v as WeightLossBillingPlan)}
                  className="space-y-3"
                >
                  {program.billingPlans.map((option) => {
                    const quote = getWeightLossIntakeHoldQuote(program, option.plan, doseId)
                    return (
                      <label
                        key={option.plan}
                        htmlFor={`plan-${option.plan}`}
                        className={cn(
                          "flex items-center justify-between gap-4 rounded-lg border p-4 cursor-pointer transition-colors",
                          billingPlan === option.plan && "border-primary bg-primary/5"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value={option.plan} id={`plan-${option.plan}`} />
                          <div>
                            <Label htmlFor={`plan-${option.plan}`} className="font-medium cursor-pointer capitalize">
                              {option.plan === "monthly" ? "Monthly billing" : "Quarterly billing"}
                            </Label>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatKitBillingLabel(option.plan)}
                            </p>
                            {option.badge && (
                              <p className="text-xs text-primary font-medium mt-0.5">{option.badge}</p>
                            )}
                          </div>
                        </div>
                        {quote && (
                          <div className="text-right">
                            <p className="text-xl font-bold text-primary">${quote.kitPrice}</p>
                            <p className="text-xs text-muted-foreground">
                              /kit · {selectedDose?.label ?? "selected"}
                            </p>
                            {option.plan === "quarterly" && (
                              <p className="text-xs text-muted-foreground">${quote.totalBilled} for 3 kits</p>
                            )}
                          </div>
                        )}
                      </label>
                    )
                  })}
                </RadioGroup>
              </div>

              {holdQuote && (
                <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-1">
                  <p className="font-medium">
                    {billingPlan === "monthly"
                      ? `First kit (${selectedDose?.label ?? "selected"}, 4 injections): $${holdQuote.totalBilled}`
                      : `First shipment — 3 × ${selectedDose?.label ?? "selected"} (4 injections each): $${holdQuote.totalBilled}`}
                  </p>
                  <p className="text-muted-foreground">
                    4 weekly injections · intake physician review, compounding, syringes, supplies, and shipping
                    included.
                  </p>
                  {holdQuote.liveVisitAddon > 0 ? (
                    <p className="text-muted-foreground">
                      Card authorization up to ${holdQuote.authorizationHold} (includes up to $
                      {holdQuote.liveVisitAddon} if a live visit is required).
                    </p>
                  ) : (
                    <p className="text-muted-foreground">
                      Quarterly supply: live visit add-on waived. Authorization hold ${holdQuote.authorizationHold}.
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground pt-1">{WEIGHT_LOSS_INTAKE_HOLD_NOTE}</p>
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

          <WeightLossDoseTierPricing
            program={program}
            billingPlan={billingPlan}
            compact
            selectedTierId={doseId}
          />

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
          <h2 className="text-xl font-bold">Purpose</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{content.purpose}</p>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Procedure</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{content.procedure}</p>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Dosage & frequency</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{content.dosageFrequency}</p>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Diet & exercise</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{content.dietExercise}</p>
        </section>
      </div>

      <Card className="mt-10 border-amber-200 bg-amber-50/50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-bold text-amber-900">{content.titrationTitle}</h2>
              <p className="text-sm text-amber-900/90 mt-2 leading-relaxed">{content.titrationBody}</p>
              <ul className="mt-4 space-y-2">
                {content.titrationPhases.map((phase) => (
                  <li key={phase.phase} className="text-sm">
                    <span className="font-medium text-amber-950">{phase.phase}:</span>{" "}
                    <span className="text-amber-900/90">{phase.detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4">Kit pricing by dose tier</h2>
        <WeightLossDoseTierPricing program={program} billingPlan={billingPlan} selectedTierId={doseId} />
      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="text-xl font-bold mb-3">Benefits</h2>
          <ul className="space-y-2">
            {content.benefits.map((benefit) => (
              <li key={benefit} className="flex gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                {benefit}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-bold mb-3">Most common side effect</h2>
          <p className="text-sm text-muted-foreground mb-3">{content.commonSideEffects}</p>
          <p className="text-sm font-medium mb-2">Tips to limit nausea:</p>
          <ul className="space-y-1.5">
            {content.nauseaTips.map((tip) => (
              <li key={tip} className="text-sm text-muted-foreground flex gap-2">
                <span className="text-primary">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {content.optionalAddon && (
        <Card className="mt-10">
          <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Recommended with
              </p>
              <p className="font-semibold mt-1">{content.optionalAddon.label}</p>
              <p className="text-sm text-muted-foreground mt-1">{content.optionalAddon.description}</p>
            </div>
            <Button asChild variant="outline">
              <Link href={content.optionalAddon.href}>Learn more</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="flex gap-3 rounded-lg border p-5">
          <Stethoscope className="h-5 w-5 text-primary shrink-0" />
          <div>
            <h3 className="font-semibold mb-1">Physician consent for treatment</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{content.physicianConsent}</p>
          </div>
        </div>
        <div className="flex gap-3 rounded-lg border p-5">
          <Truck className="h-5 w-5 text-primary shrink-0" />
          <div>
            <h3 className="font-semibold mb-1">Shipping & storage</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{content.shipping}</p>
          </div>
        </div>
      </div>

      <Accordion type="single" collapsible className="mt-10 border rounded-lg px-4">
        <AccordionItem value="science">
          <AccordionTrigger className="text-left">
            <span className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-primary" />
              What is {program.id === "semaglutide" ? "Semaglutide" : "Tirzepatide"}?
            </span>
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
            {content.scienceSummary}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="mt-12 text-center rounded-2xl bg-primary/5 border border-primary/20 p-8 md:p-10">
        <h2 className="text-2xl font-bold mb-2">Ready to start?</h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          Complete your secure medical intake so a licensed provider can review your eligibility for{" "}
          {program.id === "semaglutide" ? "Semaglutide" : "Tirzepatide"} therapy.
        </p>
        <Button asChild size="lg">
          <Link href={intakeUrl}>Buy now</Link>
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-8 leading-relaxed">
        GLP-1 therapies require a valid prescription and clinical evaluation. Compounded medications are prepared
        pursuant to a patient-specific prescription. Individual results may vary. This page is for informational
        purposes and does not replace medical advice from your provider.
      </p>
    </div>
  )
}
