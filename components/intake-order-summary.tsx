import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { EdFormulationAddOn } from "@/lib/ed-add-ons"
import { formatEdAddOns } from "@/lib/ed-add-ons"
import type { EdOrderPricing } from "@/lib/ed-troche-catalog"

type IntakeOrderSummaryProps = {
  productName: string
  productSubtitle?: string
  billingLabel?: string
  priceLine?: string
  addOns?: EdFormulationAddOn[]
  orderPricing?: EdOrderPricing
  changeHref: string
}

export function IntakeOrderSummary({
  productName,
  productSubtitle,
  billingLabel,
  priceLine,
  addOns,
  orderPricing,
  changeHref,
}: IntakeOrderSummaryProps) {
  const displayPriceLine =
    priceLine ??
    (orderPricing ? `$${orderPricing.pricePerMonth}/mo · $${orderPricing.totalBilled} due upon approval` : undefined)

  return (
    <div className="rounded-lg border bg-muted/40 p-4 mb-6 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your order</p>
          <p className="font-semibold text-foreground">{productName}</p>
          {productSubtitle && <p className="text-sm text-muted-foreground">{productSubtitle}</p>}
          {billingLabel && <p className="text-sm text-muted-foreground">Billing: {billingLabel}</p>}
          {displayPriceLine && <p className="text-sm font-medium text-primary mt-1">{displayPriceLine}</p>}
          {addOns && addOns.length > 0 && !orderPricing && (
            <p className="text-sm text-muted-foreground mt-1">Add-ons: {formatEdAddOns(addOns)}</p>
          )}
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href={changeHref}>Change</Link>
        </Button>
      </div>

      {orderPricing && orderPricing.addOnLineItems.length > 0 && (
        <div className="border-t pt-3 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Add-ons</p>
          {orderPricing.addOnLineItems.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium">+${item.pricePerMonth}/mo</span>
            </div>
          ))}
          <div className="flex justify-between text-sm border-t pt-2">
            <span className="font-medium">Total due upon approval</span>
            <span className="font-bold text-primary">${orderPricing.totalBilled}</span>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Prescription required after provider review. Payment is authorized as a hold and captured only if approved.
      </p>
    </div>
  )
}
