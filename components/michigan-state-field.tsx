"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MICHIGAN_STATE_CODE, MICHIGAN_STATE_NAME } from "@/lib/michigan-eligibility"
import { cn } from "@/lib/utils"

type MichiganStateFieldProps = {
  id?: string
  label?: string
  /** "name" shows Michigan; "code" shows MI */
  format?: "name" | "code"
  className?: string
  invalid?: boolean
}

/** Read-only Michigan state field for MI-only dispensing. */
export function MichiganStateField({
  id = "state",
  label = "State",
  format = "name",
  className,
  invalid,
}: MichiganStateFieldProps) {
  const value = format === "code" ? MICHIGAN_STATE_CODE : MICHIGAN_STATE_NAME
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className={cn(invalid && "text-destructive")}>
        {label} *
      </Label>
      <Input
        id={id}
        value={value}
        readOnly
        className={cn("bg-muted", invalid && "border-destructive ring-2 ring-destructive")}
      />
      <p className="text-xs text-muted-foreground">Michigan patients only</p>
    </div>
  )
}
