"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, ArrowRight, Loader2, AlertTriangle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CartItem } from "@/lib/cart"
import { checkBloodPressureHardStop, checkEdContraindicationHardStop } from "@/lib/ed-clinical-intake"
import { formatCartMedicationLine, TELEMEDICINE_VISIT_FEE } from "@/lib/prescription-telemedicine"
import { IntakeIdentityPaymentSection } from "@/components/intake-identity-payment"
import { IntakeValidationAlert } from "@/components/intake-validation-alert"
import { IntakeSuccessPanel } from "@/components/intake-success-panel"
import { emptyIntakePaymentValues } from "@/lib/intake-payment"
import { applyResidentialProfile, usePatientProfilePrefill } from "@/lib/patient-profile-prefill"
import { scrollToFirstField } from "@/lib/intake-field-labels"

type EdTabletTelemedicineIntakeFormProps = {
  orderId: string
  orderItems: CartItem[]
}

type FormData = {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  state: string
  address: string
  city: string
  zipCode: string
  systolicBP: string
  diastolicBP: string
  heartRate: string
  lastBPCheck: string
  takesNitrates: boolean
  takesRiociguat: boolean
  recentHeartAttack: boolean
  recentStroke: boolean
  severeHeartFailure: boolean
  unstableAngina: boolean
  confirmedNoContraindications: boolean
  diabetes: string
  hypertension: string
  heartCondition: string
  currentMedications: string
  allergies: string
  edDuration: string
  edSeverity: string
  previousOralEdUse: string
  preferredFrequency: string
  additionalConcerns: string
  agreeToTerms: boolean
  agreeToTelehealth: boolean
  agreeToPrivacy: boolean
  idFrontFile: File | null
  idBackFile: File | null
  idFrontKey: string | null
  idBackKey: string | null
  idFrontUploading: boolean
  idBackUploading: boolean
}

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  state: "Michigan",
  address: "",
  city: "",
  zipCode: "",
  systolicBP: "",
  diastolicBP: "",
  heartRate: "",
  lastBPCheck: "",
  takesNitrates: false,
  takesRiociguat: false,
  recentHeartAttack: false,
  recentStroke: false,
  severeHeartFailure: false,
  unstableAngina: false,
  confirmedNoContraindications: false,
  diabetes: "",
  hypertension: "",
  heartCondition: "",
  currentMedications: "",
  allergies: "",
  edDuration: "",
  edSeverity: "",
  previousOralEdUse: "",
  preferredFrequency: "",
  additionalConcerns: "",
  agreeToTerms: false,
  agreeToTelehealth: false,
  agreeToPrivacy: false,
  ...emptyIntakePaymentValues,
}

const ED_CONTRAINDICATION_FIELDS = [
  "takesNitrates",
  "takesRiociguat",
  "recentHeartAttack",
  "recentStroke",
  "severeHeartFailure",
  "unstableAngina",
] as const

function hasAnyEdContraindication(formData: FormData): boolean {
  return ED_CONTRAINDICATION_FIELDS.some((field) => formData[field])
}

function getEdContraindicationFlags(formData: FormData) {
  return {
    takesNitrates: formData.takesNitrates,
    takesRiociguat: formData.takesRiociguat,
    recentHeartAttack: formData.recentHeartAttack,
    recentStroke: formData.recentStroke,
    severeHeartFailure: formData.severeHeartFailure,
    unstableAngina: formData.unstableAngina,
  }
}

