"use client"

import type React from "react"
import { useState } from "react"
import { Upload, Stethoscope, ArrowRightLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { authFetch } from "@/lib/session"
import type { OrderPrescriptionDetails, PrescriptionMethod } from "@/lib/order-prescription"
import { prescriptionMethodLabel } from "@/lib/order-prescription"
import toast from "react-hot-toast"
import { isAllowedUploadFile } from "@/lib/upload-mime"

const PRESCRIPTION_UPLOAD_TYPES = new Set(["image/jpeg", "image/png", "application/pdf"])

type OrderPrescriptionFormProps = {
  orderId: string
  prescription: OrderPrescriptionDetails
  onUpdated: () => void
}

export function OrderPrescriptionForm({ orderId, prescription, onUpdated }: OrderPrescriptionFormProps) {
  const [method, setMethod] = useState<PrescriptionMethod>(
    prescription.method === "unknown" || prescription.method === "telemedicine"
      ? "upload"
      : prescription.method
  )
  const [doctorName, setDoctorName] = useState(prescription.doctorName || "")
  const [doctorPhone, setDoctorPhone] = useState(prescription.doctorPhone || "")
  const [transferRxNumbers, setTransferRxNumbers] = useState(
    prescription.transferRxNumbers.join("\n")
  )
  const [transferPharmacyName, setTransferPharmacyName] = useState(
    prescription.transferPharmacyName || ""
  )
  const [transferPharmacyPhone, setTransferPharmacyPhone] = useState(
    prescription.transferPharmacyPhone || ""
  )
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB")
      return
    }
    if (!isAllowedUploadFile(file, PRESCRIPTION_UPLOAD_TYPES)) {
      toast.error("Please upload a JPG, PNG, or PDF")
      return
    }
    setPrescriptionFile(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (method === "upload") {
        if (!prescriptionFile && prescription.uploads.length === 0) {
          throw new Error("Please select a prescription file to upload")
        }
        if (prescriptionFile) {
          const formData = new FormData()
          formData.append("file", prescriptionFile)
          const uploadRes = await authFetch(`/api/patient-orders/${orderId}/upload-prescription`, {
            method: "POST",
            body: formData,
          })
          const uploadData = await uploadRes.json()
          if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed")
        } else {
          const patchRes = await authFetch(`/api/orders/${orderId}/prescription`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prescriptionMethod: "upload" }),
          })
          if (!patchRes.ok) {
            const data = await patchRes.json()
            throw new Error(data.error || "Failed to save")
          }
        }
      } else {
        const patchRes = await authFetch(`/api/orders/${orderId}/prescription`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prescriptionMethod: method,
            doctorName,
            doctorPhone,
            transferRxNumbers,
            transferPharmacyName,
            transferPharmacyPhone,
          }),
        })
        const data = await patchRes.json()
        if (!patchRes.ok) throw new Error(data.error || "Failed to save")
      }

      toast.success("Prescription information saved. Our pharmacy team can see it now.")
      setPrescriptionFile(null)
      onUpdated()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  const transferRxList = transferRxNumbers
    .split(/[\n,]+/)
    .map((n) => n.trim())
    .filter(Boolean)

  const canSubmit =
    method === "upload"
      ? !!prescriptionFile || prescription.uploads.length > 0
      : method === "eprescribe"
        ? !!doctorName.trim() && !!doctorPhone.trim()
        : method === "transfer"
          ? transferRxList.length > 0 &&
            !!transferPharmacyName.trim() &&
            !!transferPharmacyPhone.trim()
          : false

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {prescription.method !== "unknown" && prescription.method !== "telemedicine" && (
        <p className="text-sm text-muted-foreground">
          Current method: <strong>{prescriptionMethodLabel(prescription.method)}</strong>
          {prescription.uploads.length > 0 && ` · ${prescription.uploads.length} file(s) on file`}
        </p>
      )}

      <RadioGroup
        value={method}
        onValueChange={(v) => setMethod(v as PrescriptionMethod)}
        className="space-y-3"
      >
        <div className="flex items-start space-x-3 border rounded-lg p-4">
          <RadioGroupItem value="upload" id="rx-upload" className="mt-1" />
          <div className="flex-1">
            <Label htmlFor="rx-upload" className="font-semibold cursor-pointer flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload prescription
            </Label>
            <p className="text-sm text-muted-foreground mt-1">Photo or PDF of your prescription</p>
            {method === "upload" && (
              <div className="mt-4 space-y-3">
                {prescription.uploads.length > 0 && (
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {prescription.uploads.map((u) => (
                      <li key={u.id}>
                        ✓ {u.file_name || "Prescription"} —{" "}
                        {new Date(u.upload_date).toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                )}
                <input
                  type="file"
                  id="rx-file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="rx-file"
                  className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer block"
                >
                  {prescriptionFile ? (
                    <p className="text-sm font-medium text-green-600">{prescriptionFile.name}</p>
                  ) : (
                    <p className="text-sm">Click to upload JPG, PNG, or PDF (max 10MB)</p>
                  )}
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-start space-x-3 border rounded-lg p-4">
          <RadioGroupItem value="eprescribe" id="rx-eprescribe" className="mt-1" />
          <div className="flex-1">
            <Label htmlFor="rx-eprescribe" className="font-semibold cursor-pointer flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Doctor will e-prescribe
            </Label>
            <p className="text-sm text-muted-foreground mt-1">We will follow up with your doctor&apos;s office</p>
            {method === "eprescribe" && (
              <div className="mt-4 grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="doctorName">Doctor name</Label>
                  <Input
                    id="doctorName"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctorPhone">Doctor phone</Label>
                  <Input
                    id="doctorPhone"
                    type="tel"
                    value={doctorPhone}
                    onChange={(e) => setDoctorPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-start space-x-3 border rounded-lg p-4">
          <RadioGroupItem value="transfer" id="rx-transfer" className="mt-1" />
          <div className="flex-1">
            <Label htmlFor="rx-transfer" className="font-semibold cursor-pointer flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4" />
              Transfer from another pharmacy
            </Label>
            {method === "transfer" && (
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="transferRx">Prescription numbers</Label>
                  <textarea
                    id="transferRx"
                    rows={3}
                    value={transferRxNumbers}
                    onChange={(e) => setTransferRxNumbers(e.target.value)}
                    placeholder="One RX number per line"
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="transferPharmacy">Pharmacy name</Label>
                    <Input
                      id="transferPharmacy"
                      value={transferPharmacyName}
                      onChange={(e) => setTransferPharmacyName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transferPharmacyPhone">Pharmacy phone</Label>
                    <Input
                      id="transferPharmacyPhone"
                      type="tel"
                      value={transferPharmacyPhone}
                      onChange={(e) => setTransferPharmacyPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </RadioGroup>

      <Button type="submit" disabled={saving || !canSubmit} className="w-full sm:w-auto">
        {saving ? "Saving..." : "Save prescription information"}
      </Button>
    </form>
  )
}
