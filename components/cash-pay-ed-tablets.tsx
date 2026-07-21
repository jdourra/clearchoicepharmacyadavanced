"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { fetchPopularMedication, type HomeMedication } from "@/lib/pharmacy-medication"
import {
  CASH_PAY_ED_TABLETS,
  type CashPayEdTabletSlug,
} from "@/lib/cash-pay-ed-tablets"

const UNIT_BASED_FORMS = [
  "INHALER",
  "SOLUTION",
  "CREAM",
  "OINTMENT",
  "LOTION",
  "GEL",
  "SPRAY",
  "SYRINGE",
  "DROPS",
  "SUSPENSION",
  "PATCH",
  "VIAL",
  "PEN",
  "NEBULIZER",
]

function isUnitBasedForm(form: string) {
  return UNIT_BASED_FORMS.includes(form.toUpperCase())
}

function calculatePrice(perUnitCost: number, qty: number, form?: string) {
  const effectiveQty = form && isUnitBasedForm(form) ? 1 : qty
  return (perUnitCost * effectiveQty * 1.15 + 5).toFixed(2)
}

function TabletCard({
  slug,
  med,
}: {
  slug: CashPayEdTabletSlug
  med: HomeMedication | null
}) {
  const guide = CASH_PAY_ED_TABLETS[slug]
  const price = med ? calculatePrice(med.per_unit_cost, 30, med.form) : null
  const supplyLabel =
    med && isUnitBasedForm(med.form) ? `per ${med.form.toLowerCase()}` : "est. 30-day supply"

  return (
    <Card className="p-6 flex flex-col h-full">
      <Badge variant="secondary" className="w-fit mb-3">
        Cash-pay tablets
      </Badge>
      <h3 className="text-xl font-bold tracking-tight">{guide.genericName}</h3>
      <p className="text-sm text-primary font-medium mt-1">
        Generic for {guide.brandReference}
      </p>
      <p className="text-sm text-muted-foreground mt-3 flex-1">
        Standard oral tablets with transparent cash-pay pricing—not compounded troches.
      </p>
      {med && price ? (
        <div className="mt-4 pt-4 border-t">
          <p className="text-3xl font-bold text-primary">${price}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Example: {med.strength} {med.form} · {supplyLabel}
          </p>
          <p className="text-xs text-muted-foreground">Drug Cost + 15% + $5 · your Rx strength may differ</p>
        </div>
      ) : (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Look up your prescribed strength for an exact cash-pay price.
          </p>
        </div>
      )}
      <div className="mt-5 flex flex-col gap-2">
        {med ? (
          <Button asChild>
            <Link href={`/medications/${med.id}`}>
              View tablet pricing
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : null}
        <Button asChild variant={med ? "outline" : "default"}>
          <Link href={guide.path}>
            {med ? `Learn more · low cost ${guide.genericName}` : `Low cost ${guide.genericName}`}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Card>
  )
}

export function CashPayEdTabletsSection({
  heading = "Low Cost ED Tablets (Generic Cialis & Viagra)",
  subheading = "Cash-pay Sildenafil and Tadalafil tablets—Drug Cost + 15% + $5. Separate from our compounded troche programs.",
}: {
  heading?: string
  subheading?: string
}) {
  const [sildenafil, setSildenafil] = useState<HomeMedication | null>(null)
  const [tadalafil, setTadalafil] = useState<HomeMedication | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [sil, tad] = await Promise.all([
        fetchPopularMedication("Sildenafil"),
        fetchPopularMedication("Tadalafil"),
      ])
      if (!cancelled) {
        setSildenafil(sil)
        setTadalafil(tad)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section id="ed-tablets" className="py-12 md:py-16 border-t bg-muted/20">
      <div className="container max-w-5xl mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-2">
            Cash-pay prescription tablets
          </p>
          <h2 className="text-3xl font-bold tracking-tight mb-3">{heading}</h2>
          <p className="text-muted-foreground">{subheading}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <TabletCard slug="sildenafil" med={sildenafil} />
          <TabletCard slug="tadalafil" med={tadalafil} />
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6 max-w-xl mx-auto">
          Prefer a compounded sublingual troche? See our{" "}
          <Link href="/mens-health#ed-troches" className="text-primary hover:underline">
            Men&apos;s Health ED troche programs
          </Link>
          .
        </p>
      </div>
    </section>
  )
}