export function EdTabletTelemedicineIntakeForm({ orderId, orderItems }: EdTabletTelemedicineIntakeFormProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set())
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [hardStop, setHardStop] = useState({ active: false, reason: "" })
  const { profile, loaded: profileLoaded } = usePatientProfilePrefill()

  useEffect(() => {
    if (profile) {
      setFormData((prev) => applyResidentialProfile(prev, profile))
    }
  }, [profile])

  const updateFormData = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    setInvalidFields((prev) => {
      const next = new Set(prev)
      next.delete(String(key))
      return next
    })
  }, [])

  const identityValues = {
    idFrontFile: formData.idFrontFile,
    idBackFile: formData.idBackFile,
    idFrontKey: formData.idFrontKey,
    idBackKey: formData.idBackKey,
    idFrontUploading: formData.idFrontUploading,
    idBackUploading: formData.idBackUploading,
    stripePaymentIntentId: null,
    paymentAuthorized: false,
  }

  const onIdentityChange = useCallback(
    (key: keyof typeof identityValues, value: (typeof identityValues)[keyof typeof identityValues]) => {
      updateFormData(key as keyof FormData, value as FormData[keyof FormData])
    },
    [updateFormData]
  )

  const validateStep1 = () => {
    const fields: string[] = []
    if (!formData.firstName) fields.push("firstName")
    if (!formData.lastName) fields.push("lastName")
    if (!formData.email) fields.push("email")
    if (!formData.phone) fields.push("phone")
    if (!formData.dateOfBirth) fields.push("dateOfBirth")
    if (!formData.systolicBP) fields.push("systolicBP")
    if (!formData.diastolicBP) fields.push("diastolicBP")
    if (!formData.edDuration) fields.push("edDuration")
    if (!formData.edSeverity) fields.push("edSeverity")
    if (!formData.currentMedications.trim()) fields.push("currentMedications")
    if (!formData.allergies.trim()) fields.push("allergies")
    if (!hasAnyEdContraindication(formData) && !formData.confirmedNoContraindications) {
      fields.push("confirmedNoContraindications")
      setInvalidFields(new Set(fields))
      scrollToFirstField(fields)
      return 'Please check any condition that applies, or confirm "None of the above apply to me".'
    }
    if (hasAnyEdContraindication(formData) && formData.confirmedNoContraindications) {
      fields.push("confirmedNoContraindications")
      setInvalidFields(new Set(fields))
      scrollToFirstField(fields)
      return 'Please uncheck "None of the above apply to me" if any condition applies to you.'
    }
    if (fields.length > 0) {
      setInvalidFields(new Set(fields))
      scrollToFirstField(fields)
      return "Please complete all required fields."
    }

    const bpStop = checkBloodPressureHardStop(Number(formData.systolicBP), Number(formData.diastolicBP))
    if (bpStop.isHardStop) {
      setHardStop({ active: true, reason: bpStop.reason })
      return bpStop.reason
    }

    const contraStop = checkEdContraindicationHardStop({
      takesNitrates: formData.takesNitrates,
      takesRiociguat: formData.takesRiociguat,
      recentHeartAttack: formData.recentHeartAttack,
      recentStroke: formData.recentStroke,
      severeHeartFailure: formData.severeHeartFailure,
      unstableAngina: formData.unstableAngina,
    })
    if (contraStop.isHardStop) {
      setHardStop({ active: true, reason: contraStop.reason })
      return contraStop.reason
    }

    return ""
  }

  const validateStep2 = () => {
    const fields: string[] = []
    if (!formData.idFrontKey) fields.push("idFrontFile")
    if (!formData.idBackKey) fields.push("idBackFile")
    if (!formData.agreeToTerms) fields.push("agreeToTerms")
    if (!formData.agreeToTelehealth) fields.push("agreeToTelehealth")
    if (!formData.agreeToPrivacy) fields.push("agreeToPrivacy")
    if (fields.length > 0) {
      setInvalidFields(new Set(fields))
      scrollToFirstField(fields)
      return "Please upload your ID and accept all required consents."
    }
    return ""
  }

  const handleSubmit = async () => {
    const message = validateStep2()
    if (message) {
      setError(message)
      return
    }

    setIsSubmitting(true)
    setError("")
    try {
      const res = await fetch("/api/submit-prescription-telemedicine-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          intakeType: "ed_tablet",
          payload: {
            requestedMedications: orderItems.map((item) => ({
              name: item.medication.name,
              strength: item.medication.strength,
              form: item.medication.form,
              quantity: item.quantity,
            })),
            patientInfo: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phone: formData.phone,
              dateOfBirth: formData.dateOfBirth,
              state: formData.state,
              address: formData.address,
              city: formData.city,
              zipCode: formData.zipCode,
            },
            vitals: {
              systolicBP: formData.systolicBP,
              diastolicBP: formData.diastolicBP,
              heartRate: formData.heartRate,
              lastBPCheck: formData.lastBPCheck,
            },
            contraindications: {
              takesNitrates: formData.takesNitrates,
              takesRiociguat: formData.takesRiociguat,
              recentHeartAttack: formData.recentHeartAttack,
              recentStroke: formData.recentStroke,
              severeHeartFailure: formData.severeHeartFailure,
              unstableAngina: formData.unstableAngina,
            },
            medicalHistory: {
              diabetes: formData.diabetes,
              hypertension: formData.hypertension,
              heartCondition: formData.heartCondition,
              currentMedications: formData.currentMedications,
              allergies: formData.allergies,
            },
            treatmentInfo: {
              edDuration: formData.edDuration,
              edSeverity: formData.edSeverity,
              previousOralEdUse: formData.previousOralEdUse,
              preferredFrequency: formData.preferredFrequency,
              additionalConcerns: formData.additionalConcerns,
            },
            identity: {
              idFrontKey: formData.idFrontKey,
              idBackKey: formData.idBackKey,
            },
            consents: {
              agreeToTerms: formData.agreeToTerms,
              agreeToTelehealth: formData.agreeToTelehealth,
              agreeToPrivacy: formData.agreeToPrivacy,
            },
          },
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Submission failed")
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (hardStop.active) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            Medical Safety Alert
          </CardTitle>
          <CardDescription>We cannot proceed with your request online</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>{hardStop.reason}</AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => setHardStop({ active: false, reason: "" })}>
            Go Back
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (submitted) {
    return (
      <IntakeSuccessPanel
        title="Telemedicine Intake Submitted"
        treatmentLabel={orderItems.map(formatCartMedicationLine).join(", ")}
        returnHref={`/confirmation?orderId=${orderId}`}
        returnLabel="View order confirmation"
      />
    )
  }

  const isInvalid = (field: string) => invalidFields.has(field)

  return (
    <Card>
      <CardHeader>
        <CardTitle>ED Tablet Telemedicine Intake</CardTitle>
        <CardDescription>
          A licensed physician will review your information before prescribing the oral ED medication in your order.
          Telemedicine visit fee: ${TELEMEDICINE_VISIT_FEE}.
        </CardDescription>
        <div className="rounded-lg border bg-muted/40 p-4 text-sm space-y-1">
          <p className="font-medium">Requested from your order</p>
          {orderItems.map((item) => (
            <p key={item.id} className="text-muted-foreground">
              {formatCartMedicationLine(item)}
            </p>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {error && <IntakeValidationAlert message={error} />}
        {!profileLoaded && step === 1 ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading your profile...
          </div>
        ) : null}

        {step === 1 && (
          <div className="space-y-8">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2" data-field="firstName">
                <Label className={cn(isInvalid("firstName") && "text-destructive")}>First name *</Label>
                <Input value={formData.firstName} onChange={(e) => updateFormData("firstName", e.target.value)} />
              </div>
              <div className="space-y-2" data-field="lastName">
                <Label className={cn(isInvalid("lastName") && "text-destructive")}>Last name *</Label>
                <Input value={formData.lastName} onChange={(e) => updateFormData("lastName", e.target.value)} />
              </div>
              <div className="space-y-2" data-field="email">
                <Label className={cn(isInvalid("email") && "text-destructive")}>Email *</Label>
                <Input type="email" value={formData.email} onChange={(e) => updateFormData("email", e.target.value)} />
              </div>
              <div className="space-y-2" data-field="phone">
                <Label className={cn(isInvalid("phone") && "text-destructive")}>Phone *</Label>
                <Input type="tel" value={formData.phone} onChange={(e) => updateFormData("phone", e.target.value)} />
              </div>
              <div className="space-y-2" data-field="dateOfBirth">
                <Label className={cn(isInvalid("dateOfBirth") && "text-destructive")}>Date of birth *</Label>
                <Input type="date" value={formData.dateOfBirth} onChange={(e) => updateFormData("dateOfBirth", e.target.value)} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2" data-field="systolicBP">
                <Label className={cn(isInvalid("systolicBP") && "text-destructive")}>Systolic BP *</Label>
                <Input type="number" value={formData.systolicBP} onChange={(e) => updateFormData("systolicBP", e.target.value)} />
              </div>
              <div className="space-y-2" data-field="diastolicBP">
                <Label className={cn(isInvalid("diastolicBP") && "text-destructive")}>Diastolic BP *</Label>
                <Input type="number" value={formData.diastolicBP} onChange={(e) => updateFormData("diastolicBP", e.target.value)} />
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <p className="font-medium text-destructive">Critical safety questions</p>
              <p className="text-sm text-muted-foreground">
                These conditions are absolute contraindications for ED medications. Check any that apply. If none
                apply, check the confirmation below.
              </p>
              {[
                ["takesNitrates", "I take nitrates for chest pain"],
                ["takesRiociguat", "I take Riociguat (Adempas)"],
                ["recentHeartAttack", "Heart attack in the past 90 days"],
                ["recentStroke", "Stroke in the past 6 months"],
                ["severeHeartFailure", "Severe heart failure"],
                ["unstableAngina", "Unstable angina or chest pain at rest"],
              ].map(([key, label]) => (
                <div key={key} className="flex items-start gap-2">
                  <Checkbox
                    id={key}
                    checked={formData[key as keyof FormData] as boolean}
                    onCheckedChange={(checked) => {
                      const isChecked = checked === true
                      setFormData((prev) => {
                        const updated = {
                          ...prev,
                          [key]: isChecked,
                          confirmedNoContraindications: isChecked ? false : prev.confirmedNoContraindications,
                        } as FormData
                        const contraStop = checkEdContraindicationHardStop(getEdContraindicationFlags(updated))
                        if (contraStop.isHardStop) setHardStop({ active: true, reason: contraStop.reason })
                        return updated
                      })
                    }}
                  />
                  <Label htmlFor={key} className="font-normal cursor-pointer leading-snug">
                    {label}
                  </Label>
                </div>
              ))}
              <div
                data-field="confirmedNoContraindications"
                className={cn(
                  "flex items-start gap-2 border-t border-destructive/20 pt-4",
                  isInvalid("confirmedNoContraindications") && "ring-2 ring-destructive bg-destructive/10 p-3 -mx-1 rounded-md"
                )}
              >
                <Checkbox
                  id="confirmedNoContraindications"
                  checked={formData.confirmedNoContraindications}
                  onCheckedChange={(checked) => {
                    const isChecked = checked === true
                    setFormData((prev) => ({
                      ...prev,
                      confirmedNoContraindications: isChecked,
                      takesNitrates: isChecked ? false : prev.takesNitrates,
                      takesRiociguat: isChecked ? false : prev.takesRiociguat,
                      recentHeartAttack: isChecked ? false : prev.recentHeartAttack,
                      recentStroke: isChecked ? false : prev.recentStroke,
                      severeHeartFailure: isChecked ? false : prev.severeHeartFailure,
                      unstableAngina: isChecked ? false : prev.unstableAngina,
                    }))
                    if (isChecked) {
                      const bpStop = checkBloodPressureHardStop(
                        Number(formData.systolicBP),
                        Number(formData.diastolicBP)
                      )
                      setHardStop(bpStop.isHardStop ? { active: true, reason: bpStop.reason } : { active: false, reason: "" })
                      setInvalidFields((prev) => {
                        const next = new Set(prev)
                        next.delete("confirmedNoContraindications")
                        return next
                      })
                    }
                  }}
                />
                <div>
                  <Label
                    htmlFor="confirmedNoContraindications"
                    className={cn("font-medium cursor-pointer leading-snug", isInvalid("confirmedNoContraindications") && "text-destructive")}
                  >
                    None of the above apply to me *
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2" data-field="currentMedications">
              <Label className={cn(isInvalid("currentMedications") && "text-destructive")}>Current medications *</Label>
              <Textarea value={formData.currentMedications} onChange={(e) => updateFormData("currentMedications", e.target.value)} rows={3} />
            </div>
            <div className="space-y-2" data-field="allergies">
              <Label className={cn(isInvalid("allergies") && "text-destructive")}>Allergies *</Label>
              <Input value={formData.allergies} onChange={(e) => updateFormData("allergies", e.target.value)} placeholder="None or list allergies" />
            </div>

            <div className="space-y-2" data-field="edDuration">
              <Label className={cn(isInvalid("edDuration") && "text-destructive")}>How long have you had ED symptoms? *</Label>
              <RadioGroup value={formData.edDuration} onValueChange={(v) => updateFormData("edDuration", v)}>
                {[
                  ["less-6-months", "Less than 6 months"],
                  ["6-12-months", "6-12 months"],
                  ["1-3-years", "1-3 years"],
                  ["over-3-years", "More than 3 years"],
                ].map(([value, label]) => (
                  <div key={value} className="flex items-center gap-2">
                    <RadioGroupItem value={value} id={`dur-${value}`} />
                    <Label htmlFor={`dur-${value}`} className="font-normal cursor-pointer">
                      {label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2" data-field="edSeverity">
              <Label className={cn(isInvalid("edSeverity") && "text-destructive")}>Symptom severity *</Label>
              <RadioGroup value={formData.edSeverity} onValueChange={(v) => updateFormData("edSeverity", v)}>
                {[
                  ["mild", "Mild"],
                  ["moderate", "Moderate"],
                  ["severe", "Severe"],
                ].map(([value, label]) => (
                  <div key={value} className="flex items-center gap-2">
                    <RadioGroupItem value={value} id={`sev-${value}`} />
                    <Label htmlFor={`sev-${value}`} className="font-normal cursor-pointer">
                      {label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Have you used oral ED tablets before?</Label>
              <Input value={formData.previousOralEdUse} onChange={(e) => updateFormData("previousOralEdUse", e.target.value)} placeholder="e.g. Viagra, Cialis, or none" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="additionalConcerns">Anything else for the physician?</Label>
              <Textarea id="additionalConcerns" value={formData.additionalConcerns} onChange={(e) => updateFormData("additionalConcerns", e.target.value)} rows={3} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <IntakeIdentityPaymentSection
              values={identityValues}
              onChange={onIdentityChange}
              totalBilled={0}
              patientEmail={formData.email}
              serviceType="prescription_telemedicine_ed"
              intakePrefix={`rx-ed-${orderId}`}
              invalidFields={invalidFields}
              idPrefix="rx-ed"
              showPayment={false}
            />
            <div className="space-y-3">
              {[
                ["agreeToTerms", "I agree to the Terms of Service"],
                ["agreeToTelehealth", "I consent to asynchronous telehealth"],
                ["agreeToPrivacy", "I agree to the Privacy Policy"],
              ].map(([key, label]) => (
                <div key={key} className="flex items-start gap-2" data-field={key}>
                  <Checkbox
                    id={key}
                    checked={formData[key as keyof FormData] as boolean}
                    onCheckedChange={(checked) => updateFormData(key as keyof FormData, checked as boolean)}
                  />
                  <Label htmlFor={key} className="font-normal cursor-pointer">
                    {label} *
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6">
        {step > 1 ? (
          <Button variant="outline" onClick={() => setStep(step - 1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        ) : (
          <div />
        )}
        {step < 2 ? (
          <Button
            onClick={() => {
              const message = validateStep1()
              if (message) {
                setError(message)
                return
              }
              setError("")
              setStep(2)
            }}
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit for physician review"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
