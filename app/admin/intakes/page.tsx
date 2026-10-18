"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { AdminShell } from "@/components/admin-shell"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatPortalStatus } from "@/lib/patient-portal-types"
import { formatPaymentStatus } from "@/lib/intake-payment-status"
import { staffAuthFetch } from "@/lib/staff-session"
import { formatPhoneDisplay } from "@/lib/phone"
import { canAdminCancelIntake } from "@/lib/admin-cancel-eligibility"
import { AdminCancelIntakeButton } from "@/components/admin-cancel-actions"

type IntakeRow = {
  serviceType: string
  serviceLabel: string
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  state: string | null
  status: string
  treatmentLabel: string
  stripePaymentIntentId: string | null
  paymentStatus: string | null
  patientId: string | null
  createdAt: string
  delayCourtesyPercent?: 5 | 10 | null
}

type StatusFilter = "pending" | "awaiting_payment" | "awaiting_shipment" | "approved" | "all"

export default function AdminIntakesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const filterParam = searchParams.get("filter")
  const initialFilter: StatusFilter =
    filterParam === "awaiting_payment" ||
    filterParam === "awaiting_shipment" ||
    filterParam === "approved" ||
    filterParam === "all" ||
    filterParam === "pending"
      ? filterParam
      : "pending"

  const [intakes, setIntakes] = useState<IntakeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialFilter)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState("")

  useEffect(() => {
    if (
      filterParam === "awaiting_payment" ||
      filterParam === "awaiting_shipment" ||
      filterParam === "approved" ||
      filterParam === "all" ||
      filterParam === "pending"
    ) {
      setStatusFilter(filterParam)
    }
  }, [filterParam])

  const loadIntakes = useCallback(
    (filter: StatusFilter) => {
      setLoading(true)
      staffAuthFetch(`/api/admin/intakes?status=${filter}`)
        .then(async (res) => {
          if (!res.ok) {
            router.push("/admin/login")
            return
          }
          const data = await res.json()
          setIntakes(data.intakes || [])
        })
        .catch(() => router.push("/admin/login"))
        .finally(() => setLoading(false))
    },
    [router]
  )

  useEffect(() => {
    loadIntakes(statusFilter)
  }, [loadIntakes, statusFilter])

  const markProcessing = async (intake: IntakeRow) => {
    setProcessingId(intake.id)
    setActionError("")
    try {
      const res = await staffAuthFetch(
        `/api/admin/intakes/${intake.serviceType}/${intake.id}/fulfillment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "mark_preparing", notifyPatient: false }),
        }
      )
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Could not mark processing")
      loadIntakes(statusFilter)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not mark processing")
    } finally {
      setProcessingId(null)
    }
  }

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        loadIntakes(statusFilter)
      }
    }
    const onFocus = () => loadIntakes(statusFilter)
    document.addEventListener("visibilitychange", onVisible)
    window.addEventListener("focus", onFocus)
    return () => {
      document.removeEventListener("visibilitychange", onVisible)
      window.removeEventListener("focus", onFocus)
    }
  }, [loadIntakes, statusFilter])

  return (
    <AdminShell
      title="Clinical Intakes"
      description={`Live from the shared database (same for every computer/IP). Pending = still needs doctor review. Approved patients move to “Awaiting payment” or “Approved / in progress”.`}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["pending", "Pending review"],
              ["awaiting_payment", "Awaiting payment"],
              ["awaiting_shipment", "Awaiting shipment"],
              ["approved", "Approved / in progress"],
              ["all", "All"],
            ] as const
          ).map(([value, label]) => (
            <Button
              key={value}
              size="sm"
              variant={statusFilter === value ? "default" : "outline"}
              onClick={() => {
                setStatusFilter(value)
                router.replace(`/admin/intakes?filter=${value}`)
              }}
            >
              {label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            {loading
              ? "Loading…"
              : `${intakes.length} intake${intakes.length === 1 ? "" : "s"}`}
          </p>
          <Button variant="outline" size="sm" onClick={() => loadIntakes(statusFilter)}>
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading intakes…</p>
      ) : intakes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {statusFilter === "pending"
              ? `No pending intakes. Click Refresh, or check “Awaiting payment” / “Approved / in progress” for patients already approved.`
              : statusFilter === "awaiting_payment"
                ? "No intakes awaiting pharmacy payment. Approved GLP patients waiting to pay will appear here."
                : statusFilter === "awaiting_shipment"
                  ? "No paid intakes waiting to ship. Mark processing moves a paid patient out of this queue."
                  : "No intakes in this view."}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}
          {intakes.map((intake) => (
            <Card key={`${intake.serviceType}-${intake.id}`} className="overflow-hidden">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm font-medium leading-snug">
                    <span className="text-foreground">
                      {intake.firstName} {intake.lastName}
                    </span>
                    <span className="text-muted-foreground"> · </span>
                    <span className="text-muted-foreground">{intake.serviceLabel}</span>
                    <span className="text-muted-foreground"> · </span>
                    <span>{intake.treatmentLabel}</span>
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {intake.email}
                    {intake.phone ? ` · ${formatPhoneDisplay(intake.phone)}` : ""}
                    {intake.state ? ` · ${intake.state}` : ""}
                    {" · "}
                    Submitted {new Date(intake.createdAt).toLocaleString()}
                    {intake.stripePaymentIntentId ? ` · ${intake.stripePaymentIntentId}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Badge variant="outline">{formatPortalStatus(intake.status)}</Badge>
                  <Badge
                    variant={
                      intake.paymentStatus === "captured"
                        ? "default"
                        : intake.paymentStatus === "failed"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {formatPaymentStatus(intake.paymentStatus)}
                  </Badge>
                  {intake.patientId ? (
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/customers/${intake.patientId}`}>Customer</Link>
                    </Button>
                  ) : null}
                  {statusFilter === "awaiting_shipment" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={processingId === intake.id}
                      onClick={() => void markProcessing(intake)}
                    >
                      {processingId === intake.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Mark processing
                    </Button>
                  ) : null}
                  {canAdminCancelIntake(intake.status, intake.paymentStatus) ? (
                    <AdminCancelIntakeButton
                      serviceType={intake.serviceType}
                      intakeId={intake.id}
                      label={`${intake.firstName} ${intake.lastName} · ${intake.treatmentLabel}`}
                      onCancelled={() => loadIntakes(statusFilter)}
                    />
                  ) : null}
                  <Button asChild size="sm">
                    <Link href={`/admin/intakes/${intake.serviceType}/${intake.id}`}>Open</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminShell>
  )
}
