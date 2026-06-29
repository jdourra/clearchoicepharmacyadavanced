"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AdminShell } from "@/components/admin-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { formatPortalStatus } from "@/lib/patient-portal-types"
import { PRIMARY_PHYSICIAN } from "@/lib/clinical-provider"
import { staffAuthFetch } from "@/lib/staff-session"
import { Loader2 } from "lucide-react"

type PageProps = { params: Promise<{ serviceType: string; id: string }> }

const SKIP_DETAIL_KEYS = new Set(["id_front_key", "id_back_key", "intake_payload"])

export default function AdminIntakeDetailPage({ params }: PageProps) {
  const router = useRouter()
  const [serviceType, setServiceType] = useState("")
  const [id, setId] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [note, setNote] = useState("")
  const [error, setError] = useState("")
  const [data, setData] = useState<{
    serviceLabel: string
    treatmentLabel: string
    detail: Record<string, unknown>
  } | null>(null)

  useEffect(() => {
    params.then(({ serviceType: st, id: intakeId }) => {
      setServiceType(st)
      setId(intakeId)
      staffAuthFetch(`/api/admin/intakes/${st}/${intakeId}`)
        .then(async (res) => {
          if (!res.ok) {
            router.push("/admin/login")
            return
          }
          const json = await res.json()
          setData(json)
        })
        .catch(() => router.push("/admin/login"))
        .finally(() => setLoading(false))
    })
  }, [params, router])

  const submitReview = async (action: "approve" | "deny" | "follow_up") => {
    setSubmitting(action)
    setError("")
    try {
      const res = await staffAuthFetch(`/api/admin/intakes/${serviceType}/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note: note || undefined }),
      })
      const result = await res.json()
      if (!res.ok) {
        throw new Error(result.error || "Review failed")
      }
      router.push("/admin/intakes")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Review failed")
    } finally {
      setSubmitting(null)
    }
  }

  if (loading || !data) {
    return (
      <AdminShell title="Intake Review" description="Loading…">
        <p>Loading intake…</p>
      </AdminShell>
    )
  }

  const detail = data.detail
  const patientName = `${detail.first_name ?? ""} ${detail.last_name ?? ""}`.trim()

  return (
    <AdminShell
      title="Intake Review"
      description={`${data.serviceLabel} — ${patientName}`}
    >
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/intakes">← Back to queue</Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>{data.treatmentLabel}</CardTitle>
                <Badge>{formatPortalStatus(String(detail.status ?? ""))}</Badge>
              </div>
              <p className="text-sm text-muted-foreground font-mono">{id}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(detail)
                .filter(([key, value]) => value != null && value !== "" && !SKIP_DETAIL_KEYS.has(key))
                .map(([key, value]) => (
                  <div key={key} className="border-b pb-2 last:border-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {key.replace(/_/g, " ")}
                    </p>
                    <p className="text-sm mt-0.5 break-words whitespace-pre-wrap">
                      {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                    </p>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{PRIMARY_PHYSICIAN.name}&apos;s Decision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>
                  <strong>Patient:</strong> {patientName}
                </p>
                <p>
                  <strong>Email:</strong> {String(detail.email ?? "")}
                </p>
                {detail.stripe_payment_intent_id && (
                  <p className="mt-2 font-mono text-xs break-all">
                    Stripe: {String(detail.stripe_payment_intent_id)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Note to patient (optional)</Label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Follow-up questions or denial reason…"
                  rows={4}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex flex-col gap-2">
                <Button
                  className="w-full bg-green-700 hover:bg-green-600"
                  disabled={!!submitting}
                  onClick={() => submitReview("approve")}
                >
                  {submitting === "approve" ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Approve &amp; capture payment
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={!!submitting}
                  onClick={() => submitReview("follow_up")}
                >
                  {submitting === "follow_up" ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Request follow-up
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  disabled={!!submitting}
                  onClick={() => submitReview("deny")}
                >
                  {submitting === "deny" ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Deny &amp; release hold
                </Button>
              </div>

              {serviceType === "specialty_pharmacy" && (
                <p className="text-xs text-muted-foreground">
                  Specialty intakes have no payment hold. Approve starts pharmacy coordination.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  )
}
