"use client"

import type { WeightLossBillingPlan, WeightLossProgram } from "@/lib/weight-loss-catalog"
import {
  WEIGHT_LOSS_DOSE_PRICING_NOTE,
  WEIGHT_LOSS_KIT_INJECTIONS_NOTE,
  WEIGHT_LOSS_KIT_SUPPLY,
  WEIGHT_LOSS_LIVE_VISIT_FEE_NOTE,
  getWeightLossKitQuote,
} from "@/lib/weight-loss-catalog"
import { cn } from "@/lib/utils"

type WeightLossDoseTierPricingProps = {
  program: WeightLossProgram
  billingPlan: WeightLossBillingPlan
  compact?: boolean
  showNote?: boolean
  selectedTierId?: string
  className?: string
}

export function WeightLossDoseTierPricing({
  program,
  billingPlan,
  compact = false,
  showNote = true,
  selectedTierId,
  className,
}: WeightLossDoseTierPricingProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left">
              <th className="p-3 font-medium">Weekly dose</th>
              {!compact && <th className="p-3 font-medium hidden sm:table-cell">Kit</th>}
              <th className="p-3 font-medium text-right">
                {billingPlan === "monthly" ? "Per 30-day kit" : "Per kit (90-day plan)"}
              </th>
              {billingPlan === "quarterly" && (
                <th className="p-3 font-medium text-right hidden sm:table-cell">3-kit total</th>
              )}
            </tr>
          </thead>
          <tbody>
            {program.doses.map((dose) => {
              const quote = getWeightLossKitQuote(program, dose.id, billingPlan)
              if (!quote) return null
              const selected = selectedTierId === dose.id
              return (
                <tr
                  key={dose.id}
                  className={cn("border-b last:border-0", selected && "bg-primary/5")}
                >
                  <td className="p-3">
                    <p className="font-medium">
                      {dose.label}
                      {selected ? " · selected" : ""}
                    </p>
                    {compact && (
                      <p className="text-xs text-muted-foreground mt-0.5 sm:hidden">{dose.detail}</p>
                    )}
                  </td>
                  {!compact && (
                    <td className="p-3 text-muted-foreground hidden sm:table-cell">{dose.detail}</td>
                  )}
                  <td className="p-3 text-right font-semibold text-primary">${quote.kitPrice}</td>
                  {billingPlan === "quarterly" && (
                    <td className="p-3 text-right text-muted-foreground hidden sm:table-cell">
                      ${quote.totalBilled}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">{WEIGHT_LOSS_KIT_SUPPLY}</p>
      <p className="text-xs text-muted-foreground">{WEIGHT_LOSS_KIT_INJECTIONS_NOTE}</p>
      <p className="text-xs text-muted-foreground">{WEIGHT_LOSS_LIVE_VISIT_FEE_NOTE}</p>
      {showNote && (
        <p className="text-xs text-muted-foreground leading-relaxed">{WEIGHT_LOSS_DOSE_PRICING_NOTE}</p>
      )}
    </div>
  )
}
