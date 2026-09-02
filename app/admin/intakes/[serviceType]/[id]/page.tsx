"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AdminShell } from "@/components/admin-shell"
import { Button } from "@/components/ui/button"
import { AdminIntakeDetailView } from "@/components/admin-intake-detail-view"
import { staffAuthFetch } from "@/lib/staff-session"
import type { ClinicalRxPayload } from "@/lib/clinical-prescription-types"

type PageProps = { params: Promise<{ serviceType: string; id: string }> }

type IntakeDetailData = {
  serviceLabel: string
  treatmentLabel: string
  detail: Record<string, unknown>
  suggestedPrescription?: ClinicalRxPayload
  existingPrescription?: {
    id: string
    status: string
    medicationName: string
  } | null
  dropboxSignConfigured?: boolean
}

export default function AdminIntakeDetailPage({ params }: PageProps) {
  const router = useRouter()
  const [serviceType, setServiceType] = useState("")
  const [id, setId] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [data, setData] = useState<IntakeDetailData | null>(null)

  const loadIntake = useCallback(async (st: string, intakeId: string) => {
    setLoading(true)
    setError("")
    try {
      const res = await staffAuthFetch(`/api/admin/intakes/${st}/${intakeId}`)
      if (res.status === 401) {
        router.push("/admin/login")
        return
      }
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setError(json.error || `Failed to load intake (${res.status})`)
        setData(null)
        return
      }
      const json = await res.json()
      setData(json)
    } catch {
      setError("Failed to load intake. Check your connection and try again.")
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    params.then(({ serviceType: st, id: intakeId }) => {
      setServiceType(st)
      setId(intakeId)
      void loadIntake(st, intakeId)
    })
  }, [params, loadIntake])

  if (loading && !data) {
    return (
      <AdminShell title="Intake Review" description="Loading…">
        <p>Loading intake…</p>
      </AdminShell>
    )
  }

  if (!data) {
    return (
      <AdminShell title="Intake Review" description="Unable to load intake">
        <div className="space-y-4">
          <p className="text-destructive">{error || "Intake not found."}</p>
          <Button variant="outline" asChild>
            <Link href="/admin/intakes">← Back to queue</Link>
          </Button>
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminIntakeDetailView
      serviceType={serviceType}
      id={id}
      serviceLabel={data.serviceLabel}
      treatmentLabel={data.treatmentLabel}
      detail={data.detail}
      suggestedPrescription={data.suggestedPrescription}
      existingPrescription={data.existingPrescription}
      dropboxSignConfigured={Boolean(data.dropboxSignConfigured)}
      portal="admin"
      onReload={() => {
        if (serviceType && id) void loadIntake(serviceType, id)
      }}
    />
  )
}
