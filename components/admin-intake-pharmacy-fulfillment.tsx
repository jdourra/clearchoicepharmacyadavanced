"use client"

import { useState } from "react"
import { Loader2, Mail, Package, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPaymentStatus } from "@/lib/intake-payment-status"
import { formatPortalStatus } from "@/lib/patient-portal-types"
import { staffAuthFetch } from "@/lib/staff-session"

const PAID_STATUSES = new Set(["captured", "paid_in_person"])

const INTAKE_STATUS = {
  approved: "rx_at_pharmacy",
  preparing: "preparing",
  shipped: "shipped",
  completed: "completed",
} as const

const FULFILLMENT_SERVICES = new Set(["weight_loss", "mens_health", "trt", "rejuvenation_vial"])

export function supportsAdminPharmacyFulfillment(serviceType: string): boolean {
  return FULFILLMENT_SERVICES.has(serviceType)
}

type PharmacyFulfillmentPanelProps = {
  serviceType: string
  intakeId: string
  detail: Record<string, unknown>
  onUpdated?: () => void
}

export function AdminIntakePharmacyFulfillmentPanel({
  serviceType,
  intakeId,
  detail,
  onUpdated,
}: PharmacyFulfillmentPanelProps) {
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  if (!supportsAdminPharmacyFulfillment(serviceType)) return null

  const status = String(detail.status ?? "")
  const paymentStatus = String(detail.payment_status ?? "none")
  const isWeightLoss = serviceType === "weight_loss"
  const hasStripeHold = Boolean(detail.stripe_payment_intent_id)
  const payAtPharmacy = isWeightLoss && !hasStripeHold
  const isPaid = PAID_STATUSES.has(paymentStatus)
  const isShipped =
    status === INTAKE_STATUS.shipped || status === INTAKE_STATUS.completed

  const approvedOrLater = new Set<string>([
    INTAKE_STATUS.approved,
    INTAKE_STATUS.preparing,
    INTAKE_STATUS.shipped,
    INTAKE_STATUS.completed,
  ])

  const canSendPaymentReminder =
    payAtPharmacy && paymentStatus === "awaiting_pharmacy" && approvedOrLater.has(status)

  const canMarkPharmacyPaid =
    isWeightLoss &&
    payAtPharmacy &&
    !isPaid &&
    approvedOrLater.has(status)

  const canMarkPreparing = approvedOrLater.has(status) && !isShipped && status !== INTAKE_STATUS.preparing

  const canMarkShipped = isPaid && !isShipped && approvedOrLater.has(status)

  const runAction = async (action: string, label: string) => {
    setBusy(action)
    setError("")
    setMessage("")
    try {
      if (action.startsWith("mark_paid_")) {
        const method = action.replace("mark_paid_", "") as "terminal" | "phone" | "cash"
        const res = await staffAuthFetch(`/api/admin/intakes/weight_loss/${intakeId}/mark-paid`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ method }),
        })
        const result = await res.json()
        if (!res.ok) throw new Error(result.error || "Could not mark paid")
        setMessage(`Marked paid (${method}) at pharmacy.`)
      } else {
        const res = await staffAuthFetch(
          `/api/admin/intakes/${serviceType}/${intakeId}/fulfillment`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action }),
          }
        )
        const result = await res.json()
        if (!res.ok) throw new Error(result.error || `Could not complete ${label}`)

        if (action === "send_payment_reminder") {
          setMessage("Payment reminder email sent to patient.")
        } else if (action === "mark_preparing") {
          setMessage("Intake marked as preparing.")
        } else if (action === "mark_shipped") {
          setMessage(
            result.emailSent
              ? "Marked shipped and emailed the patient."
              : `Marked shipped.${result.emailError ? ` Email failed: ${result.emailError}` : ""}`
          )
        }
      }
      onUpdated?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : `Could not complete ${label}`)
    } finally {
      setBusy(null)
    }
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Pharmacy fulfillment</CardTitle>
        <p className="text-sm text-muted-foreground">
          Collect payment, update status, and notify the patient after clinician approval.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="text-muted-foreground">Status:</span>
          <span className="font-medium">{formatPortalStatus(status)}</span>
          <span className="text-muted-foreground">· Payment:</span>
          <span className="font-medium">{formatPaymentStatus(paymentStatus)}</span>
        </div>

        {canSendPaymentReminder && (
          <div className="space-y-2 rounded-lg border p-3 bg-muted/30">
            <p className="text-sm font-medium">Awaiting pharmacy payment</p>
            <p className="text-xs text-muted-foreground">
              Patient is approved. Email them to pay at the Novi pharmacy (terminal, phone, or cash).
            </p>
            <Button
              type="button"
              size="sm"
              disabled={!!busy}
              onClick={() => runAction("send_payment_reminder", "payment reminder")}
            >
              {busy === "send_payment_reminder" ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              Email payment reminder
            </Button>
          </div>
        )}

        {canMarkPharmacyPaid && (
          <div className="space-y-2 rounded-lg border p-3">
            <p className="text-sm font-medium">Mark paid at pharmacy</p>
            <p className="text-xs text-muted-foreground">
              After collecting payment on the terminal (or cash/phone). Do not store card numbers.
            </p>
            <div className="flex flex-wrap gap-2">
              {(["terminal", "phone", "cash"] as const).map((method) => (
                <Button
                  key={method}
                  type="button"
                  size="sm"
                  variant={method === "terminal" ? "default" : "outline"}
                  disabled={!!busy}
                  onClick={() => runAction(`mark_paid_${method}`, `mark paid (${method})`)}
                >
                  {busy === `mark_paid_${method}` ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Mark paid ({method})
                </Button>
              ))}
            </div>
          </div>
        )}

        {(canMarkPreparing || canMarkShipped) && (
          <div className="space-y-2 rounded-lg border p-3">
            <p className="text-sm font-medium">Fulfillment status</p>
            <div className="flex flex-wrap gap-2">
              {canMarkPreparing && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={!!busy}
                  onClick={() => runAction("mark_preparing", "mark preparing")}
                >
                  {busy === "mark_preparing" ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Package className="h-4 w-4 mr-2" />
                  )}
                  Mark preparing
                </Button>
              )}
              {canMarkShipped && (
                <Button
                  type="button"
                  size="sm"
                  disabled={!!busy}
                  onClick={() => runAction("mark_shipped", "mark shipped")}
                >
                  {busy === "mark_shipped" ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Truck className="h-4 w-4 mr-2" />
                  )}
                  Mark shipped &amp; email patient
                </Button>
              )}
            </div>
            {canMarkShipped && !canMarkPreparing && (
              <p className="text-xs text-muted-foreground">
                Mark shipped sends a shipping confirmation email to the patient.
              </p>
            )}
          </div>
        )}

        {isShipped && (
          <p className="text-sm text-emerald-700">This intake has been marked shipped.</p>
        )}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {message ? <p className="text-sm text-foreground">{message}</p> : null}
      </CardContent>
    </Card>
  )
}
