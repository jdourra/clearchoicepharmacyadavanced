"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AdminShell } from "@/components/admin-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatPortalStatus } from "@/lib/patient-portal-types"
import { PRIMARY_PHYSICIAN } from "@/lib/clinical-provider"
import { buildIntakeReviewLayout } from "@/lib/intake-admin-display"
import { WEIGHT_LOSS_LIVE_VISIT_ADDON } from "@/lib/weight-loss-catalog"
import { staffAuthFetch } from "@/lib/staff-session"
import type { ClinicalRxPayload } from "@/lib/clinical-prescription-types"
import { ExternalLink, ChevronDown, Loader2, Printer } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import type { AdminIntakeServiceType } from "@/lib/telehealth/intake-registry"

const RX_SERVICES = new Set([
  "weight_loss",
  "trt",
  "rejuvenation_vial",
  "mens_health",
  "prescription_telemedicine",
])

type AdminIntakeDetailViewProps = {
  serviceType: AdminIntakeServiceType | string
  id: string
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
  suggestedPrescription,
  existingPrescription,
  dropboxSignConfigured = false,
}: AdminIntakeDetailViewProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [note, setNote] = useState("")
  const [error, setError] = useState("")
  const [reviewMessage, setReviewMessage] = useState("")
  const [liveVisitRequired, setLiveVisitRequired] = useState(false)
  const [sesSandbox, setSesSandbox] = useState<boolean | null>(null)
  const [sesHint, setSesHint] = useState<string | null>(null)
  const [sesReviewStatus, setSesReviewStatus] = useState<string | null>(null)
  const [rxMedication, setRxMedication] = useState(suggestedPrescription?.medicationName ?? "")
  const [rxStrength, setRxStrength] = useState(suggestedPrescription?.strength ?? "")
  const [rxDirections, setRxDirections] = useState(suggestedPrescription?.directions ?? "")
  const [rxQuantity, setRxQuantity] = useState(suggestedPrescription?.quantity ?? "")
  const [rxRefills, setRxRefills] = useState(String(suggestedPrescription?.refills ?? 0))
  const [clinicianEsignName, setClinicianEsignName] = useState("")

  useEffect(() => {
    staffAuthFetch("/api/admin/ses-health")
      .then(async (res) => {
        if (!res.ok) return
        const data = await res.json()
        setSesSandbox(data.canEmailPatients === false)
        setSesHint(data.productionAccessHint ?? null)
        setSesReviewStatus(data.reviewStatus ?? null)
      })
      .catch(() => {})
  }, [])

  const patientName = `${detail.first_name ?? ""} ${detail.last_name ?? ""}`.trim()
  const layout = buildIntakeReviewLayout(
    serviceType as AdminIntakeServiceType,
    detail,
    id
  )
  const hasFrontId = Boolean(detail.id_front_key)
  const hasBackId = Boolean(detail.id_back_key)
  const isWeightLoss = serviceType === "weight_loss"
  const weightLossIsMonthly = String(detail.selected_billing_plan ?? "") === "monthly"
  const canChargeLiveVisit = isWeightLoss && weightLossIsMonthly
  const needsPrescription = RX_SERVICES.has(String(serviceType))

  const handlePrint = () => {
    window.print()
  }

  const submitReview = async (action: "approve" | "deny" | "follow_up") => {
    setSubmitting(action)
    setError("")
    setReviewMessage("")
    try {
      const prescription =
        action === "approve" && needsPrescription
          ? {
              medicationName: rxMedication.trim(),
              strength: rxStrength.trim(),
              directions: rxDirections.trim(),
              quantity: rxQuantity.trim(),
              refills: Number(rxRefills) || 0,
              clinicianEsignName: clinicianEsignName.trim() || undefined,
            }
          : undefined

      if (action === "approve" && needsPrescription) {
        if (!prescription?.medicationName || !prescription.directions) {
          throw new Error("Enter medication name and directions before approving.")
        }
        if (!dropboxSignConfigured && !prescription.clinicianEsignName) {
          throw new Error("Enter your typed e-signature name (or configure Dropbox Sign).")
        }
      }

      const res = await staffAuthFetch(`/api/admin/intakes/${serviceType}/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          note: note || undefined,
          liveVisitRequired: canChargeLiveVisit ? liveVisitRequired : false,
          prescription,
        }),
      })
      const result = await res.json()
      if (!res.ok) {
        throw new Error(result.error || "Review failed")
      }

      const parts: string[] = ["Decision saved."]
      if (result.emailSent) {
        parts.push(`Confirmation email sent to ${detail.email}.`)
      } else if (result.emailError) {
        parts.push(result.emailError)
      }
      if (result.prescriptionId) {
        if (result.dropboxSent) {
          parts.push("Prescription sent to Dropbox Sign for clinician signature.")
        } else if (result.prescriptionStatus === "signed_local") {
          parts.push("Prescription signed locally — admin notified to print.")
        } else {
          parts.push(`Prescription created (${result.prescriptionId}).`)
        }
      }
      if (result.dropboxError) {
        parts.push(`Prescription issue: ${result.dropboxError}`)
      }
      setReviewMessage(parts.join(" "))
      setTimeout(() => router.push("/admin/intakes"), result.emailSent && !result.dropboxError ? 1800 : 4500)
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
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle>{treatmentLabel}</CardTitle>
                    <Badge>{formatPortalStatus(String(detail.status ?? ""))}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-muted/40 border px-4 py-3 space-y-2 text-sm">
                    <p className="font-medium text-foreground">{layout.patientLine}</p>
                    {layout.addressLine && (
                      <p className="text-muted-foreground">{layout.addressLine}</p>
                    )}
                    {layout.treatmentLine && (
                      <p className="text-foreground">{layout.treatmentLine}</p>
                    )}
                    <p className="text-xs text-muted-foreground font-mono">{layout.metaLine}</p>
                  </div>

                  {layout.clinicalItems.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-foreground">Clinical screening</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {layout.clinicalItems.map((item) => (
                          <div
                            key={item.label}
                            className="rounded-md border bg-background px-3 py-2 text-sm"
                          >
                            <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                            <p className="mt-0.5 break-words whitespace-pre-wrap">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {layout.adminItems.length > 0 && (
                    <Collapsible className="no-print">
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full justify-between px-2">
                          <span className="text-muted-foreground">Admin &amp; billing details</span>
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-2">
                        <div className="rounded-md border bg-muted/20 px-3 py-2 space-y-2 text-xs font-mono">
                          {layout.adminItems.map((item) => (
                            <div key={item.label} className="break-all">
                              <span className="text-muted-foreground">{item.label}: </span>
                              {item.value}
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}

                  {layout.adminItems.length > 0 && (
                    <div className="hidden print:block space-y-1 text-xs">
                      <p className="font-semibold">Admin &amp; billing</p>
                      {layout.adminItems.map((item) => (
                        <p key={item.label}>
                          {item.label}: {item.value}
                        </p>
                      ))}
                    </div>
                  )}
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
              {sesSandbox && (
                <Alert variant={sesReviewStatus === "DENIED" ? "destructive" : "default"}>
                  <AlertDescription>
                    {sesHint ||
                      "AWS SES is in sandbox mode. Patient emails to external addresses will fail until production access is granted."}
                  </AlertDescription>
                </Alert>
              )}
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
                    {Boolean(detail.stripe_payment_intent_id) && (
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

                  {isWeightLoss && (
                    <div className="rounded-lg border p-3 space-y-2">
                      {canChargeLiveVisit ? (
                        <div className="flex items-start gap-2">
                          <Checkbox
                            id="liveVisitRequired"
                            checked={liveVisitRequired}
                            onCheckedChange={(checked) => setLiveVisitRequired(checked === true)}
                          />
                          <Label htmlFor="liveVisitRequired" className="font-normal cursor-pointer leading-snug">
                            Live visit required — capture +${WEIGHT_LOSS_LIVE_VISIT_ADDON} add-on with kit
                          </Label>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Quarterly supply: live visit add-on (${WEIGHT_LOSS_LIVE_VISIT_ADDON}) is waived. Capture kit
                          total only.
                        </p>
                      )}
                    </div>
                  )}

                  {needsPrescription && (
                    <div className="rounded-lg border p-3 space-y-3">
                      <div>
                        <p className="text-sm font-medium">Prescription</p>
                        <p className="text-xs text-muted-foreground">
                          {dropboxSignConfigured
                            ? "On approve, generate Rx PDF and email Dropbox Sign to the clinician for e-signature. Admin is notified when signed and ready to print."
                            : "Dropbox Sign is not configured — type your e-signature name below. Admin is emailed a printable Rx on approve."}
                        </p>
                      </div>
                      {existingPrescription && (
                        <Alert>
                          <AlertDescription className="text-xs space-y-2">
                            <p>
                              Existing Rx: {existingPrescription.medicationName} ({existingPrescription.status})
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                try {
                                  const res = await staffAuthFetch(
                                    `/api/admin/prescriptions/${existingPrescription.id}/pdf`
                                  )
                                  if (!res.ok) {
                                    const data = await res.json().catch(() => ({}))
                                    throw new Error(data.error || "Could not open PDF")
                                  }
                                  const blob = await res.blob()
                                  const url = URL.createObjectURL(blob)
                                  window.open(url, "_blank", "noopener,noreferrer")
                                } catch (err) {
                                  setError(err instanceof Error ? err.message : "Could not open PDF")
                                }
                              }}
                            >
                              Open PDF
                            </Button>
                          </AlertDescription>
                        </Alert>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="rxMedication">Medication</Label>
                        <Input
                          id="rxMedication"
                          value={rxMedication}
                          onChange={(e) => setRxMedication(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rxStrength">Strength</Label>
                        <Input
                          id="rxStrength"
                          value={rxStrength}
                          onChange={(e) => setRxStrength(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rxDirections">Directions (SIG)</Label>
                        <Textarea
                          id="rxDirections"
                          value={rxDirections}
                          onChange={(e) => setRxDirections(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label htmlFor="rxQuantity">Quantity</Label>
                          <Input
                            id="rxQuantity"
                            value={rxQuantity}
                            onChange={(e) => setRxQuantity(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="rxRefills">Refills</Label>
                          <Input
                            id="rxRefills"
                            type="number"
                            min={0}
                            value={rxRefills}
                            onChange={(e) => setRxRefills(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="clinicianEsignName">
                          Clinician e-sign name{dropboxSignConfigured ? " (optional fallback)" : ""}
                        </Label>
                        <Input
                          id="clinicianEsignName"
                          value={clinicianEsignName}
                          onChange={(e) => setClinicianEsignName(e.target.value)}
                          placeholder={PRIMARY_PHYSICIAN.name}
                        />
                      </div>
                    </div>
                  )}

                  {error && <p className="text-sm text-destructive">{error}</p>}
                  {reviewMessage && (
                    <Alert variant={reviewMessage.includes("could not") || reviewMessage.includes("failed") ? "destructive" : "default"}>
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
                      {needsPrescription
                        ? dropboxSignConfigured
                          ? "Approve, capture & send for signature"
                          : "Approve, capture & sign Rx"
                        : "Approve & capture payment"}
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
                      {isWeightLoss ? "Request live visit / follow-up" : "Request follow-up"}
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
                      Deny & release hold
                    </Button>
                  </div>

                  {serviceType === "specialty_pharmacy" && (
                    <p className="text-xs text-muted-foreground">
                      Specialty intakes have no payment hold. Approve starts pharmacy coordination.
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Patient receives an email on approve, deny, or follow-up when SES production access
                    is enabled. Signed Rxs email the admin inbox for print.
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
