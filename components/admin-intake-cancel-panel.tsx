"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { intakeCancelBlockReason } from "@/lib/intake-cancel-rules"
import { staffAuthFetch } from "@/lib/staff-session"

type AdminIntakeCancelPanelProps = {
  serviceType: string
  intakeId: string
  detail: Record<string, unknown>
  onUpdated?: () => void
}

export function AdminIntakeCancelPanel({
  serviceType,
  intakeId,
  detail,
  onUpdated,
}: AdminIntakeCancelPanelProps) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const status = String(detail.status ?? "")
  const paymentStatus = detail.payment_status != null ? String(detail.payment_status) : ""
  const block = intakeCancelBlockReason(status, paymentStatus)

  if (status === "cancelled") {
    return (
      <Card>
        <CardContent className="py-4 text-sm text-muted-foreground">
          This intake was cancelled.
        </CardContent>
      </Card>
    )
  }

  if (block) return null

  const cancel = async () => {
    const confirmed = window.confirm(
      "Cancel this intake because the patient asked to stop? Any unpaid card hold will be released. This cannot be undone."
    )
    if (!confirmed) return

    setBusy(true)
    setError("")
    setMessage("")
    try {
      const res = await staffAuthFetch(`/api/admin/intakes/${serviceType}/${intakeId}/cancel`, {
        method: "POST",
      })
      const result = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(result.error || "Could not cancel this intake")
      const emailNote = result.emailSent
        ? " The patient was emailed."
        : result.emailError
          ? ` Email was not sent: ${result.emailError}`
          : ""
      setMessage(`Intake cancelled.${emailNote}`)
      onUpdated?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not cancel this intake")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="border-destructive/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Patient requested cancellation</CardTitle>
        <p className="text-sm text-muted-foreground">
          Use this when the patient asks to stop, including while the intake is still in review or after
          clinician approval if payment has not been collected.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button type="button" variant="destructive" size="sm" disabled={busy} onClick={() => void cancel()}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Cancel intake
        </Button>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {message ? <p className="text-sm text-foreground">{message}</p> : null}
      </CardContent>
    </Card>
  )
}
