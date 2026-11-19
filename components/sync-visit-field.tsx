"use client"

import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { requiresSyncVisit } from "@/lib/us-states"
import { cn } from "@/lib/utils"

type VisitSlot = { scheduleStart: string; scheduleEnd: string; providerGuid: string }

function formatVisitSlot(start: string): string {
  const date = new Date(start)
  if (Number.isNaN(date.getTime())) return start
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

export function selectedSyncVisit(key: string): {
  scheduleStart: string
  scheduleEnd: string
  providerGuid: string
} | null {
  const [scheduleStart, scheduleEnd, providerGuid] = key.split("||")
  if (!scheduleStart || !scheduleEnd || !providerGuid) return null
  return { scheduleStart, scheduleEnd, providerGuid }
}

export function useSyncVisitSlots(stateValue: string) {
  const required = requiresSyncVisit(stateValue)
  const [slots, setSlots] = useState<VisitSlot[]>([])
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "empty" | "error">("idle")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!required) {
      setSlots([])
      setStatus("idle")
      setMessage("")
      return
    }

    let cancelled = false
    setStatus("loading")
    setMessage("")
    fetch(`/api/weight-loss/visit-times?state=${encodeURIComponent(stateValue)}`)
      .then(async (response) => {
        const body = (await response.json()) as {
          slots?: { scheduleStart?: string; scheduleEnd?: string; providerGuid?: string }[]
          message?: string
        }
        if (cancelled) return
        const next = (body.slots || [])
          .filter((slot) => slot.scheduleStart && slot.scheduleEnd && slot.providerGuid)
          .map((slot) => ({
            scheduleStart: slot.scheduleStart || "",
            scheduleEnd: slot.scheduleEnd || "",
            providerGuid: slot.providerGuid || "",
          }))
        setSlots(next)
        setMessage(typeof body.message === "string" ? body.message : "")
        setStatus(next.length > 0 ? "ready" : response.ok ? "empty" : "error")
      })
      .catch(() => {
        if (cancelled) return
        setSlots([])
        setStatus("error")
        setMessage("Video visit times could not be loaded. Please try again.")
      })

    return () => {
      cancelled = true
    }
  }, [required, stateValue])

  return { required, slots, status, message }
}

export function syncVisitSelectionError(
  required: boolean,
  status: "idle" | "loading" | "ready" | "empty" | "error",
  message: string,
  visitKey: string
): string | null {
  if (!required) return null
  if (status === "loading") return "Loading video visit times…"
  if (!selectedSyncVisit(visitKey)) {
    return message || "This state requires a live video visit. Choose an appointment time."
  }
  return null
}

export function SyncVisitField({
  id,
  required,
  slots,
  status,
  message,
  value,
  invalid,
  onChange,
}: {
  id: string
  required: boolean
  slots: VisitSlot[]
  status: "idle" | "loading" | "ready" | "empty" | "error"
  message: string
  value: string
  invalid?: boolean
  onChange: (value: string) => void
}) {
  if (!required) return null

  return (
    <div className="space-y-2" data-field="visitSlot">
      <Label htmlFor={id} className={cn(invalid && "text-destructive")}>
        Video visit time *
      </Label>
      <Select
        value={value || undefined}
        onValueChange={onChange}
        disabled={status === "loading" || slots.length === 0}
      >
        <SelectTrigger id={id} className={cn(invalid && "border-destructive ring-2 ring-destructive")}>
          <SelectValue placeholder={status === "loading" ? "Loading times…" : "Choose a time"} />
        </SelectTrigger>
        <SelectContent>
          {slots.map((slot) => {
            const key = `${slot.scheduleStart}||${slot.scheduleEnd}||${slot.providerGuid}`
            return (
              <SelectItem key={key} value={key}>
                {formatVisitSlot(slot.scheduleStart)}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        {message || "This state requires a live video visit before a doctor can review your intake."}
      </p>
    </div>
  )
}
