"use client"

import { useCallback, useRef, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { IntakePaymentValues } from "@/lib/intake-payment"
import { CheckCircle2, CreditCard, Loader2, Shield, Upload } from "lucide-react"
import { StripePaymentHold } from "@/components/stripe-payment-hold"

type IntakeIdentityPaymentProps = {
  values: IntakePaymentValues
  onChange: <K extends keyof IntakePaymentValues>(key: K, value: IntakePaymentValues[K]) => void
  totalBilled: number
  patientEmail: string
  serviceType: string
  intakePrefix?: string
  invalidFields?: Set<string>
  idPrefix?: string
}

function fieldInvalid(invalidFields: Set<string> | undefined, field: string) {
  return invalidFields?.has(field) ?? false
}

export function IntakeIdentityPaymentSection({
  values,
  onChange,
  totalBilled,
  patientEmail,
  serviceType,
  intakePrefix = "draft",
  invalidFields,
  idPrefix = "intake",
}: IntakeIdentityPaymentProps) {
  const isInvalid = (field: string) => fieldInvalid(invalidFields, field)
  const frontInputRef = useRef<HTMLInputElement>(null)
  const backInputRef = useRef<HTMLInputElement>(null)
  const [uploadErrors, setUploadErrors] = useState<{ front?: string; back?: string }>({})

  const uploadId = useCallback(
    async (side: "front" | "back", file: File | null) => {
      const fileKey = side === "front" ? "idFrontFile" : "idBackFile"
      const storageKey = side === "front" ? "idFrontKey" : "idBackKey"
      const uploadingKey = side === "front" ? "idFrontUploading" : "idBackUploading"
      const inputRef = side === "front" ? frontInputRef : backInputRef

      onChange(fileKey, file)
      if (!file) {
        onChange(storageKey, null)
        setUploadErrors((prev) => ({ ...prev, [side]: undefined }))
        return
      }

      onChange(uploadingKey, true)
      setUploadErrors((prev) => ({ ...prev, [side]: undefined }))

      try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("side", side)
        formData.append("intakePrefix", intakePrefix)

        const res = await fetch("/api/intake/upload-id", { method: "POST", body: formData })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || "Upload failed")

        onChange(storageKey, data.storageKey)
      } catch (err) {
        onChange(storageKey, null)
        setUploadErrors((prev) => ({
          ...prev,
          [side]: err instanceof Error ? err.message : "Upload failed. Please try again.",
        }))
      } finally {
        onChange(uploadingKey, false)
        if (inputRef.current) inputRef.current.value = ""
      }
    },
    [intakePrefix, onChange]
  )

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b pb-2">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Identity Verification</h3>
        </div>

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertTitle>Secure ID storage</AlertTitle>
          <AlertDescription>
            Your ID is encrypted and stored in HIPAA-eligible storage. It is used only for telemedicine identity
            verification.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2" data-field="idFrontFile">
            <Label className={cn(isInvalid("idFrontFile") && "text-destructive")}>Photo ID - Front *</Label>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-4 text-center hover:border-primary/50 transition-colors",
                isInvalid("idFrontFile") && "border-destructive ring-2 ring-destructive"
              )}
            >
              <input
                ref={frontInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
                onChange={(e) => uploadId("front", e.target.files?.[0] || null)}
                className="hidden"
                id={`${idPrefix}-idFront`}
              />
              <label htmlFor={`${idPrefix}-idFront`} className="cursor-pointer block">
                {values.idFrontUploading ? (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">Uploading...</span>
                  </div>
                ) : values.idFrontKey ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm">{values.idFrontFile?.name || "Front uploaded"}</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload front of ID</p>
                  </div>
                )}
              </label>
            </div>
            {uploadErrors.front && (
              <p className="text-sm text-destructive">{uploadErrors.front}</p>
            )}
          </div>

          <div className="space-y-2" data-field="idBackFile">
            <Label className={cn(isInvalid("idBackFile") && "text-destructive")}>Photo ID - Back *</Label>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-4 text-center hover:border-primary/50 transition-colors",
                isInvalid("idBackFile") && "border-destructive ring-2 ring-destructive"
              )}
            >
              <input
                ref={backInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
                onChange={(e) => uploadId("back", e.target.files?.[0] || null)}
                className="hidden"
                id={`${idPrefix}-idBack`}
              />
              <label htmlFor={`${idPrefix}-idBack`} className="cursor-pointer block">
                {values.idBackUploading ? (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">Uploading...</span>
                  </div>
                ) : values.idBackKey ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm">{values.idBackFile?.name || "Back uploaded"}</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload back of ID</p>
                  </div>
                )}
              </label>
            </div>
            {uploadErrors.back && (
              <p className="text-sm text-destructive">{uploadErrors.back}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b pb-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Payment Authorization</h3>
        </div>

        <Alert>
          <CreditCard className="h-4 w-4" />
          <AlertTitle>Authorization hold — ${totalBilled}</AlertTitle>
          <AlertDescription>
            Your card will be authorized for <strong>${totalBilled}</strong>. Funds are captured only after provider
            clinical approval.
          </AlertDescription>
        </Alert>

        {values.paymentAuthorized && values.stripePaymentIntentId ? (
          <div className="flex items-center gap-2 text-green-600 text-sm rounded-lg border border-green-200 bg-green-50 p-3">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            Payment hold authorized. You can submit your intake.
          </div>
        ) : (
          <StripePaymentHold
            amount={totalBilled}
            email={patientEmail}
            serviceType={serviceType}
            invalid={isInvalid("stripePayment")}
            onAuthorized={(paymentIntentId) => {
              onChange("stripePaymentIntentId", paymentIntentId)
              onChange("paymentAuthorized", true)
            }}
          />
        )}
      </div>
    </div>
  )
}
