"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ED_FORMULATION_ADD_ONS,
  getEdAddOnMonthlyPrice,
  type EdFormulationAddOn,
} from "@/lib/ed-add-ons"
import { buildEdIntakeUrl } from "@/lib/intake-prefill"
import { calculateEdOrderPricing, type EdBillingPlan } from "@/lib/ed-troche-catalog"

type EdBuyButtonProps = {
  productId: string
  productName: string
  plan?: EdBillingPlan
  className?: string
  size?: "default" | "sm" | "lg"
  fullWidth?: boolean
}

export function EdBuyButton({
  productId,
  productName,
  plan = "quarterly",
  className,
  size = "default",
  fullWidth,
}: EdBuyButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [addOns, setAddOns] = useState<EdFormulationAddOn[]>([])

  const orderPricing = useMemo(
    () => calculateEdOrderPricing(productId, plan, addOns),
    [productId, plan, addOns]
  )

  const toggleAddOn = (id: EdFormulationAddOn, checked: boolean) => {
    setAddOns((prev) => (checked ? [...prev, id] : prev.filter((a) => a !== id)))
  }

  const goToIntake = (selectedAddOns: EdFormulationAddOn[]) => {
    router.push(buildEdIntakeUrl(productId, { addOns: selectedAddOns, plan }))
  }

  return (
    <>
      <Button
        type="button"
        size={size}
        className={fullWidth ? `w-full ${className ?? ""}` : className}
        onClick={() => setOpen(true)}
      >
        Buy
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enhance {productName}?</DialogTitle>
            <DialogDescription>
              Optional add-ons can be blended into your compounded troche. Pricing is at least 15% below typical
              online add-on rates. Your provider will confirm the final formulation after review.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {ED_FORMULATION_ADD_ONS.map((addOn) => {
              const addOnPrice = getEdAddOnMonthlyPrice(addOn.id, plan)
              return (
                <div key={addOn.id} className="flex items-start gap-3 rounded-lg border p-3">
                  <Checkbox
                    id={`addon-${productId}-${addOn.id}`}
                    checked={addOns.includes(addOn.id)}
                    onCheckedChange={(checked) => toggleAddOn(addOn.id, checked === true)}
                  />
                  <div className="space-y-1 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <Label htmlFor={`addon-${productId}-${addOn.id}`} className="font-medium cursor-pointer">
                        Add {addOn.label}
                      </Label>
                      <span className="text-sm font-semibold text-primary shrink-0">+${addOnPrice}/mo</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{addOn.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Online from ${addOn.marketLowMonthly}/mo · ours ${addOnPrice}/mo
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="rounded-lg border bg-muted/40 p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Base program</span>
              <span>${orderPricing.baseMonthly}/mo</span>
            </div>
            {orderPricing.addOnLineItems.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span className="text-muted-foreground">{item.label}</span>
                <span>+${item.pricePerMonth}/mo</span>
              </div>
            ))}
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Total due upon approval</span>
              <span className="text-primary">${orderPricing.totalBilled}</span>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={() => goToIntake([])}>
              Skip add-ons
            </Button>
            <Button type="button" onClick={() => goToIntake(addOns)}>
              Continue to checkout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
