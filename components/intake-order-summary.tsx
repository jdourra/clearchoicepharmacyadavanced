import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatEdAddOns, type EdFormulationAddOn } from "@/lib/ed-add-ons"

type IntakeOrderSummaryProps = {
  productName: string
  productSubtitle?: string
  billingLabel?: string
  priceLine?: string
  addOns?: EdFormulationAddOn[]
  changeHref: string
}

export function IntakeOrderSummary({
  productName,
  productSubtitle,
  billingLabel,
  priceLine,
  addOns,
  changeHref,
}: IntakeOrderSummaryProps) {
  return (
    <div className="rounded-lg border bg-muted/40 p-4 mb-6 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your order</p>
          <p className="font-semibold text-foreground">{productName}</p>
          {productSubtitle && <p className="text-sm text-muted-foreground">{productSubtitle}</p>}
          {billingLabel && <p className="text-sm text-muted-foreground mt-1">Billing: {billingLabel}</p>}
          {priceLine && <p className="text-sm font-medium text-primary mt-1">{priceLine}</p>}
          {addOns && addOns.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">Add-ons: {formatEdAddOns(addOns)}</p>
          )}
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href={changeHref}>Change</Link>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Prescription required after provider review. Payment is authorized as a hold and captured only if approved.
      </p>
    </div>
  )
}
