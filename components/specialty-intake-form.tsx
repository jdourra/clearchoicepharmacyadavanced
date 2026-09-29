"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  ArrowRightLeft,
  Check,
  CheckCircle2,
  Loader2,
  Phone,
  Stethoscope,
  Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { formatPhoneInput } from "@/lib/phone"
import { isAllowedUploadFile } from "@/lib/upload-mime"
import { MichiganOnlyNotice } from "@/components/michigan-only-notice"
import { MichiganStateField } from "@/components/michigan-state-field"
import { MICHIGAN_STATE_CODE } from "@/lib/michigan-eligibility"
import { InjectionTelehealthConsents } from "@/components/injection-telehealth-consents"
import {
  emptyInjectionTelehealthConsents,
  getInjectionConsentInvalidFields,
  validateInjectionTelehealthConsents,
  type InjectionTelehealthConsentValues,
} from "@/lib/injection-telehealth-consents"
import {
  formatDobForInput,
  pickProfile,
  stateToCode,
  usePatientProfilePrefill,
} from "@/lib/patient-profile-prefill"

const PRESCRIPTION_UPLOAD_TYPES = new Set(["image/jpeg", "image/png", "application/pdf"])
import {
  COMMON_SPECIALTY_MEDICATIONS,
  SPECIALTY_FULFILLMENT_OPTIONS,
  SPECIALTY_PRIOR_AUTH_STATUSES,
  SPECIALTY_REQUEST_TYPES,
} from "@/lib/specialty-pharmacy-catalog"

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA",
  "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT",
  "VA", "WA", "WV", "WI", "WY",
]

const STEP_LABELS = ["Profile", "Medication", "Insurance", "Prescription", "Details"]

type SpecialtyIntakeFormProps = {
  initialMedication?: string
}

