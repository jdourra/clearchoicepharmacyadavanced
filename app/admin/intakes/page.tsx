"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { AdminShell } from "@/components/admin-shell"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatPortalStatus } from "@/lib/patient-portal-types"
import { formatPaymentStatus } from "@/lib/intake-payment-status"
import { PRIMARY_PHYSICIAN } from "@/lib/clinical-provider"
import { staffAuthFetch } from "@/lib/staff-session"
import { formatPhoneDisplay } from "@/lib/phone"

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
}

type StatusFilter = "pending" | "awaiting_payment" | "approved" | "all"

export default function AdminIntakesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const filterParam = searchParams.get("filter")
  const initialFilter: StatusFilter =
    filterParam === "awaiting_payment" ||
    filterParam === "approved" ||
    filterParam === "all" ||
    filterParam === "pending"
      ? filterParam
      : "pending"

  const [intakes, setIntakes] = useState<IntakeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialFilter)

  useEffect(() => {
    if (
      filterParam === "awaiting_payment" ||
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

  return (
    <AdminShell
      title="Clinical Intakes"
      description={`Reviews for ${PRIMARY_PHYSICIAN.name} and the Clear Choice clinical team`}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["pending", "Pending review"],
              ["awaiting_payment", "Awaiting payment"],
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
              ? `No pending intakes. New submissions will appear here for ${PRIMARY_PHYSICIAN.name}'s review.`
              : statusFilter === "awaiting_payment"
                ? "No intakes awaiting pharmacy payment. Approved GLP patients waiting to pay will appear here."
                : "No intakes in this view."}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
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
