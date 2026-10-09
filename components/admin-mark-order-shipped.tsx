"use client"

import { useState } from "react"
import { Loader2, Package, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { staffAuthFetch } from "@/lib/staff-session"
import { messageSubjectForType } from "@/lib/patient-message-subjects"
import { canMarkCatalogOrderProcessing, canMarkCatalogOrderShipped } from "@/lib/admin-order-buckets"

type MarkShippedOrder = {
  id: string
  order_number?: string | null
  status: string
  payment_status?: string | null
  patient_id?: string | null
}

function shippedMessage(order: MarkShippedOrder): string {
  const number = order.order_number || order.id
  return `Great news! Your prescription has been shipped. Order #${number}. You should receive it within 2-3 business days.`
}

function processingMessage(order: MarkShippedOrder): string {
  const number = order.order_number || order.id
  return `Your order #${number} has been placed and is now processing at Clear Choice Pharmacy. Processing and shipping may take up to 6 days.`
}

async function resolveStaffId(staffId?: string): Promise<string> {
  if (staffId) return staffId
  const meRes = await staffAuthFetch("/api/admin/me")
  if (!meRes.ok) return "admin"
  const meData = await meRes.json().catch(() => ({}))
  return meData.staff?.id ? String(meData.staff.id) : "admin"
}

export function AdminMarkOrderShipped({
  order,
  staffId,
  compact = false,
  onShipped,
  onProcessing,
}: {
  order: MarkShippedOrder
  staffId?: string
  compact?: boolean
  onShipped: () => void
  onProcessing?: () => void
}) {
  const [busy, setBusy] = useState<"email" | "silent" | "processing" | null>(null)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const canProcess = canMarkCatalogOrderProcessing(order)
  const canShip = canMarkCatalogOrderShipped(order)
  if (!canProcess && !canShip) return null

  const label = `#${order.order_number || order.id}`

  const markProcessing = async () => {
    if (!confirm(`Mark order ${label} as placed and email the patient that processing and shipping may take up to 6 days?`)) {
      return
    }

    setBusy("processing")
    setError("")
    setMessage("")
    const shouldAdvance = order.status === "pending" || order.status === "pending_rx"
    try {
      if (shouldAdvance) {
        const res = await staffAuthFetch(`/api/admin/orders/${order.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "processing" }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || "Could not mark processing")
      }

      if (!order.patient_id) {
        setMessage("Marked processing. This order has no patient account, so no email was sent.")
        if (shouldAdvance) onProcessing?.()
        return
      }

      const senderId = await resolveStaffId(staffId)
      const emailRes = await staffAuthFetch("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderType: "staff",
          senderId,
          recipientType: "patient",
          recipientId: order.patient_id,
          subject: messageSubjectForType("order_placed", order.order_number || order.id),
          body: processingMessage(order),
          orderId: order.id,
        }),
      })
      const emailData = await emailRes.json().catch(() => ({}))
      if (!emailRes.ok) {
        setMessage(
          `Marked processing. Email failed: ${emailData.error || "could not send the patient message."}`
        )
      } else if (emailData.emailed) {
        setMessage("Marked processing and emailed the patient.")
      } else {
        setMessage(
          `Marked processing. Portal message saved.${emailData.emailError ? ` Email: ${emailData.emailError}` : ""}`
        )
      }
      if (shouldAdvance) onProcessing?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not mark processing")
    } finally {
      setBusy(null)
    }
  }

  const markShipped = async (notifyPatient: boolean) => {
    const prompt = notifyPatient
      ? `Mark order ${label} as shipped and email the patient?`
      : `Mark order ${label} as shipped without emailing the patient?`
    if (!confirm(prompt)) return

    setBusy(notifyPatient ? "email" : "silent")
    setError("")
    setMessage("")
    try {
      const res = await staffAuthFetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "shipped" }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Could not mark shipped")

      if (!notifyPatient) {
        setMessage("Marked shipped (no email sent).")
        onShipped()
        return
      }

      if (!order.patient_id) {
        setMessage("Marked shipped. This order has no patient account, so no email was sent.")
        onShipped()
        return
      }

      const senderId = await resolveStaffId(staffId)
      const emailRes = await staffAuthFetch("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderType: "staff",
          senderId,
          recipientType: "patient",
          recipientId: order.patient_id,
          subject: messageSubjectForType("shipped", order.order_number || order.id),
          body: shippedMessage(order),
          orderId: order.id,
        }),
      })
      const emailData = await emailRes.json().catch(() => ({}))
      if (!emailRes.ok) {
        setMessage(
          `Marked shipped. Email failed: ${emailData.error || "could not send the patient message."}`
        )
      } else if (emailData.emailed) {
        setMessage("Marked shipped and emailed the patient.")
      } else {
        setMessage(
          `Marked shipped. Portal message saved.${emailData.emailError ? ` Email: ${emailData.emailError}` : ""}`
        )
      }
      onShipped()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not mark shipped")
    } finally {
      setBusy(null)
    }
  }

  const buttons = (
    <div className="flex flex-wrap gap-2">
      {canProcess ? (
        <Button type="button" size="sm" disabled={!!busy} onClick={() => void markProcessing()}>
          {busy === "processing" ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Package className="h-4 w-4 mr-2" />
          )}
          Order placed & email patient
        </Button>
      ) : null}
      {canShip ? (
        <>
          <Button type="button" size="sm" disabled={!!busy} onClick={() => void markShipped(true)}>
            {busy === "email" ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Truck className="h-4 w-4 mr-2" />
            )}
            Mark shipped & email patient
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!!busy}
            onClick={() => void markShipped(false)}
          >
            {busy === "silent" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Mark shipped (no email)
          </Button>
        </>
      ) : null}
    </div>
  )

  if (compact) {
    return (
      <div className="space-y-2" onClick={(event) => event.stopPropagation()}>
        {buttons}
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        {message ? <p className="text-xs text-emerald-700">{message}</p> : null}
      </div>
    )
  }

  return (
    <Card className="border-violet-200 bg-violet-50/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Pharmacy fulfillment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Order placed emails the patient that the order is processing and that processing and shipping may take up to 6 days. Mark shipped when the package goes out.
        </p>
        {buttons}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      </CardContent>
    </Card>
  )
}
