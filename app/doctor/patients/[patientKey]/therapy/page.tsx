"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { DoctorShell } from "@/components/doctor-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PatientTherapyTimelineTable } from "@/components/patient-therapy-timeline-table"
import { staffAuthFetch } from "@/lib/staff-session"
import type { TherapyTimelineResult } from "@/lib/patient-therapy-timeline"
import { ArrowLeft } from "lucide-react"

export default function DoctorPatientTherapyPage() {
  const router = useRouter()
  const params = useParams()
  const patientKey = decodeURIComponent(String(params.patientKey || ""))
  const [timeline, setTimeline] = useState<TherapyTimelineResult | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [sendingKey, setSendingKey] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await staffAuthFetch(
        `/api/doctor/patients/${encodeURIComponent(patientKey)}/therapy`
      )
      if (res.status === 401) {
        router.push("/doctor/login")
        return
      }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to load")
      setTimeline(data.timeline)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientKey])

  const sendCheckIn = async (intakeId: string, monthIndex: number) => {
    const key = `${intakeId}:${monthIndex}`
    setSendingKey(key)
    setError("")
    try {
      const res = await staffAuthFetch(
        `/api/doctor/patients/${encodeURIComponent(patientKey)}/therapy`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ intakeId, monthIndex, forceResend: true }),
        }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to send")
      setTimeline(data.timeline)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send check-in")
    } finally {
      setSendingKey(null)
    }
  }

  return (
    <DoctorShell
      title="Therapy chart"
      description="Month-by-month dose, cost, and patient check-ins — use this to decide continue vs titrate."
    >
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/doctor/intakes">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to intakes
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{timeline?.patientName || "Patient"}</CardTitle>
          <CardDescription>
            {timeline?.email || patientKey} · Review tolerance and weight response before the next kit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading therapy chart…</p>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : timeline ? (
            <PatientTherapyTimelineTable
              timeline={timeline}
              canSendCheckIn
              sendingKey={sendingKey}
              onSendCheckIn={sendCheckIn}
            />
          ) : null}
        </CardContent>
      </Card>
    </DoctorShell>
  )
}
