"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DoctorShell } from "@/components/doctor-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { staffAuthFetch } from "@/lib/staff-session"

type PatientRow = {
  patientKey: string
  name: string
  email: string
  latestProgram: string
  latestAt: string
}

export default function DoctorPatientsPage() {
  const router = useRouter()
  const [rows, setRows] = useState<PatientRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    staffAuthFetch("/api/doctor/patients")
      .then(async (res) => {
        if (res.status === 401) {
          router.push("/doctor/login")
          return
        }
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed to load")
        setRows(data.patients || [])
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false))
  }, [router])

  return (
    <DoctorShell
      title="Therapy charts"
      description="Weight-loss patients with month-by-month dose history and check-ins."
    >
      <Card>
        <CardHeader>
          <CardTitle>Patients on GLP therapy</CardTitle>
          <CardDescription>
            Open a chart to review dose by month, cost, kits remaining, and patient tolerance replies.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No weight-loss intakes found yet.</p>
          ) : (
            <div className="space-y-2">
              {rows.map((row) => (
                <div
                  key={row.patientKey}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{row.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.email} · {row.latestProgram} ·{" "}
                      {new Date(row.latestAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button asChild size="sm">
                    <Link href={`/doctor/patients/${encodeURIComponent(row.patientKey)}/therapy`}>
                      Open therapy chart
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DoctorShell>
  )
}
