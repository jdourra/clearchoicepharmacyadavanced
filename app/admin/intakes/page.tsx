"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AdminShell } from "@/components/admin-shell"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatPortalStatus } from "@/lib/patient-portal-types"
import { PRIMARY_PHYSICIAN } from "@/lib/clinical-provider"

type IntakeRow = {
  serviceType: string
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
    fetch("/api/admin/intakes?status=pending", { credentials: "include" })
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
        <div className="space-y-3">
          {intakes.map((intake) => (
            <Card key={`${intake.serviceType}-${intake.id}`}>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">
                      {intake.firstName} {intake.lastName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {intake.email}
                      {intake.phone ? ` · ${intake.phone}` : ""}
                      {intake.state ? ` · ${intake.state}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{intake.serviceType.replace(/_/g, " ")}</Badge>
                    <Badge variant="outline">{formatPortalStatus(intake.status)}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-0">
                <div className="text-sm">
                  <p className="font-medium">{intake.treatmentLabel}</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Submitted {new Date(intake.createdAt).toLocaleString()}
                    {intake.stripePaymentIntentId ? " · Payment hold on file" : ""}
                  </p>
                </div>
                <Button asChild>
                  <Link href={`/admin/intakes/${intake.serviceType}/${intake.id}`}>Review</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminShell>
  )
}
