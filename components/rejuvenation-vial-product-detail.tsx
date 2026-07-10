"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Check, Package, Stethoscope, Truck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { VialProductContent } from "@/lib/rejuvenation-vial-product-content"
import { VIAL_CATEGORY_LABELS, type RejuvenationVial } from "@/lib/rejuvenation-vial-catalog"
import { buildVialIntakeUrl } from "@/lib/intake-prefill"

type RejuvenationVialProductDetailProps = {
  vial: RejuvenationVial
  content: VialProductContent
}

export function RejuvenationVialProductDetail({ vial, content }: RejuvenationVialProductDetailProps) {
  const intakeUrl = buildVialIntakeUrl(vial.id)

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 md:py-12">
      <Button asChild variant="ghost" className="mb-6">
        <Link href="/iv-rejuvenation#vial-menu">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to vial kits
        </Link>
      </Button>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <div className="relative aspect-square max-w-lg mx-auto lg:mx-0 rounded-2xl border bg-muted/30 overflow-hidden">
            <Image
              src={vial.image.src}
              alt={vial.image.alt}
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
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{content.homeKitTitle}</h1>
              {vial.badge && (
                <Badge variant="outline" className={vial.badgeClass}>
                  {vial.badge}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="secondary">{VIAL_CATEGORY_LABELS[vial.category]}</Badge>
              <Badge variant="outline">Michigan patients only</Badge>
            </div>
            <p className="mt-4">
              <span className="text-3xl font-bold text-sky-600">${vial.price}</span>
              <span className="text-muted-foreground ml-2">per kit</span>
            </p>
            <p className="text-sm font-medium mt-1">{vial.supply}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {vial.route} · {vial.frequency}
            </p>
          </div>

          <Button asChild size="lg" className="w-full bg-sky-600 hover:bg-sky-500">
            <Link href={intakeUrl}>Buy now</Link>
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Secure intake · Charged only after provider approval · No mobile dispatch fee
          </p>

          <div>
            <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Package className="h-5 w-5 text-sky-600" />
              Home kit includes
            </h2>
            <ul className="space-y-2">
              {content.kitIncludes.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
                  {item}
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
          <h2 className="text-xl font-bold">How to use</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{content.procedure}</p>
        </section>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold mb-3">Key ingredients</h2>
        <ul className="grid sm:grid-cols-2 gap-2">
          {vial.ingredients.map((ingredient) => (
            <li key={ingredient} className="flex gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
              {ingredient}
            </li>
          ))}
        </ul>
      </section>

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

      {vial.shippingNote && (
        <p className="mt-6 text-sm font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          *{vial.shippingNote}
        </p>
      )}

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
            <h3 className="font-semibold mb-1">Shipping</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{content.shipping}</p>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center rounded-2xl bg-sky-50 border border-sky-200 p-8">
        <Button asChild size="lg" className="bg-sky-600 hover:bg-sky-500">
          <Link href={intakeUrl}>Buy now</Link>
        </Button>
      </div>
    </div>
  )
}
