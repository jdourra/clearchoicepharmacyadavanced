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
import { ArrowLeft, ArrowRight, Loader2, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CartItem } from "@/lib/cart"
import type { RxDrugClass } from "@/lib/prescription-telemedicine"
import { formatCartMedicationLine, TELEMEDICINE_VISIT_FEE } from "@/lib/prescription-telemedicine"
import { IntakeIdentityPaymentSection } from "@/components/intake-identity-payment"
import { IntakeValidationAlert } from "@/components/intake-validation-alert"
import { IntakeSuccessPanel } from "@/components/intake-success-panel"
import { emptyIntakePaymentValues, validateIntakePayment } from "@/lib/intake-payment"
import { MichiganOnlyNotice } from "@/components/michigan-only-notice"
import { MICHIGAN_STATE_NAME } from "@/lib/michigan-eligibility"
import { applyResidentialProfile, usePatientProfilePrefill } from "@/lib/patient-profile-prefill"
import { scrollToFirstField } from "@/lib/intake-field-labels"
import { authFetch } from "@/lib/session"
import { DrugClassClinicalQuestions } from "@/components/drug-class-clinical-questions"
import { ConditionClinicalQuestions } from "@/components/condition-clinical-questions"
import type { TelemedicineCheckoutContext } from "@/lib/prescription-telemedicine-checkout"
import { clearTelemedicineCheckoutContext } from "@/lib/prescription-telemedicine-checkout"
import {
  VISIT_CONDITION_OPTIONS,
  validateConditionAnswers,
  type VisitConditionId,
} from "@/lib/rx-visit-conditions"

type RxTelemedicineIntakeFormProps = {
  orderId?: string
  orderItems: CartItem[]
  drugClasses: RxDrugClass[]
  checkoutContext?: TelemedicineCheckoutContext | null
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
  selectedConditions: VisitConditionId[]
  otherConditionNotes: string
  conditionAnswers: Record<string, string>
  newOrWorseningSymptoms: string
  symptomDetails: string
  currentMedications: string
  allergies: string
  otherConditions: string
  pregnantOrBreastfeeding: boolean
  recentLabs: string
  labUploadNotes: string
  classAnswers: Record<string, string>
  agreeToTerms: boolean
  agreeToTelehealth: boolean
  agreeToPrivacy: boolean
  authorizeHold: boolean
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
  state: MICHIGAN_STATE_NAME,
  address: "",
  city: "",
  zipCode: "",
  selectedConditions: [],
  otherConditionNotes: "",
  conditionAnswers: {},
  newOrWorseningSymptoms: "",
  symptomDetails: "",
  currentMedications: "",
  allergies: "",
  otherConditions: "",
  pregnantOrBreastfeeding: false,
  recentLabs: "",
  labUploadNotes: "",
  classAnswers: {},
  agreeToTerms: false,
  agreeToTelehealth: false,
  agreeToPrivacy: false,
  authorizeHold: false,
  ...emptyIntakePaymentValues,
}

