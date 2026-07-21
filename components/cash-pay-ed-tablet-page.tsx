"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MedicationAutocomplete } from "@/components/medication-autocomplete"
import { fetchPopularMedication, type HomeMedication } from "@/lib/pharmacy-medication"
import type { CashPayEdTabletGuide } from "@/lib/cash-pay-ed-tablets"

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

export function CashPayEdTabletPage({ guide }: { guide: CashPayEdTabletGuide }) {
  const [med, setMed] = useState<HomeMedication | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchPopularMedication(guide.searchQuery).then((result) => {
      if (!cancelled) setMed(result)
    })
    return () => {
      cancelled = true
    }
  }, [guide.searchQuery])

  const price = med ? calculatePrice(med.per_unit_cost, 30, med.form) : null

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="py-12 md:py-16 bg-background">
          <div className="container max-w-3xl mx-auto px-4">
            <Button asChild variant="ghost" className="mb-6 -ml-2">
              <Link href="/prescriptions">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Low cost prescription drugs
              </Link>
            </Button>

            <Badge variant="secondary" className="mb-4">
              Cash-pay tablets · not compounded troches
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-balance mb-4">
              {guide.h1}
            </h1>
            <p className="text-lg text-muted-foreground text-balance mb-6">{guide.lead}</p>

            {med && price ? (
              <Card className="p-6 mb-8 border-primary/20 bg-primary/5">
                <p className="text-sm font-medium text-muted-foreground mb-1">Example cash-pay price</p>
                <p className="text-4xl font-bold text-primary">${price}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {med.name} · {med.strength} {med.form} · est. 30-day supply
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Formula: Drug Cost + 15% + $5. Your prescribed strength and quantity set the final price.
                </p>
                <Button asChild className="mt-4">
                  <Link href={`/medications/${med.id}`}>
                    View this tablet & order
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </Card>
            ) : null}

            <div className="mb-10">
              <p className="text-sm font-semibold mb-3">Look up your {guide.genericName} strength</p>
              <MedicationAutocomplete />
              <p className="text-sm text-muted-foreground mt-2">
                Search “{guide.searchQuery}” to see every strength we stock at cash-pay pricing.
              </p>
            </div>

            <ul className="space-y-3 mb-12">
              {guide.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-3 text-sm leading-relaxed">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Frequently asked questions</h2>
              <div className="space-y-6">
                {guide.faqs.map((faq) => (
                  <div key={faq.question}>
                    <h3 className="font-semibold mb-2">{faq.question}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>

            <Card className="p-6 bg-muted/40">
              <p className="font-semibold mb-2">Need a prescription?</p>
              <p className="text-sm text-muted-foreground mb-4">
                Upload an existing Rx, have your doctor e-prescribe to Clear Choice Pharmacy, or start a $40
                telemedicine visit from checkout when you order.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/prescriptions">
                    Search all low cost meds
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/mens-health#ed-troches">Compounded troche options</Link>
                </Button>
              </div>
            </Card>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
