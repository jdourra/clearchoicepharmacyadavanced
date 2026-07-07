"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, BadgeCheck, Check, Package, Stethoscope, Truck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { IvBoosterPicker } from "@/components/iv-booster-picker"
import type { IvProductContent } from "@/lib/iv-product-content"
import { buildIvBookUrl } from "@/lib/intake-prefill"
import {
  IV_BOOSTERS,
  IV_TRAVEL_FEE,
  calculateIvSubtotal,
  calculateIvTotal,
  type IvPackage,
} from "@/lib/iv-catalog"

type IvPackageProductDetailProps = {
  pkg: IvPackage
  content: IvProductContent
}

export function IvPackageProductDetail({ pkg, content }: IvPackageProductDetailProps) {
  const [selectedBoosters, setSelectedBoosters] = useState<string[]>([])

  const subtotal = useMemo(() => calculateIvSubtotal(pkg.id, selectedBoosters), [pkg.id, selectedBoosters])
  const total = useMemo(() => calculateIvTotal(pkg.id, selectedBoosters), [pkg.id, selectedBoosters])

  const bookUrl = buildIvBookUrl(pkg.id, selectedBoosters)

  const toggleBooster = (id: string) => {
    setSelectedBoosters((prev) => (prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]))
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 md:py-12">
      <Button asChild variant="ghost" className="mb-6">
        <Link href="/iv-rejuvenation#iv-menu">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to IV menu
        </Link>
      </Button>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <div className="relative aspect-square max-w-lg mx-auto lg:mx-0 rounded-2xl border bg-muted/30 overflow-hidden">
            <Image
              src={pkg.image.src}
              alt={pkg.image.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain p-6"
              priority
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-600 mb-2">{content.tagline}</p>
            <div className="flex items-start gap-3 flex-wrap">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{pkg.title}</h1>
              {pkg.badge && (
                <Badge variant="outline" className={pkg.badgeClass}>
                  {pkg.badge}
                </Badge>
              )}
            </div>
            <p className="mt-4">
              <span className="text-3xl font-bold text-sky-600">${pkg.price}</span>
              <span className="text-muted-foreground ml-2">per session</span>
            </p>
            <p className="text-sm font-medium mt-1">{pkg.sessionLabel}</p>
            <p className="text-xs text-muted-foreground mt-1">+ ${IV_TRAVEL_FEE} mobile dispatch at checkout</p>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  Optional add-on boosters
                </p>
                <IvBoosterPicker boosters={IV_BOOSTERS} selectedIds={selectedBoosters} onToggle={toggleBooster} compact />
              </div>

              <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Drip subtotal</span>
                  <span className="font-medium">${subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mobile travel &amp; dispatch</span>
                  <span className="font-medium">${IV_TRAVEL_FEE}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span>Estimated total</span>
                  <span className="text-sky-600">${total}</span>
                </div>
              </div>

              <Button asChild size="lg" className="w-full bg-sky-600 hover:bg-sky-500">
                <Link href={bookUrl}>Book now</Link>
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Secure intake · Provider approval before pharmacy preparation and RN dispatch
              </p>
            </CardContent>
          </Card>

          <div className="flex items-start gap-3 rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm">
            <BadgeCheck className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
            <p className="text-muted-foreground">{content.dispatchNote}</p>
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
          <h2 className="text-xl font-bold">Duration</h2>
          <p className="text-sm text-muted-foreground">{content.duration}</p>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Key ingredients</h2>
          <ul className="space-y-1.5">
            {pkg.ingredients.map((ingredient) => (
              <li key={ingredient} className="flex gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
                {ingredient}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {pkg.note && (
        <p className="mt-6 text-sm font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          *{pkg.note}
        </p>
      )}

      <section className="mt-10">
        <h2 className="text-xl font-bold mb-3">Benefits</h2>
        <ul className="grid sm:grid-cols-2 gap-2">
          {content.benefits.map((benefit) => (
            <li key={benefit} className="flex gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
              {benefit}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-10">
        <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <Package className="h-5 w-5 text-sky-600" />
          Your session includes
        </h2>
        <ul className="space-y-2">
          {content.sessionIncludes.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="flex gap-3 rounded-lg border p-5">
          <Stethoscope className="h-5 w-5 text-sky-600 shrink-0" />
          <div>
            <h3 className="font-semibold mb-1">Physician review</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{content.physicianConsent}</p>
          </div>
        </div>
        <div className="flex gap-3 rounded-lg border p-5">
          <Truck className="h-5 w-5 text-sky-600 shrink-0" />
          <div>
            <h3 className="font-semibold mb-1">Mobile dispatch</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{content.dispatchNote}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
