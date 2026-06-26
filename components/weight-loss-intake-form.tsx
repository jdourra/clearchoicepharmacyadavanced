"use client"

import { useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Activity,
  XCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { IntakeIdentityPaymentSection } from "@/components/intake-identity-payment"
import { IntakeOrderSummary } from "@/components/intake-order-summary"
import { IntakeValidationAlert } from "@/components/intake-validation-alert"
import { IntakeSuccessPanel } from "@/components/intake-success-panel"
import { emptyIntakePaymentValues, getIntakePaymentInvalidFields, paymentCapturedOnClient } from "@/lib/intake-payment"
import { InjectionTelehealthConsents } from "@/components/injection-telehealth-consents"
import {
  emptyInjectionTelehealthConsents,
  getInjectionConsentInvalidFields,
  type InjectionTelehealthConsentValues,
} from "@/lib/injection-telehealth-consents"
import { WEIGHT_LOSS_PROGRAMS, type WeightLossBillingPlan } from "@/lib/weight-loss-catalog"

type BillingPlan = WeightLossBillingPlan

type ProgramOption = (typeof WEIGHT_LOSS_PROGRAMS)[number]

type FormData = {
  selectedProgram: string
  selectedBillingPlan: BillingPlan
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  state: string
  address: string
  city: string
  zipCode: string
  heightFeet: string
  heightInches: string
  weightLbs: string
  goalWeightLbs: string
  systolicBP: string
  diastolicBP: string
  comorbidities: string[]
  pregnantOrBreastfeeding: boolean
  mtcOrMen2History: boolean
  pancreatitisHistory: boolean
  type1Diabetes: boolean
  eatingDisorder: boolean
  onOtherGlp: boolean
  confirmedNoContraindications: boolean
  type2Diabetes: string
  hypertension: string
  gallbladderDisease: string
  diabeticRetinopathy: string
  bariatricSurgery: string
  sleepApnea: string
  cardiovascularDisease: string
  currentMedications: string
  allergies: string
  priorGlpExperience: string
  weightLossGoals: string[]
  additionalConcerns: string
  shippingAddress: string
  shippingCity: string
  shippingState: string
  shippingZip: string
  sameAsResidential: boolean
  idFrontFile: File | null
  idBackFile: File | null
  idFrontKey: string | null
  idBackKey: string | null
  idFrontUploading: boolean
  idBackUploading: boolean
  stripePaymentIntentId: string | null
  paymentAuthorized: boolean
  injectionConsents: InjectionTelehealthConsentValues
  authorizeHold: boolean
}

const initialFormData: FormData = {
  selectedProgram: "",
  selectedBillingPlan: "monthly",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  state: "",
  address: "",
  city: "",
  zipCode: "",
  heightFeet: "",
  heightInches: "",
  weightLbs: "",
  goalWeightLbs: "",
  systolicBP: "",
  diastolicBP: "",
  comorbidities: [],
  pregnantOrBreastfeeding: false,
  mtcOrMen2History: false,
  pancreatitisHistory: false,
  type1Diabetes: false,
  eatingDisorder: false,
  onOtherGlp: false,
  confirmedNoContraindications: false,
  type2Diabetes: "",
  hypertension: "",
  gallbladderDisease: "",
  diabeticRetinopathy: "",
  bariatricSurgery: "",
  sleepApnea: "",
  cardiovascularDisease: "",
  currentMedications: "",
  allergies: "",
  priorGlpExperience: "",
  weightLossGoals: [],
  additionalConcerns: "",
  shippingAddress: "",
  shippingCity: "",
  shippingState: "",
  shippingZip: "",
  sameAsResidential: true,
  idFrontFile: null,
  idBackFile: null,
  ...emptyIntakePaymentValues,
  injectionConsents: { ...emptyInjectionTelehealthConsents },
  authorizeHold: false,
}

const programs = WEIGHT_LOSS_PROGRAMS

const states = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
  "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico",
  "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
  "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
]

const comorbidityOptions = [
  { id: "type2-diabetes", label: "Type 2 diabetes" },
  { id: "hypertension", label: "High blood pressure" },
  { id: "high-cholesterol", label: "High cholesterol" },
  { id: "sleep-apnea", label: "Sleep apnea" },
  { id: "heart-disease", label: "Heart disease" },
  { id: "pcos", label: "PCOS" },
]

const weightLossGoalOptions = [
  "Lose 10-20 lbs",
  "Lose 20-40 lbs",
  "Lose 40+ lbs",
  "Improve metabolic health",
  "Reduce appetite/cravings",
  "Long-term weight maintenance",
]

function calculateBmi(heightFeet: string, heightInches: string, weightLbs: string): number | null {
  const ft = parseInt(heightFeet)
  const inch = parseInt(heightInches)
  const weight = parseFloat(weightLbs)
  if (isNaN(ft) || isNaN(inch) || isNaN(weight) || weight <= 0) return null
  const totalInches = ft * 12 + inch
  if (totalInches <= 0) return null
  return (weight / (totalInches * totalInches)) * 703
}

function hasAnyContraindication(formData: FormData): boolean {
  return (
    formData.pregnantOrBreastfeeding ||
    formData.mtcOrMen2History ||
    formData.pancreatitisHistory ||
    formData.type1Diabetes ||
    formData.eatingDisorder ||
    formData.onOtherGlp
  )
}

function isYesNoAnswered(value: string): boolean {
  return value === "yes" || value === "no"
}

type StepValidation = {
  valid: boolean
  message: string
  fields: string[]
}

