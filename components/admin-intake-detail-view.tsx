"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AdminShell } from "@/components/admin-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatPortalStatus } from "@/lib/patient-portal-types"
import { PRIMARY_PHYSICIAN } from "@/lib/clinical-provider"
import { intakeDetailEntries } from "@/lib/intake-admin-display"
import { staffAuthFetch } from "@/lib/staff-session"
import { ExternalLink, Loader2, Printer } from "lucide-react"

type AdminIntakeDetailViewProps = {
  serviceType: string
  id: string
  serviceLabel: string
  treatmentLabel: string
  detail: Record<string, unknown>
}

function IdImagePanel({
  serviceType,
  intakeId,
  side,
  hasKey,
}: {
  serviceType: string
  intakeId: string
  side: "front" | "back"
  hasKey: boolean
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!hasKey) return

    let active = true
    let objectUrl: string | null = null

    const load = async () => {
      setLoading(true)
      setError("")
      setBlobUrl(null)
      try {
        const res = await staffAuthFetch(
          `/api/admin/intakes/${serviceType}/${intakeId}/id-file?side=${side}`
        )
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || `Could not load ID (${res.status})`)
        }
        const blob = await res.blob()
        objectUrl = URL.createObjectURL(blob)
        if (active) setBlobUrl(objectUrl)
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Failed to load ID image")
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()

    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [serviceType, intakeId, side, hasKey, reloadKey])

  const label = side === "front" ? "Photo ID — Front" : "Photo ID — Back"

  if (!hasKey) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground text-center">
        {label}: not uploaded
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">{label}</p>
        <Button type="button" variant="ghost" size="sm" onClick={() => setReloadKey((k) => k + 1)} disabled={loading}>
          Reload
        </Button>
      </div>
      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center border rounded-lg">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {blobUrl && !loading && (
        <div className="space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={blobUrl}
            alt={label}
            className="w-full max-h-72 object-contain rounded-lg border bg-muted/30"
          />
          <Button type="button" variant="outline" size="sm" asChild>
            <a href={blobUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open full size
            </a>
          </Button>
        </div>
      )}
    </div>
  )
}

export function AdminIntakeDetailView({
  serviceType,
  id,
  serviceLabel,
  treatmentLabel,
  detail,
}: AdminIntakeDetailViewProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [note, setNote] = useState("")
  const [error, setError] = useState("")
  const [reviewMessage, setReviewMessage] = useState("")

  const patientName = `${detail.first_name ?? ""} ${detail.last_name ?? ""}`.trim()
  const entries = intakeDetailEntries(detail)
  const hasFrontId = Boolean(detail.id_front_key)
  const hasBackId = Boolean(detail.id_back_key)

  const handlePrint = () => {
    window.print()
  }

  const submitReview = async (action: "approve" | "deny" | "follow_up") => {
    setSubmitting(action)
    setError("")
    setReviewMessage("")
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

      if (result.emailSent) {
        setReviewMessage(`Decision saved. Confirmation email sent to ${detail.email}.`)
        setTimeout(() => router.push("/admin/intakes"), 1500)
      } else {
        setReviewMessage(
          result.emailError ||
            "Decision saved, but the patient confirmation email could not be sent. Check SES configuration."
        )
        setTimeout(() => router.push("/admin/intakes"), 3500)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Review failed")
    } finally {
      setSubmitting(null)
    }
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #intake-print-area,
          #intake-print-area * {
            visibility: visible;
          }
          #intake-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 1rem;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <AdminShell
        title="Intake Review"
        description={`${serviceLabel} — ${patientName}`}
      >
        <div className="no-print mb-4 flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/intakes">← Back to queue</Link>
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print intake
          </Button>
        </div>

        <div id="intake-print-area">
          <div className="hidden print:block mb-6 border-b pb-4">
            <h1 className="text-xl font-bold">Clear Choice Pharmacy — Clinical Intake</h1>
            <p className="text-sm text-muted-foreground">
              {serviceLabel} · {PRIMARY_PHYSICIAN.name} · Printed {new Date().toLocaleString()}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle>{treatmentLabel}</CardTitle>
                    <Badge>{formatPortalStatus(String(detail.status ?? ""))}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground font-mono">{id}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {entries.map(({ key, label, value }) => (
                    <div key={key} className="border-b pb-2 last:border-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {label}
                      </p>
                      <p className="text-sm mt-0.5 break-words whitespace-pre-wrap">{value}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="no-print">
                <CardHeader>
                  <CardTitle className="text-base">Identity verification</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 sm:grid-cols-2">
                  <IdImagePanel
                    serviceType={serviceType}
                    intakeId={id}
                    side="front"
                    hasKey={hasFrontId}
                  />
                  <IdImagePanel
                    serviceType={serviceType}
                    intakeId={id}
                    side="back"
                    hasKey={hasBackId}
                  />
                </CardContent>
              </Card>

              <Card className="hidden print:block">
                <CardHeader>
                  <CardTitle className="text-base">Identity verification</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p>Photo ID front: {hasFrontId ? "On file (view in admin portal)" : "Not uploaded"}</p>
                  <p>Photo ID back: {hasBackId ? "On file (view in admin portal)" : "Not uploaded"}</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4 no-print">
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
                  {reviewMessage && (
                    <Alert variant={reviewMessage.includes("could not") ? "destructive" : "default"}>
                      <AlertDescription>{reviewMessage}</AlertDescription>
                    </Alert>
                  )}

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

                  <p className="text-xs text-muted-foreground">
                    Patient receives an email on approve, deny, or follow-up (requires AWS SES).
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AdminShell>
    </>
  )
}