export function RxTelemedicineIntakeForm({
  orderId,
  orderItems,
  drugClasses,
  checkoutContext,
}: RxTelemedicineIntakeFormProps) {
  const clinicalIntakeMode = !orderId && !!checkoutContext
  const totalBilled =
    checkoutContext?.total ??
    orderItems.reduce((sum, item) => sum + (item.price || 0), 0) + TELEMEDICINE_VISIT_FEE
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set())
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submissionRef, setSubmissionRef] = useState("")
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

  const updateClassAnswer = useCallback((key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      classAnswers: { ...prev.classAnswers, [key]: value },
    }))
    setInvalidFields((prev) => {
      const next = new Set(prev)
      next.delete(key)
      return next
    })
  }, [])

  const updateConditionAnswer = useCallback((key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      conditionAnswers: { ...prev.conditionAnswers, [key]: value },
    }))
    setInvalidFields((prev) => {
      const next = new Set(prev)
      next.delete(key)
      return next
    })
  }, [])

  const toggleCondition = useCallback((id: VisitConditionId, checked: boolean) => {
    setFormData((prev) => {
      const next = checked
        ? prev.selectedConditions.includes(id)
          ? prev.selectedConditions
          : [...prev.selectedConditions, id]
        : prev.selectedConditions.filter((c) => c !== id)
      return { ...prev, selectedConditions: next }
    })
    setInvalidFields((prev) => {
      const next = new Set(prev)
      next.delete("selectedConditions")
      if (id === "other") next.delete("otherConditionNotes")
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
    stripePaymentIntentId: formData.stripePaymentIntentId,
    paymentAuthorized: formData.paymentAuthorized,
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
    fields.push(
      ...validateConditionAnswers(
        formData.selectedConditions,
        formData.conditionAnswers,
        formData.otherConditionNotes
      )
    )
    if (!formData.newOrWorseningSymptoms) fields.push("newOrWorseningSymptoms")
    if (!formData.currentMedications.trim()) fields.push("currentMedications")
    if (!formData.allergies.trim()) fields.push("allergies")
    if (fields.length > 0) {
      setInvalidFields(new Set(fields))
      scrollToFirstField(fields)
      return "Please complete all required fields."
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

    if (clinicalIntakeMode) {
      const paymentCheck = validateIntakePayment(identityValues)
      if (!paymentCheck.valid) {
        fields.push(...paymentCheck.fields)
      }
      if (!formData.authorizeHold) fields.push("authorizeHold")
    }

    if (fields.length > 0) {
      setInvalidFields(new Set(fields))
      scrollToFirstField(fields)
      return clinicalIntakeMode
        ? "Please upload your ID, authorize payment, and accept all required consents."
        : "Please upload your ID and accept all required consents."
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
      const payload = {
        requestedMedications: orderItems.map((item) => ({
          name: item.medication.name,
          strength: item.medication.strength,
          form: item.medication.form,
          quantity: item.quantity,
          unit_price: item.price || 0,
        })),
        patientInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          state: MICHIGAN_STATE_NAME,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
        },
        clinical: {
          selectedConditions: formData.selectedConditions,
          otherConditionNotes: formData.otherConditionNotes,
          conditionAnswers: formData.conditionAnswers,
          newOrWorseningSymptoms: formData.newOrWorseningSymptoms,
          symptomDetails: formData.symptomDetails,
          currentMedications: formData.currentMedications,
          allergies: formData.allergies,
          otherConditions: formData.otherConditions,
          pregnantOrBreastfeeding: formData.pregnantOrBreastfeeding,
          recentLabs: formData.recentLabs,
          labUploadNotes: formData.labUploadNotes,
          classAnswers: formData.classAnswers,
        },
        identity: {
          idFrontKey: formData.idFrontKey,
          idBackKey: formData.idBackKey,
          idFrontUploaded: Boolean(formData.idFrontKey),
          idBackUploaded: Boolean(formData.idBackKey),
          paymentOnFile: formData.paymentAuthorized,
          stripePaymentIntentId: formData.stripePaymentIntentId,
        },
        consents: {
          agreeToTerms: formData.agreeToTerms,
          agreeToTelehealth: formData.agreeToTelehealth,
          agreeToPrivacy: formData.agreeToPrivacy,
          authorizeHold: formData.authorizeHold,
        },
      }

      const res = await authFetch("/api/submit-prescription-telemedicine-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...(orderId ? { orderId } : {}),
          ...(clinicalIntakeMode && checkoutContext
            ? {
                checkout: checkoutContext,
                requestedMedications: payload.requestedMedications,
                identity: payload.identity,
                consents: payload.consents,
              }
            : {}),
          intakeType: "general",
          payload: {
            requestedMedications: payload.requestedMedications,
            drugClasses,
            patientInfo: payload.patientInfo,
            clinical: payload.clinical,
            identity: payload.identity,
            consents: payload.consents,
          },
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Submission failed")
      if (clinicalIntakeMode) {
        window.sessionStorage.removeItem("cart")
        clearTelemedicineCheckoutContext()
      }
      setSubmitted(true)
      setSubmissionRef(data.submissionId || data.orderId || "")
    } catch (err) {
      setInvalidFields(new Set())
      setError(err instanceof Error ? err.message : "Submission failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <IntakeSuccessPanel
        title="Telemedicine Intake Submitted"
        treatmentLabel={orderItems.map(formatCartMedicationLine).join(", ")}
        returnHref={clinicalIntakeMode ? "/prescriptions" : `/confirmation?orderId=${orderId}`}
        returnLabel={clinicalIntakeMode ? "Back to prescriptions" : "View order confirmation"}
      />
    )
  }

  const isInvalid = (field: string) => invalidFields.has(field)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prescription Telemedicine Intake</CardTitle>
        <CardDescription>
          Complete this health questionnaire so a licensed physician can review your request. Telemedicine visit
          fee: ${TELEMEDICINE_VISIT_FEE}.
        </CardDescription>
        <MichiganOnlyNotice className="mt-2" />
        <div className="rounded-lg border bg-muted/40 p-4 text-sm space-y-1">
          <p className="font-medium">Medications in your order</p>
          {orderItems.map((item) => (
            <p key={item.id} className="text-muted-foreground">
              {formatCartMedicationLine(item)}
            </p>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {error && <IntakeValidationAlert message={error} fields={Array.from(invalidFields)} />}

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Emergency symptoms</AlertTitle>
          <AlertDescription>
            If you have chest pain, trouble breathing, severe allergic reaction, or another emergency, call 911
            instead of using this form.
          </AlertDescription>
        </Alert>

        {step === 1 && (
          <div className="space-y-8">
            {!profileLoaded ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading your profile...
              </div>
            ) : null}

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

            <div
              className={cn(
                "space-y-3 rounded-md",
                isInvalid("selectedConditions") && "ring-2 ring-destructive bg-destructive/5 p-3 -m-1"
              )}
              data-field="selectedConditions"
            >
              <Label className={cn(isInvalid("selectedConditions") && "text-destructive")}>
                What condition(s) is this medication for? * (select all that apply)
              </Label>
              <div className="grid sm:grid-cols-2 gap-2">
                {VISIT_CONDITION_OPTIONS.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`condition-${item.id}`}
                      checked={formData.selectedConditions.includes(item.id)}
                      onCheckedChange={(checked) => toggleCondition(item.id, checked === true)}
                    />
                    <Label htmlFor={`condition-${item.id}`} className="font-normal cursor-pointer">
                      {item.label}
                    </Label>
                  </div>
                ))}
              </div>
              {isInvalid("selectedConditions") && (
                <p className="text-xs text-destructive">Select at least one condition.</p>
              )}
            </div>

            {formData.selectedConditions.includes("other") && (
              <div className="space-y-2" data-field="otherConditionNotes">
                <Label className={cn(isInvalid("otherConditionNotes") && "text-destructive")}>
                  Describe your other condition *
                </Label>
                <Textarea
                  value={formData.otherConditionNotes}
                  onChange={(e) => updateFormData("otherConditionNotes", e.target.value)}
                  rows={2}
                  placeholder="Briefly describe the condition you are being treated for"
                  className={cn(isInvalid("otherConditionNotes") && "border-destructive")}
                />
              </div>
            )}

            <ConditionClinicalQuestions
              selectedConditions={formData.selectedConditions}
              answers={formData.conditionAnswers}
              onChange={updateConditionAnswer}
              invalidFields={invalidFields}
            />

            <div className="space-y-2" data-field="newOrWorseningSymptoms">
              <Label className={cn(isInvalid("newOrWorseningSymptoms") && "text-destructive")}>
                Do you have new or worsening symptoms related to this condition? *
              </Label>
              <RadioGroup
                value={formData.newOrWorseningSymptoms}
                onValueChange={(v) => updateFormData("newOrWorseningSymptoms", v)}
              >
                {[
                  ["no", "No — stable / maintenance refill"],
                  ["yes-mild", "Yes — mild new symptoms"],
                  ["yes-significant", "Yes — significant or worsening symptoms"],
                ].map(([value, label]) => (
                  <div key={value} className="flex items-center gap-2">
                    <RadioGroupItem value={value} id={`sym-${value}`} />
                    <Label htmlFor={`sym-${value}`} className="font-normal cursor-pointer">
                      {label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {formData.newOrWorseningSymptoms.startsWith("yes") && (
              <div className="space-y-2">
                <Label>Describe your symptoms</Label>
                <Textarea value={formData.symptomDetails} onChange={(e) => updateFormData("symptomDetails", e.target.value)} rows={3} />
              </div>
            )}

            <div className="space-y-2" data-field="currentMedications">
              <Label className={cn(isInvalid("currentMedications") && "text-destructive")}>Current medications *</Label>
              <Textarea value={formData.currentMedications} onChange={(e) => updateFormData("currentMedications", e.target.value)} rows={3} placeholder="Prescriptions, OTC, supplements" />
            </div>
            <div className="space-y-2" data-field="allergies">
              <Label className={cn(isInvalid("allergies") && "text-destructive")}>Allergies *</Label>
              <Input value={formData.allergies} onChange={(e) => updateFormData("allergies", e.target.value)} placeholder="None or list allergies" />
            </div>
            <div className="space-y-2">
              <Label>Other medical conditions</Label>
              <Textarea value={formData.otherConditions} onChange={(e) => updateFormData("otherConditions", e.target.value)} rows={2} />
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="pregnant"
                checked={formData.pregnantOrBreastfeeding}
                onCheckedChange={(checked) => updateFormData("pregnantOrBreastfeeding", checked as boolean)}
              />
              <Label htmlFor="pregnant" className="font-normal cursor-pointer">
                I am pregnant, trying to become pregnant, or breastfeeding
              </Label>
            </div>

            <DrugClassClinicalQuestions
              drugClasses={drugClasses}
              answers={formData.classAnswers}
              onChange={updateClassAnswer}
            />

            <div className="space-y-2">
              <Label>Recent labs (optional)</Label>
              <Input value={formData.recentLabs} onChange={(e) => updateFormData("recentLabs", e.target.value)} placeholder="e.g. TSH checked last month — normal" />
            </div>
            <div className="space-y-2">
              <Label>Lab notes for your physician (optional)</Label>
              <Textarea value={formData.labUploadNotes} onChange={(e) => updateFormData("labUploadNotes", e.target.value)} rows={2} placeholder="Summarize any recent lab results relevant to this medication" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <IntakeIdentityPaymentSection
              values={identityValues}
              onChange={onIdentityChange}
              totalBilled={totalBilled}
              patientEmail={formData.email}
              serviceType="prescription_telemedicine"
              intakePrefix={`rx-tm-${orderId || "checkout"}`}
              invalidFields={invalidFields}
              idPrefix="rx-tm"
              showPayment={clinicalIntakeMode}
            />
            <div className="space-y-3">
              {clinicalIntakeMode ? (
                <div
                  className={cn(
                    "flex items-start gap-2 rounded-lg border p-3",
                    invalidFields.has("authorizeHold") && "border-destructive"
                  )}
                  data-field="authorizeHold"
                >
                  <Checkbox
                    id="authorizeHold"
                    checked={formData.authorizeHold}
                    onCheckedChange={(checked) => updateFormData("authorizeHold", checked === true)}
                  />
                  <Label htmlFor="authorizeHold" className="font-normal cursor-pointer leading-snug">
                    I authorize Clear Choice Pharmacy to place a hold on my card for ${totalBilled.toFixed(2)}.
                    If approved, payment will be captured; if denied, the hold will be released.
                  </Label>
                </div>
              ) : null}
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
