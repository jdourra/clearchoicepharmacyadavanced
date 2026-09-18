"use client"

import { useCallback, useRef, useState, type RefObject } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { IntakePaymentValues } from "@/lib/intake-payment"
import {
  ID_FILE_ACCEPT,
  isAllowedIdUploadFile,
  messageForIdUploadFailure,
  prepareIdUploadFile,
} from "@/lib/prepare-id-upload"
import { Camera, CheckCircle2, CreditCard, ImageIcon, Loader2, Shield } from "lucide-react"
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
  /** When false, only ID upload is shown (e.g. telemedicine linked to an existing cash-pay order). */
  showPayment?: boolean
}

function fieldInvalid(invalidFields: Set<string> | undefined, field: string) {
  return invalidFields?.has(field) ?? false
}

type UploadPhase = "idle" | "preparing" | "uploading"

export function IntakeIdentityPaymentSection({
  values,
  onChange,
  totalBilled,
  patientEmail,
  serviceType,
  intakePrefix = "draft",
  invalidFields,
  idPrefix = "intake",
  showPayment = true,
}: IntakeIdentityPaymentProps) {
  const isInvalid = (field: string) => fieldInvalid(invalidFields, field)
  const frontGalleryRef = useRef<HTMLInputElement>(null)
  const frontCameraRef = useRef<HTMLInputElement>(null)
  const backGalleryRef = useRef<HTMLInputElement>(null)
  const backCameraRef = useRef<HTMLInputElement>(null)
  const [uploadErrors, setUploadErrors] = useState<{ front?: string; back?: string }>({})
  const [phase, setPhase] = useState<{ front: UploadPhase; back: UploadPhase }>({
    front: "idle",
    back: "idle",
  })

  const uploadId = useCallback(
    async (side: "front" | "back", file: File | null) => {
      const fileKey = side === "front" ? "idFrontFile" : "idBackFile"
      const storageKey = side === "front" ? "idFrontKey" : "idBackKey"
      const uploadingKey = side === "front" ? "idFrontUploading" : "idBackUploading"
      const galleryRef = side === "front" ? frontGalleryRef : backGalleryRef
      const cameraRef = side === "front" ? frontCameraRef : backCameraRef

      onChange(fileKey, file)
      if (!file) {
        onChange(storageKey, null)
        setUploadErrors((prev) => ({ ...prev, [side]: undefined }))
        setPhase((prev) => ({ ...prev, [side]: "idle" }))
        return
      }

      if (!isAllowedIdUploadFile(file)) {
        onChange(fileKey, null)
        onChange(storageKey, null)
        setUploadErrors((prev) => ({
          ...prev,
          [side]: "Please upload a photo (JPEG, PNG, or HEIC) or a PDF of your ID.",
        }))
        if (galleryRef.current) galleryRef.current.value = ""
        if (cameraRef.current) cameraRef.current.value = ""
        return
      }

      onChange(uploadingKey, true)
      setPhase((prev) => ({ ...prev, [side]: "preparing" }))
      setUploadErrors((prev) => ({ ...prev, [side]: undefined }))

      try {
        const prepared = await prepareIdUploadFile(file)
        onChange(fileKey, prepared)
        setPhase((prev) => ({ ...prev, [side]: "uploading" }))

        const formData = new FormData()
        formData.append("file", prepared)
        formData.append("side", side)
        formData.append("intakePrefix", intakePrefix)

        const res = await fetch("/api/intake/upload-id", { method: "POST", body: formData })
        const data = await res.json().catch(() => ({} as { error?: string }))
        if (!res.ok) throw new Error(messageForIdUploadFailure(res.status, data.error))

        onChange(storageKey, data.storageKey)
      } catch (err) {
        onChange(storageKey, null)
        setUploadErrors((prev) => ({
          ...prev,
          [side]: err instanceof Error ? err.message : "Upload failed. Please try again.",
        }))
      } finally {
        onChange(uploadingKey, false)
        setPhase((prev) => ({ ...prev, [side]: "idle" }))
        if (galleryRef.current) galleryRef.current.value = ""
        if (cameraRef.current) cameraRef.current.value = ""
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
            Upload the <strong>front and back</strong> of your driver&apos;s license or state ID. You can take a
            photo or choose a file (JPEG, PNG, HEIC, or PDF). Large iPhone photos are compressed automatically. Your
            ID is encrypted and used only for telemedicine identity verification.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 sm:grid-cols-2">
          <IdSideUploader
            side="front"
            label="Photo ID - Front *"
            inputId={`${idPrefix}-idFront`}
            galleryRef={frontGalleryRef}
            cameraRef={frontCameraRef}
            invalid={isInvalid("idFrontFile")}
            uploaded={Boolean(values.idFrontKey)}
            fileName={values.idFrontFile?.name}
            phase={phase.front}
            error={uploadErrors.front}
            onFile={(file) => uploadId("front", file)}
          />
          <IdSideUploader
            side="back"
            label="Photo ID - Back *"
            inputId={`${idPrefix}-idBack`}
            galleryRef={backGalleryRef}
            cameraRef={backCameraRef}
            invalid={isInvalid("idBackFile")}
            uploaded={Boolean(values.idBackKey)}
            fileName={values.idBackFile?.name}
            phase={phase.back}
            error={uploadErrors.back}
            onFile={(file) => uploadId("back", file)}
          />
        </div>
      </div>

      {showPayment && (
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
      )}
    </div>
  )
}

function IdSideUploader({
  side,
  label,
  inputId,
  galleryRef,
  cameraRef,
  invalid,
  uploaded,
  fileName,
  phase,
  error,
  onFile,
}: {
  side: "front" | "back"
  label: string
  inputId: string
  galleryRef: RefObject<HTMLInputElement | null>
  cameraRef: RefObject<HTMLInputElement | null>
  invalid: boolean
  uploaded: boolean
  fileName?: string
  phase: UploadPhase
  error?: string
  onFile: (file: File | null) => void
}) {
  const busy = phase !== "idle"
  const busyLabel = phase === "preparing" ? "Preparing photo..." : "Uploading..."

  return (
    <div className="space-y-2" data-field={side === "front" ? "idFrontFile" : "idBackFile"}>
      <Label className={cn(invalid && "text-destructive")}>{label}</Label>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-4 text-center transition-colors",
          invalid && "border-destructive ring-2 ring-destructive"
        )}
      >
        <input
          ref={galleryRef}
          type="file"
          accept={ID_FILE_ACCEPT}
          onChange={(e) => onFile(e.target.files?.[0] || null)}
          className="sr-only"
          id={inputId}
          disabled={busy}
        />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => onFile(e.target.files?.[0] || null)}
          className="sr-only"
          id={`${inputId}-camera`}
          disabled={busy}
        />

        {busy ? (
          <div className="flex items-center justify-center gap-2 text-muted-foreground py-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">{busyLabel}</span>
          </div>
        ) : uploaded ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span className="text-sm break-all">{fileName || `${side === "front" ? "Front" : "Back"} uploaded`}</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => galleryRef.current?.click()}
            >
              Replace
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {side === "front" ? "Front of your ID" : "Back of your ID"}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button type="button" size="sm" onClick={() => cameraRef.current?.click()}>
                <Camera className="h-4 w-4" />
                Take photo
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => galleryRef.current?.click()}>
                <ImageIcon className="h-4 w-4" />
                Choose file
              </Button>
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
