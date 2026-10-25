"use client"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { US_STATES } from "@/lib/us-states"
import { cn } from "@/lib/utils"

type UsStateFieldProps = {
  id?: string
  label?: string
  value: string
  onChange: (value: string) => void
  invalid?: boolean
  format?: "name" | "code"
}

/** State of the patient. The reviewing clinician must be licensed there. */
export function UsStateField({
  id = "state",
  label = "State",
  value,
  onChange,
  invalid,
  format = "name",
}: UsStateFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className={cn(invalid && "text-destructive")}>
        {label} *
      </Label>
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger id={id} className={cn(invalid && "border-destructive ring-2 ring-destructive")}>
          <SelectValue placeholder="Select your state" />
        </SelectTrigger>
        <SelectContent>
          {US_STATES.map((state) => (
            <SelectItem key={state.code} value={format === "code" ? state.code : state.name}>
              {state.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        A clinician licensed in this state reviews the intake.
      </p>
    </div>
  )
}
