"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { MapPin } from "lucide-react"
import { MICHIGAN_ONLY_SHORT } from "@/lib/michigan-eligibility"

type MichiganOnlyNoticeProps = {
  className?: string
  /** Compact one-line notice vs titled alert */
  compact?: boolean
}

export function MichiganOnlyNotice({ className, compact = false }: MichiganOnlyNoticeProps) {
  if (compact) {
    return (
      <p className={className ?? "text-sm text-muted-foreground flex items-start gap-2"}>
        <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
        <span>{MICHIGAN_ONLY_SHORT}</span>
      </p>
    )
  }

  return (
    <Alert className={className}>
      <MapPin className="h-4 w-4" />
      <AlertTitle>Michigan patients only</AlertTitle>
      <AlertDescription>
        Clear Choice Pharmacy is currently licensed to dispense only in Michigan. Out-of-state
        patients cannot complete checkout or clinical intakes until we expand with our telehealth
        partner.
      </AlertDescription>
    </Alert>
  )
}