function getStepValidation(formData: FormData, bmi: number | null, currentStep: number): StepValidation {
  const fields: string[] = []
  const add = (...keys: string[]) => {
    for (const key of keys) {
      if (!fields.includes(key)) fields.push(key)
    }
  }

  switch (currentStep) {
    case 1:
      if (!formData.selectedProgram) {
        add("selectedProgram")
        return { valid: false, message: "Please select a GLP program to continue.", fields }
      }
      return { valid: true, message: "", fields: [] }

    case 2: {
      if (!formData.firstName) add("firstName")
      if (!formData.lastName) add("lastName")
      if (!formData.email) add("email")
      if (!formData.phone) add("phone")
      if (!formData.dateOfBirth) add("dateOfBirth")
      if (!formData.state) add("state")
      if (fields.length > 0) {
        return { valid: false, message: "Please complete all required demographic information.", fields }
      }
      if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        return { valid: false, message: "Please enter a valid email address.", fields: ["email"] }
      }
      if (!formData.heightFeet) add("heightFeet")
      if (!formData.heightInches && formData.heightInches !== "0") add("heightInches")
      if (!formData.weightLbs) add("weightLbs")
      if (fields.length > 0) {
        return { valid: false, message: "Please enter your height and current weight.", fields }
      }
      if (bmi === null || bmi < 18) {
        return {
          valid: false,
          message: "Please enter valid height and weight values.",
          fields: ["heightFeet", "heightInches", "weightLbs"],
        }
      }
      if (!formData.systolicBP) add("systolicBP")
      if (!formData.diastolicBP) add("diastolicBP")
      if (fields.length > 0) {
        return { valid: false, message: "Please enter your blood pressure readings.", fields }
      }
      if (bmi >= 27 && bmi < 30 && formData.comorbidities.length === 0) {
        return {
          valid: false,
          message: "With a BMI between 27 and 30, please select at least one qualifying medical condition.",
          fields: ["comorbidities"],
        }
      }
      if (!formData.priorGlpExperience) {
        return { valid: false, message: "Please indicate your prior GLP-1 experience.", fields: ["priorGlpExperience"] }
      }
      if (formData.weightLossGoals.length === 0) {
        return { valid: false, message: "Please select at least one weight loss goal.", fields: ["weightLossGoals"] }
      }
      return { valid: true, message: "", fields: [] }
    }

    case 3: {
      if (!hasAnyContraindication(formData) && !formData.confirmedNoContraindications) {
        return {
          valid: false,
          message: 'Please check "None of the above apply to me" if you do not have any listed contraindications.',
          fields: ["confirmedNoContraindications"],
        }
      }
      if (hasAnyContraindication(formData) && formData.confirmedNoContraindications) {
        return {
          valid: false,
          message: 'Please uncheck "None of the above apply to me" if any contraindication applies to you.',
          fields: ["confirmedNoContraindications"],
        }
      }

      const yesNoFields: { key: keyof FormData; field: string }[] = [
        { key: "type2Diabetes", field: "type2Diabetes" },
        { key: "hypertension", field: "hypertension" },
        { key: "gallbladderDisease", field: "gallbladderDisease" },
        { key: "diabeticRetinopathy", field: "diabeticRetinopathy" },
        { key: "bariatricSurgery", field: "bariatricSurgery" },
        { key: "sleepApnea", field: "sleepApnea" },
        { key: "cardiovascularDisease", field: "cardiovascularDisease" },
      ]

      for (const { key, field } of yesNoFields) {
        if (!isYesNoAnswered(formData[key] as string)) add(field)
      }

      if (fields.length > 0) {
        return {
          valid: false,
          message: "Please answer Yes or No for each highlighted medical history question.",
          fields,
        }
      }
      return { valid: true, message: "", fields: [] }
    }

    case 4: {
      if (!formData.sameAsResidential) {
        if (!formData.shippingAddress) add("shippingAddress")
        if (!formData.shippingCity) add("shippingCity")
        if (!formData.shippingState) add("shippingState")
        if (!formData.shippingZip) add("shippingZip")
        if (fields.length > 0) {
          return { valid: false, message: "Please complete shipping address information.", fields }
        }
      }
      for (const field of getIntakePaymentInvalidFields({
        idFrontFile: formData.idFrontFile,
        idBackFile: formData.idBackFile,
        idFrontKey: formData.idFrontKey,
        idBackKey: formData.idBackKey,
        idFrontUploading: formData.idFrontUploading,
        idBackUploading: formData.idBackUploading,
        stripePaymentIntentId: formData.stripePaymentIntentId,
        paymentAuthorized: formData.paymentAuthorized,
      })) {
        add(field)
      }
      if (fields.length > 0) {
        return { valid: false, message: "Please upload your ID and complete payment information.", fields }
      }
      for (const field of getInjectionConsentInvalidFields(formData.injectionConsents, {
        variant: "weight-loss",
        programId: formData.selectedProgram,
      })) {
        add(field)
      }
      if (!formData.authorizeHold) add("authorizeHold")
      if (fields.length > 0) {
        return {
          valid: false,
          message: "Please complete all required telemedicine consents and payment authorization.",
          fields,
        }
      }
      return { valid: true, message: "", fields: [] }
    }

    default:
      return { valid: true, message: "", fields: [] }
  }
}