export function SpecialtyIntakeForm({ initialMedication }: SpecialtyIntakeFormProps) {
  const intakePrefix = useMemo(() => `sp-${Date.now().toString(36)}`, [])

  const [step, setStep] = useState(1)
  const { profile, isLoggedIn } = usePatientProfilePrefill()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [submissionId, setSubmissionId] = useState("")

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState(MICHIGAN_STATE_CODE)
  const [zipCode, setZipCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [selectedMedication, setSelectedMedication] = useState(initialMedication || "")
  const [medicationOther, setMedicationOther] = useState("")
  const [requestType, setRequestType] = useState("")

  const [insurancePlanName, setInsurancePlanName] = useState("")
  const [insuranceMemberId, setInsuranceMemberId] = useState("")
  const [insuranceGroupNumber, setInsuranceGroupNumber] = useState("")
  const [insuranceBin, setInsuranceBin] = useState("")
  const [insurancePcn, setInsurancePcn] = useState("")
  const [insuranceCardholderName, setInsuranceCardholderName] = useState("")

  const [prescriptionMethod, setPrescriptionMethod] = useState("")
  const [transferRxNumbers, setTransferRxNumbers] = useState("")
  const [transferPharmacyName, setTransferPharmacyName] = useState("")
  const [transferPharmacyPhone, setTransferPharmacyPhone] = useState("")
  const [doctorName, setDoctorName] = useState("")
  const [doctorPhone, setDoctorPhone] = useState("")
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null)
  const [prescriptionFileKey, setPrescriptionFileKey] = useState("")
  const [uploadingPrescription, setUploadingPrescription] = useState(false)

  const [diagnosis, setDiagnosis] = useState("")
  const [currentlyOnMedication, setCurrentlyOnMedication] = useState("")
  const [priorAuthStatus, setPriorAuthStatus] = useState("")
  const [prescriberName, setPrescriberName] = useState("")
  const [prescriberPhone, setPrescriberPhone] = useState("")
  const [allergies, setAllergies] = useState("")
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [fulfillmentPreference, setFulfillmentPreference] = useState("")
  const [injectionConsents, setInjectionConsents] = useState<InjectionTelehealthConsentValues>({
    ...emptyInjectionTelehealthConsents,
  })
  const [fieldErrors, setFieldErrors] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!profile) return
    setFirstName((v) => pickProfile(v, profile.firstName))
    setLastName((v) => pickProfile(v, profile.lastName))
    setEmail((v) => pickProfile(v, profile.email))
    setPhone((v) => pickProfile(v, profile.phone))
    setDateOfBirth((v) => pickProfile(v, formatDobForInput(profile.dob)))
    setAddress((v) => pickProfile(v, profile.address))
    setCity((v) => pickProfile(v, profile.city))
    setState(MICHIGAN_STATE_CODE)
    setZipCode((v) => pickProfile(v, profile.zip))
    setInjectionConsents((prev) => ({
      ...prev,
      eSignName:
        prev.eSignName.trim() ||
        `${profile.firstName} ${profile.lastName}`.trim(),
    }))
  }, [profile])

  const medicationLabel = useMemo(() => {
    if (selectedMedication === "other") return medicationOther
    const found = COMMON_SPECIALTY_MEDICATIONS.find((m) => m.id === selectedMedication)
    return found?.name || selectedMedication
  }, [selectedMedication, medicationOther])

  const handlePrescriptionUpload = async (file: File) => {
    setUploadingPrescription(true)
    setError("")
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("intakePrefix", intakePrefix)
      const res = await fetch("/api/specialty-intake/upload-prescription", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed")
      setPrescriptionFileKey(data.storageKey)
      setPrescriptionFile(file)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload prescription")
      setPrescriptionFile(null)
      setPrescriptionFileKey("")
    } finally {
      setUploadingPrescription(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB")
      return
    }
    if (!isAllowedUploadFile(file, PRESCRIPTION_UPLOAD_TYPES)) {
      setError("Please upload a JPG, PNG, or PDF file")
      return
    }
    void handlePrescriptionUpload(file)
  }

  const validateStep = useCallback(
    (currentStep: number): string | null => {
      switch (currentStep) {
        case 1:
          if (!firstName || !lastName || !email || !phone || !dateOfBirth) {
            return "Please complete all required profile fields"
          }
          if (!/^\S+@\S+\.\S+$/.test(email)) return "Please enter a valid email"
          if (!address || !city || !state || !zipCode) return "Please complete your address"
          if (!isLoggedIn) {
            if (!password || password.length < 8) return "Password must be at least 8 characters"
            if (password !== confirmPassword) return "Passwords do not match"
          }
          return null
        case 2:
          if (!selectedMedication) return "Please select a medication"
          if (selectedMedication === "other" && !medicationOther.trim()) {
            return "Please enter your medication name"
          }
          if (!requestType) return "Please select a request type"
          return null
        case 3:
          if (!insurancePlanName || !insuranceMemberId) {
            return "Insurance plan name and member ID are required"
          }
          return null
        case 4:
          if (!prescriptionMethod) return "Please select how we will receive your prescription"
          if (prescriptionMethod === "transfer") {
            if (!transferRxNumbers.trim()) return "Enter prescription numbers to transfer"
            if (!transferPharmacyName.trim() || !transferPharmacyPhone.trim()) {
              return "Enter your current pharmacy name and phone"
            }
          }
          if (prescriptionMethod === "eprescribe" && (!doctorName.trim() || !doctorPhone.trim())) {
            return "Enter your doctor's name and phone"
          }
          if (prescriptionMethod === "upload" && !prescriptionFileKey) {
            return "Please upload your prescription"
          }
          return null
        case 5:
          if (!fulfillmentPreference) return "Please select pickup or delivery"
          return null
        default:
          return null
      }
    },
    [
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      address,
      city,
      state,
      zipCode,
      isLoggedIn,
      password,
      confirmPassword,
      selectedMedication,
      medicationOther,
      requestType,
      insurancePlanName,
      insuranceMemberId,
      prescriptionMethod,
      transferRxNumbers,
      transferPharmacyName,
      transferPharmacyPhone,
      doctorName,
      doctorPhone,
      prescriptionFileKey,
      fulfillmentPreference,
    ]
  )

  const goNext = () => {
    const err = validateStep(step)
    if (err) {
      setError(err)
      return
    }
    setError("")
    setStep((s) => Math.min(s + 1, 5))
  }

  const goBack = () => {
    setError("")
    setStep((s) => Math.max(s - 1, 1))
  }

  const handleSubmit = async () => {
    const err = validateStep(5)
    if (err) {
      setError(err)
      return
    }

    const consentInvalid = new Set(
      getInjectionConsentInvalidFields(injectionConsents, { variant: "specialty-pharmacy" })
    )
    if (consentInvalid.size > 0) {
      setFieldErrors(consentInvalid)
      setError("Please complete all required telemedicine consents and acknowledgments.")
      const first = [...consentInvalid][0]
      document.querySelector(`[data-field="${first}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    setFieldErrors(new Set())

    const consentCheck = validateInjectionTelehealthConsents(injectionConsents, {
      variant: "specialty-pharmacy",
    })
    if (!consentCheck.valid) {
      setError(consentCheck.message)
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const res = await fetch("/api/submit-specialty-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          patient: {
            firstName,
            lastName,
            email,
            phone,
            dateOfBirth,
            state: MICHIGAN_STATE_CODE,
            address,
            city,
            zipCode,
            password: isLoggedIn ? undefined : password,
          },
          medication: {
            selectedMedication,
            medicationOther,
            requestType,
          },
          insurance: {
            planName: insurancePlanName,
            memberId: insuranceMemberId,
            groupNumber: insuranceGroupNumber,
            bin: insuranceBin,
            pcn: insurancePcn,
            cardholderName: insuranceCardholderName,
          },
          prescription: {
            method: prescriptionMethod,
            transferRxNumbers,
            transferPharmacyName,
            transferPharmacyPhone,
            doctorName,
            doctorPhone,
            prescriptionFileKey,
          },
          clinical: {
            diagnosis,
            currentlyOnMedication,
            priorAuthStatus,
            prescriberName,
            prescriberPhone,
            allergies,
            additionalNotes,
            fulfillmentPreference,
          },
          injectionConsents,
        }),
      })

      const result = await res.json()
      if (!res.ok) {
        throw new Error(result.error || "Submission failed")
      }

      setSubmissionId(result.submissionId || "")
      setSuccess(true)
    } catch (submitErr) {
      setError(submitErr instanceof Error ? submitErr.message : "Failed to submit. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <Card>
        <CardContent className="pt-8 pb-8 text-center">
          <CheckCircle2 className="h-14 w-14 text-emerald-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Transfer request submitted</h2>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            Our specialty pharmacy team will review your information and contact you within 1 business day to
            coordinate your transfer, prior authorization, and copay assistance.
          </p>
          {submissionId && (
            <p className="text-sm font-mono text-muted-foreground mb-6">Reference: {submissionId}</p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/account?tab=programs">View in your account</Link>
            </Button>
            <Button asChild variant="outline" className="bg-transparent">
              <Link href="/specialty-pharmacy">Back to specialty program</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
        {STEP_LABELS.map((label, index) => {
          const num = index + 1
          return (
            <div key={label} className="flex items-center shrink-0">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold",
                  step >= num ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}
              >
                {step > num ? <Check className="h-4 w-4" /> : num}
              </div>
              <span className="ml-2 text-xs sm:text-sm font-medium hidden sm:inline">{label}</span>
              {num < STEP_LABELS.length && (
                <div className={cn("w-6 sm:w-10 h-0.5 mx-2", step > num ? "bg-primary" : "bg-muted")} />
              )}
            </div>
          )
        })}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle>Your profile</CardTitle>
              <CardDescription>
                {isLoggedIn
                  ? "We pre-filled your account details. Update anything that has changed."
                  : "Create your patient profile so we can track your specialty transfer and contact you."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First name *</Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="lastName">Last name *</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoggedIn}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(formatPhoneInput(e.target.value))} required />
                </div>
              </div>
              <div>
                <Label htmlFor="dob">Date of birth *</Label>
                <Input
                  id="dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="address">Street address *</Label>
                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} required />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} required />
                </div>
                <div data-field="state">
                  <MichiganStateField id="specialty-state" format="code" />
                </div>
                <div>
                  <Label htmlFor="zip">ZIP *</Label>
                  <Input id="zip" value={zipCode} onChange={(e) => setZipCode(e.target.value)} required />
                </div>
              </div>
              {!isLoggedIn && (
                <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                  <p className="text-sm text-muted-foreground">
                    Create a password to track your transfer in your patient portal.{" "}
                    <Link href="/auth/login?redirect=/specialty-pharmacy/start" className="text-primary hover:underline">
                      Already have an account? Sign in
                    </Link>
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={8}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm password *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </>
        )}

        {step === 2 && (
          <>
            <CardHeader>
              <CardTitle>Medication of interest</CardTitle>
              <CardDescription>Tell us which specialty medication you need help with.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Medication *</Label>
                <Select value={selectedMedication} onValueChange={setSelectedMedication}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select a medication" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_SPECIALTY_MEDICATIONS.map((med) => (
                      <SelectItem key={med.id} value={med.id}>
                        {med.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="other">Other (not listed)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedMedication === "other" && (
                <div>
                  <Label htmlFor="medicationOther">Medication name *</Label>
                  <Input
                    id="medicationOther"
                    placeholder="Enter your specialty medication"
                    value={medicationOther}
                    onChange={(e) => setMedicationOther(e.target.value)}
                  />
                </div>
              )}
              {selectedMedication && selectedMedication !== "other" && (
                <p className="text-sm text-muted-foreground">
                  {COMMON_SPECIALTY_MEDICATIONS.find((m) => m.id === selectedMedication)?.indication}
                </p>
              )}
              <div>
                <Label>What do you need? *</Label>
                <RadioGroup value={requestType} onValueChange={setRequestType} className="mt-2 space-y-2">
                  {SPECIALTY_REQUEST_TYPES.map((opt) => (
                    <div key={opt.value} className="flex items-center space-x-3 border rounded-lg p-3">
                      <RadioGroupItem value={opt.value} id={`req-${opt.value}`} />
                      <Label htmlFor={`req-${opt.value}`} className="cursor-pointer font-normal">
                        {opt.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </>
        )}

        {step === 3 && (
          <>
            <CardHeader>
              <CardTitle>Insurance information</CardTitle>
              <CardDescription>We bill all major insurance plans for specialty therapies.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="planName">Insurance plan name *</Label>
                <Input
                  id="planName"
                  placeholder="e.g. Blue Cross Blue Shield PPO"
                  value={insurancePlanName}
                  onChange={(e) => setInsurancePlanName(e.target.value)}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="memberId">Member ID *</Label>
                  <Input
                    id="memberId"
                    value={insuranceMemberId}
                    onChange={(e) => setInsuranceMemberId(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="groupNumber">Group number</Label>
                  <Input
                    id="groupNumber"
                    value={insuranceGroupNumber}
                    onChange={(e) => setInsuranceGroupNumber(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bin">BIN (if known)</Label>
                  <Input id="bin" value={insuranceBin} onChange={(e) => setInsuranceBin(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="pcn">PCN (if known)</Label>
                  <Input id="pcn" value={insurancePcn} onChange={(e) => setInsurancePcn(e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="cardholder">Name on insurance card</Label>
                <Input
                  id="cardholder"
                  value={insuranceCardholderName}
                  onChange={(e) => setInsuranceCardholderName(e.target.value)}
                />
              </div>
            </CardContent>
          </>
        )}

        {step === 4 && (
          <>
            <CardHeader>
              <CardTitle>How will we get your prescription?</CardTitle>
              <CardDescription>Choose one option below.</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={prescriptionMethod} onValueChange={setPrescriptionMethod} className="space-y-3">
                <div className="flex items-start space-x-3 border rounded-lg p-4">
                  <RadioGroupItem value="transfer" id="rx-transfer" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="rx-transfer" className="font-semibold cursor-pointer">
                      Transfer from current pharmacy
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      We contact your current pharmacy to transfer your prescription.
                    </p>
                    {prescriptionMethod === "transfer" && (
                      <div className="mt-4 space-y-4">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <ArrowRightLeft className="h-4 w-4" />
                          Transfer details
                        </div>
                        <div>
                          <Label htmlFor="rxNumbers">Prescription numbers *</Label>
                          <textarea
                            id="rxNumbers"
                            placeholder="One prescription number per line"
                            value={transferRxNumbers}
                            onChange={(e) => setTransferRxNumbers(e.target.value)}
                            rows={3}
                            className="mt-1.5 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="pharmacyName">Current pharmacy name *</Label>
                            <Input
                              id="pharmacyName"
                              value={transferPharmacyName}
                              onChange={(e) => setTransferPharmacyName(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="pharmacyPhone">Pharmacy phone *</Label>
                            <Input
                              id="pharmacyPhone"
                              type="tel"
                              value={transferPharmacyPhone}
                              onChange={(e) => setTransferPharmacyPhone(formatPhoneInput(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3 border rounded-lg p-4">
                  <RadioGroupItem value="upload" id="rx-upload" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="rx-upload" className="font-semibold cursor-pointer">
                      Upload your prescription
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">Photo or PDF of your written prescription.</p>
                    {prescriptionMethod === "upload" && (
                      <div className="mt-4">
                        <input
                          type="file"
                          id="prescription-file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={handleFileChange}
                          className="hidden"
                          disabled={uploadingPrescription}
                        />
                        <label
                          htmlFor="prescription-file"
                          className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer block"
                        >
                          {uploadingPrescription ? (
                            <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
                          ) : (
                            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          )}
                          {prescriptionFile ? (
                            <p className="text-sm font-medium text-emerald-600">{prescriptionFile.name}</p>
                          ) : (
                            <p className="text-sm text-muted-foreground">JPG, PNG, or PDF (max 10MB)</p>
                          )}
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3 border rounded-lg p-4">
                  <RadioGroupItem value="eprescribe" id="rx-eprescribe" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="rx-eprescribe" className="font-semibold cursor-pointer">
                      Doctor will e-prescribe
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your doctor sends the prescription directly to Clear Choice Pharmacy.
                    </p>
                    {prescriptionMethod === "eprescribe" && (
                      <div className="mt-4 space-y-4">
                        <div className="bg-muted/50 rounded-lg p-4 text-sm">
                          <p className="font-semibold mb-1">Clear Choice Pharmacy</p>
                          <p className="text-muted-foreground">40890 Grand River Ave, Novi, MI 48375</p>
                          <p className="text-muted-foreground">Phone: (248) 987-6182 · Fax: (248) 987-4963</p>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="doctorName">Doctor&apos;s name *</Label>
                            <Input
                              id="doctorName"
                              value={doctorName}
                              onChange={(e) => setDoctorName(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="doctorPhone">Doctor&apos;s phone *</Label>
                            <Input
                              id="doctorPhone"
                              type="tel"
                              value={doctorPhone}
                              onChange={(e) => setDoctorPhone(formatPhoneInput(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </>
        )}

        {step === 5 && (
          <>
            <CardHeader>
              <CardTitle>Clinical details &amp; fulfillment</CardTitle>
              <CardDescription>Help our team prepare your prior authorization and copay support.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="diagnosis">Diagnosis or condition</Label>
                <Input
                  id="diagnosis"
                  placeholder="e.g. Rheumatoid arthritis"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                />
              </div>
              <div>
                <Label>Are you currently taking this medication?</Label>
                <RadioGroup
                  value={currentlyOnMedication}
                  onValueChange={setCurrentlyOnMedication}
                  className="mt-2 flex flex-wrap gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="on-med-yes" />
                    <Label htmlFor="on-med-yes" className="font-normal">
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="on-med-no" />
                    <Label htmlFor="on-med-no" className="font-normal">
                      No
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <div>
                <Label>Prior authorization status</Label>
                <Select value={priorAuthStatus} onValueChange={setPriorAuthStatus}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALTY_PRIOR_AUTH_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prescriberName">Prescribing doctor</Label>
                  <Input
                    id="prescriberName"
                    value={prescriberName}
                    onChange={(e) => setPrescriberName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="prescriberPhone">Prescriber phone</Label>
                  <Input
                    id="prescriberPhone"
                    type="tel"
                    value={prescriberPhone}
                    onChange={(e) => setPrescriberPhone(formatPhoneInput(e.target.value))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="allergies">Drug allergies</Label>
                <Input
                  id="allergies"
                  placeholder="None or list allergies"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                />
              </div>
              <div>
                <Label>Fulfillment preference *</Label>
                <RadioGroup
                  value={fulfillmentPreference}
                  onValueChange={setFulfillmentPreference}
                  className="mt-2 space-y-2"
                >
                  {SPECIALTY_FULFILLMENT_OPTIONS.map((opt) => (
                    <div key={opt.value} className="flex items-center space-x-3 border rounded-lg p-3">
                      <RadioGroupItem value={opt.value} id={`fulfill-${opt.value}`} />
                      <Label htmlFor={`fulfill-${opt.value}`} className="cursor-pointer font-normal">
                        {opt.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div>
                <Label htmlFor="notes">Anything else we should know?</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Questions, copay concerns, timing needs..."
                />
              </div>

              <div className="rounded-lg border bg-muted/30 p-4 text-sm space-y-2">
                <p className="font-semibold flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Review summary
                </p>
                <p>
                  <span className="text-muted-foreground">Medication:</span> {medicationLabel}
                </p>
                <p>
                  <span className="text-muted-foreground">Insurance:</span> {insurancePlanName}
                </p>
                <p>
                  <span className="text-muted-foreground">Prescription:</span>{" "}
                  {prescriptionMethod === "transfer"
                    ? "Transfer from current pharmacy"
                    : prescriptionMethod === "upload"
                      ? "Upload on file"
                      : prescriptionMethod === "eprescribe"
                        ? "Doctor e-prescribe"
                        : "—"}
                </p>
              </div>

              <InjectionTelehealthConsents
                idPrefix="specialty"
                variant="specialty-pharmacy"
                values={injectionConsents}
                onChange={(key, value) => {
                  setInjectionConsents((prev) => ({ ...prev, [key]: value }))
                  setFieldErrors((prev) => {
                    if (!prev.has(key)) return prev
                    const next = new Set(prev)
                    next.delete(key)
                    return next
                  })
                }}
                invalidFields={fieldErrors}
              />
            </CardContent>
          </>
        )}

        <CardFooter className="flex flex-col sm:flex-row gap-3 border-t pt-6">
          {step > 1 && (
            <Button type="button" variant="outline" onClick={goBack} className="w-full sm:w-auto bg-transparent">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          <div className="flex-1" />
          {step < 5 ? (
            <Button type="button" onClick={goNext} className="w-full sm:w-auto">
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit transfer request"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        Prefer to talk to someone?{" "}
        <a href="tel:+12489876182" className="text-primary hover:underline inline-flex items-center gap-1">
          <Phone className="h-3.5 w-3.5" />
          (248) 987-6182
        </a>
      </p>
    </div>
  )
}
