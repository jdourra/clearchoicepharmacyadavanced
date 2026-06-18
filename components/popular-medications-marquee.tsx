"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { fetchPopularMedication, type HomeMedication } from "@/lib/pharmacy-medication"

const POPULAR_QUERIES = [
  "Lisinopril",
  "Amlodipine",
  "Losartan",
  "Metoprolol",
  "Atorvastatin",
  "Rosuvastatin",
  "Metformin",
  "Levothyroxine",
]

const UNIT_BASED_FORMS = [
  "INHALER", "SOLUTION", "CREAM", "OINTMENT", "LOTION", "GEL",
  "SPRAY", "SYRINGE", "DROPS", "SUSPENSION", "PATCH", "VIAL", "PEN", "NEBULIZER",
]

function isUnitBasedForm(form: string) {
  return UNIT_BASED_FORMS.includes(form.toUpperCase())
}

function calculatePrice(perUnitCost: number, qty: number, form?: string) {
  const effectiveQty = form && isUnitBasedForm(form) ? 1 : qty
  return (perUnitCost * effectiveQty * 1.15 + 5).toFixed(2)
}

function MarqueeItem({ med }: { med: HomeMedication }) {
  const price = calculatePrice(med.per_unit_cost, 30, med.form)
  const supplyLabel = isUnitBasedForm(med.form)
    ? `per ${med.form.toLowerCase()}`
    : "30-day supply"

  return (
    <Link
      href={`/medications/${med.id}`}
      className="inline-flex shrink-0 items-center gap-3 rounded-full border border-primary/20 bg-background px-5 py-2.5 shadow-sm transition-colors hover:border-primary hover:bg-primary/5"
    >
      <span className="font-semibold text-foreground whitespace-nowrap">{med.name}</span>
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        {med.strength} {med.form}
      </span>
      <span className="text-lg font-bold text-primary whitespace-nowrap">${price}</span>
      <span className="text-xs text-muted-foreground whitespace-nowrap">{supplyLabel}</span>
    </Link>
  )
}

export function PopularMedicationsMarquee() {
  const [popularMeds, setPopularMeds] = useState<HomeMedication[]>([])

  useEffect(() => {
    let cancelled = false

    async function loadPopular() {
      const results = await Promise.all(POPULAR_QUERIES.map((query) => fetchPopularMedication(query)))
      if (!cancelled) setPopularMeds(results.filter(Boolean) as HomeMedication[])
    }

    loadPopular()
    return () => {
      cancelled = true
    }
  }, [])

  if (popularMeds.length === 0) return null

  const items = [...popularMeds, ...popularMeds]

  return (
    <div className="relative left-1/2 -translate-x-1/2 w-screen overflow-hidden border-y border-primary/15 bg-primary/5 py-4">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-primary/5 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-primary/5 to-transparent" />

      <div className="marquee-track flex w-max gap-4 px-4">
        {items.map((med, index) => (
          <MarqueeItem key={`${med.id}-${index}`} med={med} />
        ))}
      </div>
    </div>
  )
}
