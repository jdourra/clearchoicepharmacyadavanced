"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { AdminHeader } from "@/components/admin-header"
import { AdminMedicationForm } from "@/components/admin-medication-form"
import { Button } from "@/components/ui/button"
import type { AdminMedication } from "@/lib/admin-medications"
import { staffAuthFetch } from "@/lib/staff-session"

export default function AdminEditMedicationPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [medication, setMedication] = useState<AdminMedication | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const meRes = await staffAuthFetch("/api/admin/me")
        if (!meRes.ok) {
          router.push("/admin/login")
          return
        }
        const res = await staffAuthFetch(`/api/admin/medications/${id}`)
        if (!res.ok) {
          setError("Medication not found")
          return
        }
        const data = await res.json()
        setMedication(data.medication)
      } catch {
        router.push("/admin/login")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, router])

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <AdminHeader />
      <main className="flex-1 py-8">
        <div className="container max-w-3xl">
          <Button asChild variant="ghost" className="mb-6">
            <Link href="/admin/medications">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to medications
            </Link>
          </Button>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error || !medication ? (
            <p className="text-muted-foreground">{error || "Medication not found"}</p>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold">Edit medication</h1>
                <p className="text-muted-foreground mt-1">{medication.name}</p>
              </div>
              <AdminMedicationForm mode="edit" initial={medication} />
            </>
          )}
        </div>
      </main>
    </div>
  )
}