function scrollToFirstField(fields: string[]) {
  if (fields.length === 0) return
  requestAnimationFrame(() => {
    document.querySelector(`[data-field="${fields[0]}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" })
  })
}

function checkContraindicationHardStop(formData: FormData): { isHardStop: boolean; reason: string } {
  if (formData.pregnantOrBreastfeeding) {
    return { isHardStop: true, reason: "GLP-1 therapy is not safe during pregnancy or breastfeeding." }
  }
  if (formData.mtcOrMen2History) {
    return {
      isHardStop: true,
      reason: "Personal or family history of medullary thyroid cancer or MEN2 is a contraindication to GLP-1 therapy.",
    }
  }
  if (formData.pancreatitisHistory) {
    return { isHardStop: true, reason: "A history of pancreatitis requires in-person evaluation before GLP-1 therapy." }
  }
  if (formData.type1Diabetes) {
    return { isHardStop: true, reason: "GLP-1 weight loss programs are not appropriate for Type 1 diabetes." }
  }
  if (formData.eatingDisorder) {
    return {
      isHardStop: true,
      reason: "Active eating disorders require specialized in-person care before weight loss medication.",
    }
  }
  return { isHardStop: false, reason: "" }
}

function YesNoField({
  field,
  label,
  value,
  onChange,
  hasError,
}: {
  field: string
  label: string
  value: string
  onChange: (v: string) => void
  hasError?: boolean
}) {
  return (
    <div
      data-field={field}
      className={cn(
        "space-y-2 rounded-md transition-colors",
        hasError && "ring-2 ring-destructive bg-destructive/5 p-3 -m-1"
      )}
    >
      <Label className={cn(hasError && "text-destructive")}>{label}</Label>
      <RadioGroup value={value} onValueChange={onChange} className="flex gap-4">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="no" id={`${field}-no`} />
          <Label htmlFor={`${field}-no`} className="font-normal cursor-pointer">
            No
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="yes" id={`${field}-yes`} />
          <Label htmlFor={`${field}-yes`} className="font-normal cursor-pointer">
            Yes
          </Label>
        </div>
      </RadioGroup>
      {hasError && <p className="text-xs text-destructive">Please select Yes or No</p>}
    </div>
  )
}

export type WeightLossIntakeFormProps = {
  initialProgram?: string
  initialBillingPlan?: BillingPlan
}

export function WeightLossIntakeForm({
  initialProgram,
  initialBillingPlan = "monthly",
}: WeightLossIntakeFormProps = {}) {
  const programPrefilled = Boolean(initialProgram && programs.some((p) => p.id === initialProgram))
  const minStep = programPrefilled ? 2 : 1

  const [step, setStep] = useState(programPrefilled ? 2 : 1)
  const [formData, setFormData] = useState<FormData>({
    ...initialFormData,
    selectedProgram: initialProgram || "",
    selectedBillingPlan: initialBillingPlan,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [hardStop, setHardStop] = useState<{ active: boolean; reason: string }>({ active: false, reason: "" })
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [statusLogs, setStatusLogs] = useState<string[]>([])
  const [fieldErrors, setFieldErrors] = useState<Set<string>>(new Set())
  const [validationFields, setValidationFields] = useState<string[]>([])

  const totalSteps = 4
  const selectedProgram = programs.find((p) => p.id === formData.selectedProgram)
  const bmi = useMemo(
    () => calculateBmi(formData.heightFeet, formData.heightInches, formData.weightLbs),
    [formData.heightFeet, formData.heightInches, formData.weightLbs]
  )

  const isFieldInvalid = useCallback((field: string) => fieldErrors.has(field), [fieldErrors])

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      if (!prev.has(field)) return prev
      const next = new Set(prev)
      next.delete(field)
      return next
    })
  }, [])

  const updateFormData = useCallback(<K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    clearFieldError(field as string)
  }, [clearFieldError])

  const updateInjectionConsent = useCallback(
    <K extends keyof InjectionTelehealthConsentValues>(key: K, value: InjectionTelehealthConsentValues[K]) => {
      setFormData((prev) => ({
        ...prev,
        injectionConsents: { ...prev.injectionConsents, [key]: value },
      }))
      clearFieldError(key)
    },
    [clearFieldError]
  )

  const toggleArrayValue = useCallback((field: "comorbidities" | "weightLossGoals", value: string, checked: boolean) => {
    setFormData((prev) => {
      const current = prev[field]
      return {
        ...prev,
        [field]: checked ? [...current, value] : current.filter((v) => v !== value),
      }
    })
    clearFieldError(field)
  }, [clearFieldError])

  const validateScreening = useCallback(() => {
    const contra = checkContraindicationHardStop(formData)
    if (contra.isHardStop) {
      setHardStop({ active: true, reason: contra.reason })
      return false
    }
    setHardStop({ active: false, reason: "" })
    return true
  }, [formData])

  const validateStep = (currentStep: number): boolean => {
    const result = getStepValidation(formData, bmi, currentStep)
    if (!result.valid) {
      setError(result.message)
      setValidationFields(result.fields)
      setFieldErrors(new Set(result.fields))
      scrollToFirstField(result.fields)
      return false
    }
    setError("")
    setValidationFields([])
    setFieldErrors(new Set())
    return true
  }

  const validateScreeningStep = (): boolean => {
    if (!validateStep(3)) return false
    if (!validateScreening()) return false
    return true
  }

  const nextStep = () => {
    if (hardStop.active) return
    const isValid = step === 3 ? validateScreeningStep() : validateStep(step)
    if (isValid) {
      setStep((prev) => Math.min(prev + 1, totalSteps))
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const prevStep = () => {
    setError("")
    setValidationFields([])
    setFieldErrors(new Set())
    setHardStop({ active: false, reason: "" })
    setStep((prev) => Math.max(prev - 1, minStep))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSubmit = async () => {
    if (!validateStep(step)) return

    setIsSubmitting(true)
    setSubmissionStatus("processing")
    setError("")
    setStatusLogs([])

    const addLog = (message: string) => {
      setStatusLogs((prev) => [...prev, `${new Date().toLocaleTimeString()} - ${message}`])
    }

    const totalHeightInches = parseInt(formData.heightFeet) * 12 + parseInt(formData.heightInches)

    try {
      addLog("Initializing secure submission...")
      await new Promise((r) => setTimeout(r, 600))
      addLog("Validating clinical eligibility...")
      await new Promise((r) => setTimeout(r, 500))

      const payload = {
        patient: {
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
          heightInches: totalHeightInches,
          weightLbs: parseFloat(formData.weightLbs),
          bmi: bmi || 0,
          goalWeightLbs: parseFloat(formData.goalWeightLbs) || 0,
          systolicBP: formData.systolicBP,
          diastolicBP: formData.diastolicBP,
        },
        contraindications: {
          pregnantOrBreastfeeding: formData.pregnantOrBreastfeeding,
          mtcOrMen2History: formData.mtcOrMen2History,
          pancreatitisHistory: formData.pancreatitisHistory,
          type1Diabetes: formData.type1Diabetes,
          eatingDisorder: formData.eatingDisorder,
          onOtherGlp: formData.onOtherGlp,
        },
        medicalHistory: {
          type2Diabetes: formData.type2Diabetes,
          hypertension: formData.hypertension,
          gallbladderDisease: formData.gallbladderDisease,
          diabeticRetinopathy: formData.diabeticRetinopathy,
          bariatricSurgery: formData.bariatricSurgery,
          sleepApnea: formData.sleepApnea,
          cardiovascularDisease: formData.cardiovascularDisease,
          currentMedications: formData.currentMedications,
          allergies: formData.allergies,
        },
        treatment: {
          selectedProgram: formData.selectedProgram,
          selectedBillingPlan: formData.selectedBillingPlan,
          priorGlpExperience: formData.priorGlpExperience,
          weightLossGoals: formData.weightLossGoals,
          comorbidities: formData.comorbidities,
          additionalConcerns: formData.additionalConcerns,
        },
        identity: {
          shippingAddress: formData.sameAsResidential ? formData.address : formData.shippingAddress,
          shippingCity: formData.sameAsResidential ? formData.city : formData.shippingCity,
          shippingState: formData.sameAsResidential ? formData.state : formData.shippingState,
          shippingZip: formData.sameAsResidential ? formData.zipCode : formData.shippingZip,
          ...paymentCapturedOnClient({
            idFrontFile: formData.idFrontFile,
            idBackFile: formData.idBackFile,
            idFrontKey: formData.idFrontKey,
            idBackKey: formData.idBackKey,
            idFrontUploading: formData.idFrontUploading,
            idBackUploading: formData.idBackUploading,
            stripePaymentIntentId: formData.stripePaymentIntentId,
            paymentAuthorized: formData.paymentAuthorized,
          }),
        },
        consents: {
          authorizeHold: formData.authorizeHold,
          injection: formData.injectionConsents,
        },
      }

      addLog("Transmitting to medical review queue...")

      const response = await fetch("/api/submit-weight-loss-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        if (result.hardStop) {
          setHardStop({ active: true, reason: result.error || "Clinical contraindication detected." })
          setSubmissionStatus("idle")
          return
        }
        throw new Error(result.error || "Failed to submit intake form")
      }

      addLog("Submission received successfully!")
      setSubmissionStatus("success")
      setStep(4)
    } catch {
      setSubmissionStatus("error")
      setError("There was an error submitting your information. Please try again or contact support.")
      addLog("ERROR: Submission failed.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (hardStop.active) {
    return (
      <Card className="border-destructive">
        <CardHeader className="bg-destructive/5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-destructive">Not Eligible Online</CardTitle>
              <CardDescription>We cannot proceed with your request through this program</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Clinical Safety Notice</AlertTitle>
            <AlertDescription>{hardStop.reason}</AlertDescription>
          </Alert>
          <p className="text-sm text-muted-foreground mb-4">
            Your safety is our priority. Please consult an in-person healthcare provider for personalized guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => setHardStop({ active: false, reason: "" })}>
              Review My Answers
            </Button>
            <Button asChild>
              <a href="tel:+12489876182">Call 1-248-987-6182</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (submissionStatus === "success") {
    return (
      <IntakeSuccessPanel
        title="Weight Loss Intake Submitted"
        treatmentLabel={selectedProgram?.name}
        returnHref="/weight-loss"
        returnLabel="Return to Weight Loss"
      >
        <p className="text-sm text-muted-foreground">
          Thank you for completing your GLP weight loss intake. If approved, Clear Choice Pharmacy will compound and
          fulfill your medication with ongoing clinical support.
        </p>
      </IntakeSuccessPanel>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Step {step} of {totalSteps}
        </p>
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-2 w-8 rounded-full ${i + 1 <= step ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>
      </div>

      <IntakeValidationAlert message={error} fields={validationFields} />

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              Select Your GLP Program
            </CardTitle>
            <CardDescription>
              Choose the program that best fits your goals. Pricing shown is illustrative—final cost confirmed after
              provider approval.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              data-field="selectedProgram"
              className={cn(
                "space-y-4 rounded-lg transition-colors",
                isFieldInvalid("selectedProgram") && "ring-2 ring-destructive bg-destructive/5 p-3 -m-1"
              )}
            >
            {programs.map((program) => (
              <div
                key={program.id}
                className={cn(
                  "rounded-lg border p-4 cursor-pointer transition-colors",
                  formData.selectedProgram === program.id ? "border-primary bg-primary/5" : "border-border",
                  isFieldInvalid("selectedProgram") && "border-destructive"
                )}
                onClick={() => updateFormData("selectedProgram", program.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{program.name}</p>
                    <p className="text-sm text-primary">{program.subtitle}</p>
                    <p className="text-sm text-muted-foreground mt-1">{program.description}</p>
                    <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside">
                      {program.features.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  </div>
                  <RadioGroup
                    value={formData.selectedProgram}
                    onValueChange={(v) => updateFormData("selectedProgram", v)}
                  >
                    <RadioGroupItem value={program.id} id={program.id} />
                  </RadioGroup>
                </div>
              </div>
            ))}

            {isFieldInvalid("selectedProgram") && (
              <p className="text-sm text-destructive">Please select a program to continue.</p>
            )}
            </div>

            {selectedProgram && (
              <div className="pt-4 border-t">
                <Label className="mb-3 block">Billing preference</Label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {selectedProgram.pricing.map((tier) => (
                    <button
                      key={tier.plan}
                      type="button"
                      onClick={() => updateFormData("selectedBillingPlan", tier.plan)}
                      className={`rounded-lg border p-4 text-left ${
                        formData.selectedBillingPlan === tier.plan ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <p className="font-medium capitalize">{tier.plan}</p>
                      <p className="text-2xl font-bold">${tier.pricePerMonth}<span className="text-sm font-normal">/mo</span></p>
                      {tier.badge && <span className="text-xs text-primary">{tier.badge}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-end">
            <Button onClick={nextStep}>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Information & Vitals</CardTitle>
            <CardDescription>Tell us about yourself and your current health metrics.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {programPrefilled && selectedProgram && (
              <IntakeOrderSummary
                productName={selectedProgram.name}
                productSubtitle={selectedProgram.subtitle}
                billingLabel={formData.selectedBillingPlan === "monthly" ? "Monthly" : "Quarterly"}
                priceLine={`$${selectedProgram.pricing.find((p) => p.plan === formData.selectedBillingPlan)?.pricePerMonth ?? "—"}/mo`}
                changeHref="/weight-loss#programs"
              />
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2" data-field="firstName">
                <Label htmlFor="firstName" className={cn(isFieldInvalid("firstName") && "text-destructive")}>First name *</Label>
                <Input id="firstName" className={cn(isFieldInvalid("firstName") && "border-destructive ring-2 ring-destructive")} value={formData.firstName} onChange={(e) => updateFormData("firstName", e.target.value)} />
              </div>
              <div className="space-y-2" data-field="lastName">
                <Label htmlFor="lastName" className={cn(isFieldInvalid("lastName") && "text-destructive")}>Last name *</Label>
                <Input id="lastName" className={cn(isFieldInvalid("lastName") && "border-destructive ring-2 ring-destructive")} value={formData.lastName} onChange={(e) => updateFormData("lastName", e.target.value)} />
              </div>
              <div className="space-y-2" data-field="email">
                <Label htmlFor="email" className={cn(isFieldInvalid("email") && "text-destructive")}>Email *</Label>
                <Input id="email" type="email" className={cn(isFieldInvalid("email") && "border-destructive ring-2 ring-destructive")} value={formData.email} onChange={(e) => updateFormData("email", e.target.value)} />
              </div>
              <div className="space-y-2" data-field="phone">
                <Label htmlFor="phone" className={cn(isFieldInvalid("phone") && "text-destructive")}>Phone *</Label>
                <Input id="phone" type="tel" className={cn(isFieldInvalid("phone") && "border-destructive ring-2 ring-destructive")} value={formData.phone} onChange={(e) => updateFormData("phone", e.target.value)} />
              </div>
              <div className="space-y-2" data-field="dateOfBirth">
                <Label htmlFor="dob" className={cn(isFieldInvalid("dateOfBirth") && "text-destructive")}>Date of birth *</Label>
                <Input id="dob" type="date" className={cn(isFieldInvalid("dateOfBirth") && "border-destructive ring-2 ring-destructive")} value={formData.dateOfBirth} onChange={(e) => updateFormData("dateOfBirth", e.target.value)} />
              </div>
              <div className="space-y-2" data-field="state">
                <Label htmlFor="state" className={cn(isFieldInvalid("state") && "text-destructive")}>State *</Label>
                <select
                  id="state"
                  className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                    isFieldInvalid("state") && "border-destructive ring-2 ring-destructive"
                  )}
                  value={formData.state}
                  onChange={(e) => updateFormData("state", e.target.value)}
                >
                  <option value="">Select state</option>
                  {states.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2" data-field="heightFeet">
                <Label htmlFor="heightFeet" className={cn(isFieldInvalid("heightFeet") && "text-destructive")}>Height (ft) *</Label>
                <Input id="heightFeet" type="number" min="3" max="8" className={cn(isFieldInvalid("heightFeet") && "border-destructive ring-2 ring-destructive")} value={formData.heightFeet} onChange={(e) => updateFormData("heightFeet", e.target.value)} />
              </div>
              <div className="space-y-2" data-field="heightInches">
                <Label htmlFor="heightInches" className={cn(isFieldInvalid("heightInches") && "text-destructive")}>Height (in) *</Label>
                <Input id="heightInches" type="number" min="0" max="11" className={cn(isFieldInvalid("heightInches") && "border-destructive ring-2 ring-destructive")} value={formData.heightInches} onChange={(e) => updateFormData("heightInches", e.target.value)} />
              </div>
              <div className="space-y-2" data-field="weightLbs">
                <Label htmlFor="weightLbs" className={cn(isFieldInvalid("weightLbs") && "text-destructive")}>Current weight (lbs) *</Label>
                <Input id="weightLbs" type="number" className={cn(isFieldInvalid("weightLbs") && "border-destructive ring-2 ring-destructive")} value={formData.weightLbs} onChange={(e) => updateFormData("weightLbs", e.target.value)} />
              </div>
            </div>

            {bmi !== null && (
              <Alert>
                <Activity className="h-4 w-4" />
                <AlertDescription>
                  Calculated BMI: <strong>{bmi.toFixed(1)}</strong>
                  {bmi >= 30 && " — Eligible for GLP-1 therapy"}
                  {bmi >= 27 && bmi < 30 && " — Qualifying condition required (BMI 27-30)"}
                  {bmi < 27 && bmi >= 18 && " — May not meet GLP-1 eligibility criteria"}
                </AlertDescription>
              </Alert>
            )}

            <div
              data-field="comorbidities"
              className={cn(
                "space-y-3 rounded-md transition-colors",
                isFieldInvalid("comorbidities") && "ring-2 ring-destructive bg-destructive/5 p-3 -m-1"
              )}
            >
              <Label className={cn(isFieldInvalid("comorbidities") && "text-destructive")}>
                Qualifying conditions (required if BMI 27-30)
              </Label>
              <div className="grid sm:grid-cols-2 gap-2">
                {comorbidityOptions.map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={item.id}
                      checked={formData.comorbidities.includes(item.id)}
                      onCheckedChange={(checked) => toggleArrayValue("comorbidities", item.id, checked === true)}
                    />
                    <Label htmlFor={item.id} className="font-normal cursor-pointer">{item.label}</Label>
                  </div>
                ))}
              </div>
              {isFieldInvalid("comorbidities") && (
                <p className="text-xs text-destructive">Select at least one qualifying condition.</p>
              )}
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goalWeight">Goal weight (lbs)</Label>
                <Input id="goalWeight" type="number" value={formData.goalWeightLbs} onChange={(e) => updateFormData("goalWeightLbs", e.target.value)} />
              </div>
              <div className="space-y-2" data-field="systolicBP">
                <Label htmlFor="systolic" className={cn(isFieldInvalid("systolicBP") && "text-destructive")}>Systolic BP *</Label>
                <Input id="systolic" type="number" className={cn(isFieldInvalid("systolicBP") && "border-destructive ring-2 ring-destructive")} value={formData.systolicBP} onChange={(e) => updateFormData("systolicBP", e.target.value)} />
              </div>
              <div className="space-y-2" data-field="diastolicBP">
                <Label htmlFor="diastolic" className={cn(isFieldInvalid("diastolicBP") && "text-destructive")}>Diastolic BP *</Label>
                <Input id="diastolic" type="number" className={cn(isFieldInvalid("diastolicBP") && "border-destructive ring-2 ring-destructive")} value={formData.diastolicBP} onChange={(e) => updateFormData("diastolicBP", e.target.value)} />
              </div>
            </div>

            <div
              data-field="priorGlpExperience"
              className={cn(
                "space-y-2 rounded-md transition-colors",
                isFieldInvalid("priorGlpExperience") && "ring-2 ring-destructive bg-destructive/5 p-3 -m-1"
              )}
            >
              <Label className={cn(isFieldInvalid("priorGlpExperience") && "text-destructive")}>Prior GLP-1 experience *</Label>
              <RadioGroup value={formData.priorGlpExperience} onValueChange={(v) => updateFormData("priorGlpExperience", v)}>
                <div className="flex items-center space-x-2"><RadioGroupItem value="none" id="glp-none" /><Label htmlFor="glp-none" className="font-normal">Never used GLP-1 medication</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="semaglutide" id="glp-sema" /><Label htmlFor="glp-sema" className="font-normal">Previously used semaglutide</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="tirzepatide" id="glp-tirz" /><Label htmlFor="glp-tirz" className="font-normal">Previously used tirzepatide</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="brand" id="glp-brand" /><Label htmlFor="glp-brand" className="font-normal">Previously used brand-name (Ozempic, Wegovy, Mounjaro, etc.)</Label></div>
              </RadioGroup>
              {isFieldInvalid("priorGlpExperience") && (
                <p className="text-xs text-destructive">Please select your prior GLP-1 experience.</p>
              )}
            </div>

            <div
              data-field="weightLossGoals"
              className={cn(
                "space-y-3 rounded-md transition-colors",
                isFieldInvalid("weightLossGoals") && "ring-2 ring-destructive bg-destructive/5 p-3 -m-1"
              )}
            >
              <Label className={cn(isFieldInvalid("weightLossGoals") && "text-destructive")}>Weight loss goals *</Label>
              <div className="grid sm:grid-cols-2 gap-2">
                {weightLossGoalOptions.map((goal) => (
                  <div key={goal} className="flex items-center space-x-2">
                    <Checkbox
                      id={goal}
                      checked={formData.weightLossGoals.includes(goal)}
                      onCheckedChange={(checked) => toggleArrayValue("weightLossGoals", goal, checked === true)}
                    />
                    <Label htmlFor={goal} className="font-normal cursor-pointer">{goal}</Label>
                  </div>
                ))}
              </div>
              {isFieldInvalid("weightLossGoals") && (
                <p className="text-xs text-destructive">Please select at least one goal.</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={prevStep}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
            <Button onClick={nextStep}>Continue <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </CardFooter>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Medical Screening</CardTitle>
            <CardDescription>Answer honestly—this helps our clinical team determine if GLP-1 therapy is safe for you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-4">
              <p className="text-sm font-medium text-destructive">Absolute contraindications — answer carefully</p>
              <p className="text-sm text-muted-foreground">
                Check any condition that applies to you. If none apply, check the confirmation box at the bottom of this section.
              </p>
              {[
                { field: "pregnantOrBreastfeeding" as const, label: "Are you pregnant, planning pregnancy, or breastfeeding?" },
                { field: "mtcOrMen2History" as const, label: "Personal or family history of medullary thyroid cancer or MEN2?" },
                { field: "pancreatitisHistory" as const, label: "History of pancreatitis?" },
                { field: "type1Diabetes" as const, label: "Do you have Type 1 diabetes?" },
                { field: "eatingDisorder" as const, label: "Active eating disorder (anorexia, bulimia, binge eating)?" },
                { field: "onOtherGlp" as const, label: "Currently taking GLP-1 medication from another provider?" },
              ].map(({ field, label }) => (
                <div key={field} className="flex items-start space-x-3">
                  <Checkbox
                    id={field}
                    checked={formData[field]}
                    onCheckedChange={(checked) => {
                      const isChecked = checked === true
                      setFormData((prev) => {
                        const updated = {
                          ...prev,
                          [field]: isChecked,
                          confirmedNoContraindications: isChecked ? false : prev.confirmedNoContraindications,
                        }
                        if (isChecked && field !== "onOtherGlp") {
                          const check = checkContraindicationHardStop(updated)
                          if (check.isHardStop) setHardStop({ active: true, reason: check.reason })
                        }
                        return updated
                      })
                    }}
                  />
                  <Label htmlFor={field} className="font-normal cursor-pointer leading-snug">{label}</Label>
                </div>
              ))}
              <div
                data-field="confirmedNoContraindications"
                className={cn(
                  "flex items-start space-x-3 border-t border-destructive/20 pt-4 rounded-md transition-colors",
                  isFieldInvalid("confirmedNoContraindications") && "ring-2 ring-destructive bg-destructive/10 p-3 -mx-1"
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
                      pregnantOrBreastfeeding: isChecked ? false : prev.pregnantOrBreastfeeding,
                      mtcOrMen2History: isChecked ? false : prev.mtcOrMen2History,
                      pancreatitisHistory: isChecked ? false : prev.pancreatitisHistory,
                      type1Diabetes: isChecked ? false : prev.type1Diabetes,
                      eatingDisorder: isChecked ? false : prev.eatingDisorder,
                      onOtherGlp: isChecked ? false : prev.onOtherGlp,
                    }))
                    if (isChecked) {
                      setHardStop({ active: false, reason: "" })
                      clearFieldError("confirmedNoContraindications")
                    }
                  }}
                />
                <div>
                  <Label
                    htmlFor="confirmedNoContraindications"
                    className={cn("font-medium cursor-pointer leading-snug", isFieldInvalid("confirmedNoContraindications") && "text-destructive")}
                  >
                    None of the above apply to me *
                  </Label>
                  {isFieldInvalid("confirmedNoContraindications") && (
                    <p className="text-xs text-destructive mt-1">Please confirm if none of these apply to you.</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground mb-4">Additional medical history</p>
              <div className="grid sm:grid-cols-2 gap-6">
              <YesNoField field="type2Diabetes" label="Type 2 diabetes?" value={formData.type2Diabetes} onChange={(v) => updateFormData("type2Diabetes", v)} hasError={isFieldInvalid("type2Diabetes")} />
              <YesNoField field="hypertension" label="High blood pressure?" value={formData.hypertension} onChange={(v) => updateFormData("hypertension", v)} hasError={isFieldInvalid("hypertension")} />
              <YesNoField field="gallbladderDisease" label="Gallbladder disease?" value={formData.gallbladderDisease} onChange={(v) => updateFormData("gallbladderDisease", v)} hasError={isFieldInvalid("gallbladderDisease")} />
              <YesNoField field="diabeticRetinopathy" label="Diabetic retinopathy?" value={formData.diabeticRetinopathy} onChange={(v) => updateFormData("diabeticRetinopathy", v)} hasError={isFieldInvalid("diabeticRetinopathy")} />
              <YesNoField field="bariatricSurgery" label="Prior bariatric surgery?" value={formData.bariatricSurgery} onChange={(v) => updateFormData("bariatricSurgery", v)} hasError={isFieldInvalid("bariatricSurgery")} />
              <YesNoField field="sleepApnea" label="Sleep apnea?" value={formData.sleepApnea} onChange={(v) => updateFormData("sleepApnea", v)} hasError={isFieldInvalid("sleepApnea")} />
              <YesNoField field="cardiovascularDisease" label="Cardiovascular disease?" value={formData.cardiovascularDisease} onChange={(v) => updateFormData("cardiovascularDisease", v)} hasError={isFieldInvalid("cardiovascularDisease")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="medications">Current medications</Label>
              <Textarea id="medications" value={formData.currentMedications} onChange={(e) => updateFormData("currentMedications", e.target.value)} placeholder="List all medications and supplements" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="allergies">Known allergies</Label>
              <Textarea id="allergies" value={formData.allergies} onChange={(e) => updateFormData("allergies", e.target.value)} placeholder="List any drug or food allergies" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="concerns">Additional concerns</Label>
              <Textarea id="concerns" value={formData.additionalConcerns} onChange={(e) => updateFormData("additionalConcerns", e.target.value)} />
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={prevStep}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
            <Button onClick={nextStep}>Continue <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </CardFooter>
        </Card>
      )}

      {step === 4 && submissionStatus !== "success" && (
        <Card>
          <CardHeader>
            <CardTitle>Identity &amp; Payment</CardTitle>
            <CardDescription>Verify your identity, authorize payment, and complete consent.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {(() => {
              const selectedProgram = programs.find((p) => p.id === formData.selectedProgram)
              const currentPricing = selectedProgram?.pricing.find((p) => p.plan === formData.selectedBillingPlan)
              return selectedProgram && currentPricing ? (
                <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-1">
                  <p className="font-semibold">{selectedProgram.name}</p>
                  <p className="text-muted-foreground">{selectedProgram.subtitle}</p>
                  <p className="text-lg font-bold text-primary mt-2">${currentPricing.pricePerMonth}/mo</p>
                  <p className="text-sm text-muted-foreground">Total due upon approval: ${currentPricing.totalBilled}</p>
                </div>
              ) : null
            })()}

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Street address</Label>
                <Input id="address" value={formData.address} onChange={(e) => updateFormData("address", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={formData.city} onChange={(e) => updateFormData("city", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP code</Label>
                <Input id="zip" value={formData.zipCode} onChange={(e) => updateFormData("zipCode", e.target.value)} />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="sameAddress"
                checked={formData.sameAsResidential}
                onCheckedChange={(checked) => updateFormData("sameAsResidential", checked === true)}
              />
              <Label htmlFor="sameAddress" className="font-normal cursor-pointer">Shipping address same as above</Label>
            </div>

            {!formData.sameAsResidential && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2" data-field="shippingAddress">
                  <Label className={cn(isFieldInvalid("shippingAddress") && "text-destructive")}>Shipping street address</Label>
                  <Input className={cn(isFieldInvalid("shippingAddress") && "border-destructive ring-2 ring-destructive")} value={formData.shippingAddress} onChange={(e) => updateFormData("shippingAddress", e.target.value)} />
                </div>
                <div className="space-y-2" data-field="shippingCity">
                  <Label className={cn(isFieldInvalid("shippingCity") && "text-destructive")}>Shipping city</Label>
                  <Input className={cn(isFieldInvalid("shippingCity") && "border-destructive ring-2 ring-destructive")} value={formData.shippingCity} onChange={(e) => updateFormData("shippingCity", e.target.value)} />
                </div>
                <div className="space-y-2" data-field="shippingState">
                  <Label className={cn(isFieldInvalid("shippingState") && "text-destructive")}>Shipping state</Label>
                  <Input className={cn(isFieldInvalid("shippingState") && "border-destructive ring-2 ring-destructive")} value={formData.shippingState} onChange={(e) => updateFormData("shippingState", e.target.value)} />
                </div>
                <div className="space-y-2" data-field="shippingZip">
                  <Label className={cn(isFieldInvalid("shippingZip") && "text-destructive")}>Shipping ZIP</Label>
                  <Input className={cn(isFieldInvalid("shippingZip") && "border-destructive ring-2 ring-destructive")} value={formData.shippingZip} onChange={(e) => updateFormData("shippingZip", e.target.value)} />
                </div>
              </div>
            )}

            <IntakeIdentityPaymentSection
              idPrefix="glp1"
              serviceType="weight_loss"
              patientEmail={formData.email}
              intakePrefix={`glp1-${formData.email || "draft"}`}
              values={{
                idFrontFile: formData.idFrontFile,
                idBackFile: formData.idBackFile,
                idFrontKey: formData.idFrontKey,
                idBackKey: formData.idBackKey,
                idFrontUploading: formData.idFrontUploading,
                idBackUploading: formData.idBackUploading,
                stripePaymentIntentId: formData.stripePaymentIntentId,
                paymentAuthorized: formData.paymentAuthorized,
              }}
              onChange={updateFormData}
              totalBilled={
                programs
                  .find((p) => p.id === formData.selectedProgram)
                  ?.pricing.find((p) => p.plan === formData.selectedBillingPlan)?.totalBilled ?? 0
              }
              invalidFields={fieldErrors}
            />

            <InjectionTelehealthConsents
              idPrefix="glp1"
              variant="weight-loss"
              programId={formData.selectedProgram}
              values={formData.injectionConsents}
              onChange={updateInjectionConsent}
              invalidFields={fieldErrors}
            />

            <div className="space-y-3 border-t pt-4">
              <div
                data-field="authorizeHold"
                className={cn(
                  "flex items-start space-x-2 rounded-md p-2 -mx-2 transition-colors",
                  isFieldInvalid("authorizeHold") && "ring-2 ring-destructive bg-destructive/5"
                )}
              >
                <Checkbox
                  id="authorizeHold"
                  checked={formData.authorizeHold}
                  onCheckedChange={(checked) => updateFormData("authorizeHold", checked === true)}
                />
                <Label
                  htmlFor="authorizeHold"
                  className={cn("font-normal cursor-pointer leading-snug", isFieldInvalid("authorizeHold") && "text-destructive")}
                >
                  I authorize a payment hold of{" "}
                  <strong>
                    $
                    {programs
                      .find((p) => p.id === formData.selectedProgram)
                      ?.pricing.find((p) => p.plan === formData.selectedBillingPlan)?.totalBilled ?? 0}
                  </strong>{" "}
                  to be charged only upon prescription approval *
                </Label>
              </div>
            </div>

            {submissionStatus === "processing" && statusLogs.length > 0 && (
              <div className="rounded-lg bg-muted p-4 font-mono text-xs space-y-1">
                {statusLogs.map((log, i) => (
                  <p key={i}>{log}</p>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={prevStep} disabled={isSubmitting}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                "Submit Intake"
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
