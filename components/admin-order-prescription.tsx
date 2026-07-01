"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import {
  Upload,
  Stethoscope,
  ArrowRightLeft,
  FileText,
  Printer,
  ExternalLink,
  Phone,
  User,
  Building2,
  Clock,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { OrderPrescriptionDetails } from "@/lib/order-prescription"
import { prescriptionMethodLabel } from "@/lib/order-prescription"
import { PRIMARY_PHYSICIAN, physicianReviewPendingLabel } from "@/lib/clinical-provider"
import { formatPortalStatus } from "@/lib/patient-portal-types"
import { staffAuthFetch } from "@/lib/staff-session"

type AdminOrderPrescriptionPanelProps = {
  orderId: string
  prescription: OrderPrescriptionDetails
  onRefresh?: () => void
}

function MethodIcon({ method }: { method: OrderPrescriptionDetails["method"] }) {
  switch (method) {
    case "upload":
      return <Upload className="h-5 w-5 text-primary" />
    case "eprescribe":
      return <Stethoscope className="h-5 w-5 text-primary" />
    case "transfer":
      return <ArrowRightLeft className="h-5 w-5 text-primary" />
    case "telemedicine":
      return <FileText className="h-5 w-5 text-primary" />
    default:
      return <FileText className="h-5 w-5 text-muted-foreground" />
  }
}

export function AdminOrderPrescriptionPanel({
  orderId,
  prescription,
  onRefresh,
}: AdminOrderPrescriptionPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")

  const viewUrl = (uploadId: string) => `/api/admin/orders/${orderId}/prescription-file?uploadId=${uploadId}`

  const handleAdminUpload = async (file: File) => {
    setUploading(true)
    setUploadError("")
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await staffAuthFetch(`/api/admin/orders/${orderId}/upload-prescription`, {
        method: "POST",
        body: formData,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || "Upload failed")
      }
      onRefresh?.()
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handlePrintUpload = (uploadId: string) => {
    const url = viewUrl(uploadId)
    const win = window.open(url, "_blank")
    if (win) {
      win.onload = () => {
        setTimeout(() => win.print(), 500)
      }
    }
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <MethodIcon method={prescription.method} />
            <div>
              <CardTitle>Prescription Source</CardTitle>
              <CardDescription>{prescriptionMethodLabel(prescription.method)}</CardDescription>
            </div>
          </div>
          {prescription.deliveryMethod && (
            <Badge variant="outline" className="capitalize">
              {prescription.deliveryMethod}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {prescription.method === "upload" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-dashed p-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Upload or replace the prescription file (JPG, PNG, or PDF, max 10MB). Use this if the
                order was placed before S3 storage was enabled.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void handleAdminUpload(file)
                }}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "Uploading…" : "Upload / replace prescription"}
              </Button>
              {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}
            </div>
            {prescription.uploads.length > 0 ? (
              prescription.uploads.map((upload) => (
                <div
                  key={upload.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg border bg-muted/30"
                >
                  <div>
                    <p className="font-medium">{upload.file_name || "Prescription file"}</p>
                    <p className="text-sm text-muted-foreground">
                      Uploaded {new Date(upload.upload_date).toLocaleString()}
                    </p>
                    <Badge variant="outline" className="mt-2">
                      {formatPortalStatus(upload.status)}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm" className="bg-transparent">
                      <Link href={viewUrl(upload.id)} target="_blank">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </Link>
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handlePrintUpload(upload.id)}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                Patient selected upload, but no prescription file is on file yet. Ask them to re-upload or
                send a photo by message.
              </div>
            )}
          </div>
        )}

        {prescription.method === "eprescribe" && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex gap-3 p-4 rounded-lg bg-muted/40">
              <User className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Prescribing doctor</p>
                <p className="font-semibold">{prescription.doctorName || "Not provided"}</p>
              </div>
            </div>
            <div className="flex gap-3 p-4 rounded-lg bg-muted/40">
              <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Doctor phone</p>
                <p className="font-semibold">{prescription.doctorPhone || "Not provided"}</p>
              </div>
            </div>
            <p className="sm:col-span-2 text-sm text-muted-foreground">
              Waiting for the doctor to e-prescribe to Clear Choice Pharmacy. Follow up with the office if
              needed.
            </p>
          </div>
        )}

        {prescription.method === "transfer" && (
          <div className="space-y-4">
            <div className="flex gap-3 p-4 rounded-lg bg-muted/40">
              <Building2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transfer from pharmacy</p>
                <p className="font-semibold">{prescription.transferPharmacyName || "Not provided"}</p>
                {prescription.transferPharmacyPhone && (
                  <p className="text-sm mt-1">
                    <Phone className="inline h-3.5 w-3.5 mr-1" />
                    {prescription.transferPharmacyPhone}
                  </p>
                )}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/40">
              <p className="text-sm font-medium text-muted-foreground mb-2">RX numbers to transfer</p>
              {prescription.transferRxNumbers.length > 0 ? (
                <ul className="list-disc list-inside text-sm space-y-1">
                  {prescription.transferRxNumbers.map((rx) => (
                    <li key={rx} className="font-medium">
                      {rx}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No RX numbers recorded</p>
              )}
            </div>
          </div>
        )}

        {prescription.method === "telemedicine" && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-lg border border-primary/20 bg-primary/5">
              <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{physicianReviewPendingLabel()}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Telemedicine intake received. Waiting for physician approval before the prescription can
                  be filled.
                </p>
                {prescription.telemedicineIntake && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Intake ref: {prescription.telemedicineIntake.id} · Submitted{" "}
                    {new Date(prescription.telemedicineIntake.created_at).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex gap-3 p-4 rounded-lg bg-muted/40">
                <User className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reviewing physician</p>
                  <p className="font-semibold">{PRIMARY_PHYSICIAN.name}</p>
                  <p className="text-xs text-muted-foreground">{PRIMARY_PHYSICIAN.credentials}</p>
                </div>
              </div>
              <div className="flex gap-3 p-4 rounded-lg bg-muted/40">
                <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Physician / pharmacy line</p>
                  <p className="font-semibold">{PRIMARY_PHYSICIAN.pharmacyPhone}</p>
                </div>
              </div>
            </div>
            {prescription.telemedicineIntake && (
              <Badge variant="secondary">
                Status: {formatPortalStatus(prescription.telemedicineIntake.status)}
              </Badge>
            )}
          </div>
        )}

        {prescription.method === "unknown" && prescription.rawNotes && (
          <div className="p-4 rounded-lg bg-muted/40 text-sm whitespace-pre-wrap">{prescription.rawNotes}</div>
        )}
      </CardContent>
    </Card>
  )
}
