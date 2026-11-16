import { COMPOUNDED_MEDICATION_DISCLOSURE } from "@/lib/site-config"
import { cn } from "@/lib/utils"

export function CompoundedMedicationNotice({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium leading-relaxed text-amber-950",
        className
      )}
    >
      {COMPOUNDED_MEDICATION_DISCLOSURE}
    </p>
  )
}
