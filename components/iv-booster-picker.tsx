"use client"

import { Check, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { IvBooster } from "@/lib/iv-catalog"

type IvBoosterPickerProps = {
  boosters: IvBooster[]
  selectedIds: string[]
  onToggle: (id: string) => void
  compact?: boolean
}

export function IvBoosterPicker({ boosters, selectedIds, onToggle, compact }: IvBoosterPickerProps) {
  return (
    <div className={cn("space-y-2", compact ? "" : "space-y-3")}>
      {boosters.map((booster) => {
        const selected = selectedIds.includes(booster.id)
        return (
          <button
            key={booster.id}
            type="button"
            onClick={() => onToggle(booster.id)}
            className={cn(
              "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all",
              selected
                ? "border-sky-500 bg-sky-50 shadow-sm ring-1 ring-sky-500"
                : "border-slate-200 bg-white hover:border-sky-300 hover:bg-slate-50/80",
            )}
          >
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors mt-0.5",
                selected ? "bg-sky-500 border-sky-500 text-white" : "border-slate-300 text-slate-400",
              )}
            >
              {selected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-900">{booster.name}</p>
                <p className="text-sky-600 font-bold shrink-0">${booster.price}</p>
              </div>
              <Badge variant="outline" className="mt-1.5 text-xs font-normal text-slate-600">
                {booster.bestFor}
              </Badge>
              <p className="text-sm text-slate-600 leading-snug mt-2">{booster.benefit}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
