"use client"

import { useState, type MouseEvent } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { staffAuthFetch } from "@/lib/staff-session"

const CONFIRM =
  "Cancel this because the patient changed their mind or did not pay? Any unpaid card hold will be released."

const INTAKE_CONFIRM =
  "Cancel this intake because the patient changed their mind, did not pay, or submitted it twice? Any unpaid card hold will be released."

export function AdminCancelCatalogOrderButton({
  orderId,
  label,
  onCancelled,
}: {
  orderId: string
  label?: string
  onCancelled: () => void
}) {
  const [busy, setBusy] = useState(false)

  const cancel = async (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    const confirmed = window.confirm(
      label ? `${CONFIRM}\n\n${label}` : CONFIRM
    )
    if (!confirmed) return
    setBusy(true)
    try {
      const res = await staffAuthFetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        window.alert(typeof data.error === "string" ? data.error : "Could not cancel this order")
        return
      }
      onCancelled()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button type="button" variant="destructive" size="sm" disabled={busy} onClick={(event) => void cancel(event)}>
      {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
      Cancel
    </Button>
  )
}

export function AdminCancelIntakeButton({
  serviceType,
  intakeId,
  label,
  onCancelled,
}: {
  serviceType: string
  intakeId: string
  label?: string
  onCancelled: () => void
}) {
  const [busy, setBusy] = useState(false)

  const cancel = async (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    const confirmed = window.confirm(label ? `${INTAKE_CONFIRM}\n\n${label}` : INTAKE_CONFIRM)
    if (!confirmed) return
    const notifyPatient = window.confirm(
      "Send the patient an email that this intake was cancelled?\n\nOK sends the email. Cancel skips the email. The intake is still cancelled either way."
    )
    setBusy(true)
    try {
      const res = await staffAuthFetch(`/api/admin/intakes/${serviceType}/${intakeId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifyPatient }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        window.alert(typeof data.error === "string" ? data.error : "Could not cancel this intake")
        return
      }
      if (notifyPatient && !data.emailSent) {
        window.alert(
          typeof data.emailError === "string"
            ? `Intake cancelled, but the email was not sent: ${data.emailError}`
            : "Intake cancelled, but the email was not sent."
        )
      }
      onCancelled()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button type="button" variant="destructive" size="sm" disabled={busy} onClick={(event) => void cancel(event)}>
      {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
      Cancel
    </Button>
  )
}
