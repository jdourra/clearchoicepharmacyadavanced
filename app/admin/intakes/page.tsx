"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AdminShell } from "@/components/admin-shell"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatPortalStatus } from "@/lib/patient-portal-types"
import { PRIMARY_PHYSICIAN } from "@/lib/clinical-provider"
import { staffAuthFetch } from "@/lib/staff-session"

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
  createdAt: string
}

export default function AdminIntakesPage() {
  const router = useRouter()
  const [intakes, setIntakes] = useState<IntakeRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    staffAuthFetch("/api/admin/intakes?status=pending")
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
  }, [router])

  if (loading) {
    return (
      <AdminShell title="Clinical Intakes" description="Loading…">
        <p>Loading intakes…</p>
      </AdminShell>
    )
  }

  return (
    <AdminShell
      title="Clinical Intakes"
      description={`Pending reviews for ${PRIMARY_PHYSICIAN.name} and the Clear Choice clinical team`}
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {intakes.length} intake{intakes.length === 1 ? "" : "s"} awaiting review
        </p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Refresh
        </Button>
      </div>

      {intakes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No pending intakes. New submissions will appear here for {PRIMARY_PHYSICIAN.name}&apos;s review.
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
                    {intake.phone ? ` · ${intake.phone}` : ""}
                    {intake.state ? ` · ${intake.state}` : ""}
                    {" · "}
                    Submitted {new Date(intake.createdAt).toLocaleString()}
                    {intake.stripePaymentIntentId ? " · Payment hold" : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant="outline" className="hidden sm:inline-flex">
                    {formatPortalStatus(intake.status)}
                  </Badge>
                  <Button asChild size="sm">
                    <Link href={`/admin/intakes/${intake.serviceType}/${intake.id}`}>Review</Link>
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
