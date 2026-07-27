"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { DoctorShell } from "@/components/doctor-shell"
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
  createdAt: string
}

type StatusFilter = "pending" | "approved" | "all"

export default function DoctorIntakesPage() {
  const router = useRouter()
  const [intakes, setIntakes] = useState<IntakeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending")

  const loadIntakes = useCallback(
    (filter: StatusFilter) => {
      setLoading(true)
      staffAuthFetch(`/api/admin/intakes?status=${filter}`)
        .then(async (res) => {
          if (!res.ok) {
            router.push("/doctor/login")
            return
          }
          const data = await res.json()
          setIntakes(data.intakes || [])
        })
        .catch(() => router.push("/doctor/login"))
        .finally(() => setLoading(false))
    },
    [router]
  )

  useEffect(() => {
    loadIntakes(statusFilter)
  }, [loadIntakes, statusFilter])

  return (
    <DoctorShell
      title="Clinical Intakes"
      description={`Pending and completed reviews for ${PRIMARY_PHYSICIAN.name}`}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["pending", "Pending"],
              ["approved", "Approved / in progress"],
              ["all", "All"],
            ] as const
          ).map(([value, label]) => (
            <Button
              key={value}
              size="sm"
              variant={statusFilter === value ? "default" : "outline"}
              onClick={() => setStatusFilter(value)}
            >
              {label}
            </Button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={() => loadIntakes(statusFilter)}>
          Refresh
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading intakes…</p>
      ) : intakes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No intakes in this view.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {intakes.map((intake) => (
            <Card key={`${intake.serviceType}-${intake.id}`} className="overflow-hidden">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm font-medium leading-snug">
                    {intake.firstName} {intake.lastName}
                    <span className="text-muted-foreground"> · {intake.serviceLabel} · </span>
                    {intake.treatmentLabel}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {intake.email}
                    {intake.phone ? ` · ${formatPhoneDisplay(intake.phone)}` : ""}
                    {" · "}
                    {new Date(intake.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Badge variant="outline">{formatPortalStatus(intake.status)}</Badge>
                  <Badge variant="secondary">{formatPaymentStatus(intake.paymentStatus)}</Badge>
                  <Button asChild size="sm">
                    <Link href={`/doctor/intakes/${intake.serviceType}/${intake.id}`}>Review</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DoctorShell>
  )
}
