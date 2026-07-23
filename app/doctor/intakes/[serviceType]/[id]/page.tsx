"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { DoctorShell } from "@/components/doctor-shell"
import { Button } from "@/components/ui/button"
import { AdminIntakeDetailView } from "@/components/admin-intake-detail-view"
import { staffAuthFetch } from "@/lib/staff-session"
import type { ClinicalRxPayload } from "@/lib/clinical-prescription-types"

type PageProps = { params: Promise<{ serviceType: string; id: string }> }

export default function DoctorIntakeDetailPage({ params }: PageProps) {
  const router = useRouter()
  const [serviceType, setServiceType] = useState("")
  const [id, setId] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [data, setData] = useState<{
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
  } | null>(null)

  useEffect(() => {
    params.then(({ serviceType: st, id: intakeId }) => {
      setServiceType(st)
      setId(intakeId)
      staffAuthFetch(`/api/admin/intakes/${st}/${intakeId}`)
        .then(async (res) => {
          if (res.status === 401) {
            router.push("/doctor/login")
            return
          }
          if (!res.ok) {
            const json = await res.json().catch(() => ({}))
            setError(json.error || `Failed to load intake (${res.status})`)
            return
          }
          const json = await res.json()
          setData(json)
        })
        .catch(() => setError("Failed to load intake. Check your connection and try again."))
        .finally(() => setLoading(false))
    })
  }, [params, router])

  if (loading) {
    return (
      <DoctorShell title="Intake review" description="Loading…">
        <p>Loading intake…</p>
      </DoctorShell>
    )
  }

  if (!data) {
    return (
      <DoctorShell title="Intake review" description="Unable to load intake">
        <div className="space-y-4">
          <p className="text-destructive">{error || "Intake not found."}</p>
          <Button variant="outline" asChild>
            <Link href="/doctor/intakes">← Back to queue</Link>
          </Button>
        </div>
      </DoctorShell>
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
      portal="doctor"
    />
  )
}
