"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
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
import { formatPhoneInput } from "@/lib/phone"
import { IntakeIdentityPaymentSection } from "@/components/intake-identity-payment"
import { IntakeOrderSummary } from "@/components/intake-order-summary"
import { IntakeValidationAlert } from "@/components/intake-validation-alert"
import { IntakePhysicianCallNotice } from "@/components/intake-physician-call-notice"
import { IntakeSuccessPanel } from "@/components/intake-success-panel"
import {
  emptyIntakePaymentValues,
  getIntakeIdentityInvalidFields,
  getIntakePaymentInvalidFields,
  paymentCapturedOnClient,
} from "@/lib/intake-payment"
import { MICHIGAN_STATE_NAME } from "@/lib/michigan-eligibility"
import { parseUsState, requiresSyncVisit, US_STATES } from "@/lib/us-states"
import { Glp1ProtocolQuestions } from "@/components/glp1-protocol-questions"
import { InjectionTelehealthConsents } from "@/components/injection-telehealth-consents"
import {
  bmiBand,
  emptyGlp1Protocol,
  validateGlp1Protocol,
  type Glp1ProtocolAnswers,
} from "@/lib/glp1-intake-protocol"
import {
  emptyInjectionTelehealthConsents,
  getInjectionConsentInvalidFields,
  type InjectionTelehealthConsentValues,
} from "@/lib/injection-telehealth-consents"
import { WeightLossDoseTierPricing } from "@/components/weight-loss-dose-tier-pricing"
import {
  WEIGHT_LOSS_PROGRAMS,
  WEIGHT_LOSS_DOCTOR_REVIEW,
  WEIGHT_LOSS_DOSE_SELECT_HINT,
  WEIGHT_LOSS_DOSE_SELECT_TITLE,
  WEIGHT_LOSS_LIVE_VISIT_FEE_NOTE,
  WEIGHT_LOSS_PARTNER_FULFILLMENT,
  WEIGHT_LOSS_ONLINE_CARD_HOLD_ENABLED,
  weightLossPaymentPatientNote,
  formatDoseOptionLabel,
  formatKitBillingLabel,
  formatKitPriceCaption,
  formatSelectedDoseSummary,
  getDefaultWeightLossDoseId,
  getWeightLossDose,
  getWeightLossIntakeHoldQuote,
  parseWeeklyDoseMg,
  suggestWeightLossDoseId,
  type WeightLossBillingPlan,
  type WeightLossDoseId,
} from "@/lib/weight-loss-catalog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { applyResidentialProfile, usePatientProfilePrefill } from "@/lib/patient-profile-prefill"
import { LEGAL_BUSINESS_NAME, ZELLE_PAYMENT_EMAIL } from "@/lib/site-config"

type BillingPlan = WeightLossBillingPlan

type ProgramOption = (typeof WEIGHT_LOSS_PROGRAMS)[number]

type FormData = {
  selectedProgram: string
  selectedBillingPlan: BillingPlan
  selectedDoseTier: WeightLossDoseId
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: "" | "female" | "male" | "other"
  state: string
  visitSlotKey: string
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
  priorGlpForm: string
  priorGlpCurrentDose: string
  priorGlpDuration: string
  priorGlpTolerability: string
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
  protocol: Glp1ProtocolAnswers
}

const initialFormData: FormData = {
  selectedProgram: "",
  selectedBillingPlan: "monthly",
  selectedDoseTier: "sema-1mg",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
  state: MICHIGAN_STATE_NAME,
  visitSlotKey: "",
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
  priorGlpForm: "",
  priorGlpCurrentDose: "",
  priorGlpDuration: "",
  priorGlpTolerability: "",
  weightLossGoals: [],
  additionalConcerns: "",
  shippingAddress: "",
  shippingCity: "",
  shippingState: MICHIGAN_STATE_NAME,
  shippingZip: "",
  sameAsResidential: true,
  idFrontFile: null,
  idBackFile: null,
  ...emptyIntakePaymentValues,
  injectionConsents: { ...emptyInjectionTelehealthConsents },
  authorizeHold: false,
  protocol: emptyGlp1Protocol(),
}

const programs = WEIGHT_LOSS_PROGRAMS

function formatVisitSlot(start: string): string {
  const date = new Date(start)
  if (Number.isNaN(date.getTime())) return start
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

function selectedVisit(key: string): { scheduleStart: string; scheduleEnd: string; providerGuid: string } | null {
  const [scheduleStart, scheduleEnd, providerGuid] = key.split("||")
  if (!scheduleStart || !scheduleEnd || !providerGuid) return null
  return { scheduleStart, scheduleEnd, providerGuid }
}

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

function needsPriorGlpDetails(formData: FormData): boolean {
  return (
    (formData.priorGlpExperience !== "" && formData.priorGlpExperience !== "none") || formData.onOtherGlp
  )
}

function formatPriorGlpExperience(formData: FormData): string {
  if (!formData.priorGlpExperience || formData.priorGlpExperience === "none") {
    return formData.onOtherGlp
      ? `none listed · currently on another GLP | form: ${formData.priorGlpForm || "n/a"} | dose: ${formData.priorGlpCurrentDose || "n/a"} | duration: ${formData.priorGlpDuration || "n/a"} | tolerability: ${formData.priorGlpTolerability || "n/a"}`
      : "none"
  }
  return [
    formData.priorGlpExperience,
    formData.priorGlpForm ? `form: ${formData.priorGlpForm}` : null,
    formData.priorGlpCurrentDose ? `current dose: ${formData.priorGlpCurrentDose}` : null,
    formData.priorGlpDuration ? `duration: ${formData.priorGlpDuration}` : null,
    formData.priorGlpTolerability ? `tolerability: ${formData.priorGlpTolerability}` : null,
    formData.onOtherGlp ? "currently on another GLP" : null,
  ]
    .filter(Boolean)
    .join(" | ")
}

function isYesNoAnswered(value: string): boolean {
  return value === "yes" || value === "no"
}

type StepValidation = {
  valid: boolean
  message: string
  fields: string[]
}

function getStepValidation(
  formData: FormData,
  bmi: number | null,
  currentStep: number,
  visitTimes: { status: "idle" | "loading" | "ready" | "empty" | "error"; message: string },
  cardPayment: boolean
): StepValidation {
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
      if (!formData.gender) add("gender")
      if (!formData.state) add("state")
      if (requiresSyncVisit(formData.state)) {
        if (visitTimes.status === "loading" || visitTimes.status === "idle") {
          return { valid: false, message: "Loading video visit times…", fields: ["visitSlot"] }
        }
        if (!formData.visitSlotKey) {
          return {
            valid: false,
            message: visitTimes.message || "This state requires a live video visit. Choose an appointment time.",
            fields: ["visitSlot"],
          }
        }
      }
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
      if (bmi === null || bmi <= 0) {
        return {
          valid: false,
          message: "Please enter valid height and weight values.",
          fields: ["heightFeet", "heightInches", "weightLbs"],
        }
      }
      if (bmiBand(bmi) === "ineligible") {
        return {
          valid: false,
          message: "A BMI under 20 is not eligible for this weight-loss program. Please see an in-person clinician.",
          fields: ["heightFeet", "heightInches", "weightLbs"],
        }
      }
      return { valid: true, message: "", fields: [] }
    }

    case 3: {
      const protocol = validateGlp1Protocol(formData.protocol, {
        sex: formData.gender,
        threeMonth: formData.selectedBillingPlan === "quarterly",
      })
      if (protocol.hardStop) {
        return { valid: false, message: protocol.hardStop, fields: protocol.fields }
      }
      if (!protocol.ok) {
        return { valid: false, message: protocol.message, fields: protocol.fields }
      }
      return { valid: true, message: "", fields: [] }
    }

    case 4: {
      if (!formData.address.trim()) add("address")
      if (!formData.city.trim()) add("city")
      if (!formData.zipCode.trim()) add("zipCode")
      if (!formData.sameAsResidential) {
        if (!formData.shippingAddress) add("shippingAddress")
        if (!formData.shippingCity) add("shippingCity")
        if (!formData.shippingState) add("shippingState")
        if (!formData.shippingZip) add("shippingZip")
        if (fields.length > 0) {
          return { valid: false, message: "Please complete shipping address information.", fields }
        }
      }
      if (fields.length > 0) {
        return { valid: false, message: "Please complete your street address, city, and ZIP code.", fields }
      }
      const paymentValues = {
        idFrontFile: formData.idFrontFile,
        idBackFile: formData.idBackFile,
        idFrontKey: formData.idFrontKey,
        idBackKey: formData.idBackKey,
        idFrontUploading: formData.idFrontUploading,
        idBackUploading: formData.idBackUploading,
        stripePaymentIntentId: formData.stripePaymentIntentId,
        paymentAuthorized: formData.paymentAuthorized,
      }
      const paymentFields = cardPayment
        ? getIntakePaymentInvalidFields(paymentValues)
        : getIntakeIdentityInvalidFields(paymentValues)
      for (const field of paymentFields) add(field)
      if (fields.length > 0) {
        return {
          valid: false,
          message: cardPayment
            ? "Please upload your ID and authorize the card hold."
            : "Please upload front and back of your photo ID.",
          fields,
        }
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
          message: cardPayment
            ? "Please complete all required telemedicine consents and authorize the card hold."
            : "Please complete all required telemedicine consents and acknowledge pharmacy payment.",
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
  initialDoseTier?: WeightLossDoseId
  /** When the clinician network is live, a card payment is required before the intake can be sent. */
  requireOnlinePayment?: boolean
}

export function WeightLossIntakeForm({
  initialProgram,
  initialBillingPlan = "monthly",
  initialDoseTier,
  requireOnlinePayment = false,
}: WeightLossIntakeFormProps = {}) {
  const requireCardPayment = WEIGHT_LOSS_ONLINE_CARD_HOLD_ENABLED || requireOnlinePayment
  const programPrefilled = Boolean(initialProgram && programs.some((p) => p.id === initialProgram))
  const minStep = programPrefilled ? 2 : 1
  const resolvedInitialDose =
    initialDoseTier ||
    (initialProgram ? getDefaultWeightLossDoseId(initialProgram) : getDefaultWeightLossDoseId("semaglutide"))

  const [step, setStep] = useState(programPrefilled ? 2 : 1)
  const [formData, setFormData] = useState<FormData>({
    ...initialFormData,
    selectedProgram: initialProgram || "",
    selectedBillingPlan: initialBillingPlan,
    selectedDoseTier: resolvedInitialDose,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [hardStop, setHardStop] = useState<{ active: boolean; reason: string }>({ active: false, reason: "" })
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [statusLogs, setStatusLogs] = useState<string[]>([])
  const [fieldErrors, setFieldErrors] = useState<Set<string>>(new Set())
  const [visitSlots, setVisitSlots] = useState<
    { scheduleStart: string; scheduleEnd: string; providerGuid: string }[]
  >([])
  const [visitTimesStatus, setVisitTimesStatus] = useState<"idle" | "loading" | "ready" | "empty" | "error">("idle")
  const [visitTimesMessage, setVisitTimesMessage] = useState("")
  const [validationFields, setValidationFields] = useState<string[]>([])
  const { profile } = usePatientProfilePrefill()

  const totalSteps = 4
  const selectedProgram = programs.find((p) => p.id === formData.selectedProgram)
  const selectedTierMeta = selectedProgram
    ? getWeightLossDose(selectedProgram, formData.selectedDoseTier)
    : undefined
  const holdQuote = selectedProgram
    ? getWeightLossIntakeHoldQuote(
        selectedProgram,
        formData.selectedBillingPlan,
        formData.selectedDoseTier
      )
    : undefined
  const suggestedDoseTier = useMemo(() => {
    if (!formData.selectedProgram) return null
    if (formData.priorGlpExperience === "none" && !formData.onOtherGlp) return null
    const mg = parseWeeklyDoseMg(formData.priorGlpCurrentDose)
    if (mg == null) return null
    return suggestWeightLossDoseId(formData.selectedProgram, mg)
  }, [
    formData.selectedProgram,
    formData.priorGlpCurrentDose,
    formData.priorGlpExperience,
    formData.onOtherGlp,
  ])
  const bmi = useMemo(
    () => calculateBmi(formData.heightFeet, formData.heightInches, formData.weightLbs),
    [formData.heightFeet, formData.heightInches, formData.weightLbs]
  )

  useEffect(() => {
    if (!profile) return
    setFormData((prev) => {
      const next = applyResidentialProfile(prev, profile)
      const eSignName =
        next.injectionConsents.eSignName.trim() ||
        `${profile.firstName} ${profile.lastName}`.trim()
      return {
        ...next,
        injectionConsents: { ...next.injectionConsents, eSignName },
      }
    })
  }, [profile])

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
    const protocol = validateGlp1Protocol(formData.protocol, {
      sex: formData.gender,
      threeMonth: formData.selectedBillingPlan === "quarterly",
    })
    if (protocol.hardStop) {
      setHardStop({ active: true, reason: protocol.hardStop })
      return false
    }
    setHardStop({ active: false, reason: "" })
    return true
  }, [formData])

  useEffect(() => {
    const state = parseUsState(formData.state)
    if (!state || !requiresSyncVisit(state.code)) {
      setVisitSlots([])
      setVisitTimesStatus("idle")
      setVisitTimesMessage("")
      return
    }

    let cancelled = false
    setVisitTimesStatus("loading")
    setVisitTimesMessage("")
    fetch(`/api/weight-loss/visit-times?state=${encodeURIComponent(state.code)}`)
      .then(async (response) => {
        const body = (await response.json()) as {
          slots?: { scheduleStart?: string; scheduleEnd?: string; providerGuid?: string }[]
          message?: string
        }
        if (cancelled) return
        const slots = (body.slots || [])
          .filter((slot) => slot.scheduleStart && slot.scheduleEnd && slot.providerGuid)
          .map((slot) => ({
            scheduleStart: slot.scheduleStart || "",
            scheduleEnd: slot.scheduleEnd || "",
            providerGuid: slot.providerGuid || "",
          }))
        setVisitSlots(slots)
        setVisitTimesMessage(typeof body.message === "string" ? body.message : "")
        setVisitTimesStatus(slots.length > 0 ? "ready" : response.ok ? "empty" : "error")
      })
      .catch(() => {
        if (cancelled) return
        setVisitSlots([])
        setVisitTimesStatus("error")
        setVisitTimesMessage("Video visit times could not be loaded. Please try again.")
      })

    return () => {
      cancelled = true
    }
  }, [formData.state])

  const validateStep = (currentStep: number): boolean => {
    const result = getStepValidation(
      formData,
      bmi,
      currentStep,
      {
        status: visitTimesStatus,
        message: visitTimesMessage,
      },
      requireCardPayment
    )
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
    if (!validateScreening()) return false
    return validateStep(3)
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
          gender: formData.gender,
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
          pregnantOrBreastfeeding:
            formData.protocol.pregnant === "yes" ||
            formData.protocol.breastfeeding === "yes" ||
            formData.protocol.pregnancyPlanned === "yes",
          mtcOrMen2History:
            formData.protocol.exclusions.includes("mtc") || formData.protocol.exclusions.includes("men2"),
          pancreatitisHistory: formData.protocol.exclusions.includes("pancreatitis"),
          type1Diabetes: formData.protocol.exclusions.includes("type1"),
          eatingDisorder: formData.protocol.exclusions.includes("eating-disorder"),
          onOtherGlp: formData.protocol.priorGlp4Weeks === "yes",
        },
        medicalHistory: {
          type2Diabetes: formData.protocol.exclusions.includes("type2-uncontrolled") ? "yes" : "no",
          hypertension: formData.hypertension,
          gallbladderDisease: formData.protocol.exclusions.includes("gallbladder") ? "yes" : "no",
          diabeticRetinopathy: formData.protocol.exclusions.includes("retinopathy") ? "yes" : "no",
          bariatricSurgery: formData.bariatricSurgery,
          sleepApnea: formData.sleepApnea,
          cardiovascularDisease: formData.protocol.exclusions.includes("heart-failure") ? "yes" : "no",
          currentMedications: formData.protocol.medications,
          allergies: formData.protocol.allergies,
        },
        protocol: formData.protocol,
        treatment: {
          selectedProgram: formData.selectedProgram,
          selectedBillingPlan: formData.selectedBillingPlan,
          selectedDoseTier: formData.selectedDoseTier,
          priorGlpExperience:
            formData.protocol.priorGlp4Weeks === "yes"
              ? `GLP-1 in the last 4 weeks. Last dose ${formData.protocol.lastDoseDate || "not dated"}.`
              : "No GLP-1 in the last 4 weeks",
          weightLossGoals: formData.weightLossGoals,
          comorbidities: formData.comorbidities,
          additionalConcerns: formData.protocol.concerns.join(", "),
        },
        visit: requiresSyncVisit(formData.state) ? selectedVisit(formData.visitSlotKey) : null,
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
            stripePaymentIntentId: requireCardPayment ? formData.stripePaymentIntentId : null,
            paymentAuthorized: requireCardPayment ? formData.paymentAuthorized : false,
          }),
        },
        consents: {
          authorizeHold: requireCardPayment ? formData.authorizeHold : false,
          acknowledgePayAtPharmacy: requireCardPayment ? false : formData.authorizeHold,
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
              <a href="tel:+12489876182">Call (248) 987-6182</a>
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
        steps={
          requireCardPayment
            ? [
                "You pay on this website before the intake is sent to the doctor",
                WEIGHT_LOSS_DOCTOR_REVIEW,
                "You'll receive an email with the decision. If treatment is not approved, you are refunded",
                WEIGHT_LOSS_PARTNER_FULFILLMENT,
              ]
            : [
                `Pay $${holdQuote?.totalBilled ?? ""} by Zelle to ${ZELLE_PAYMENT_EMAIL}. The payment shows as ${LEGAL_BUSINESS_NAME}. Put your name in the memo.`,
                "Your intake is sent after the payment arrives. If the name on the Zelle screen is different, call (248) 987-6182 and do not send the payment.",
                "A receipt comes from info@clearchoicepharmacy.com. If treatment is not approved, you are refunded.",
                WEIGHT_LOSS_DOCTOR_REVIEW,
                WEIGHT_LOSS_PARTNER_FULFILLMENT,
              ]
        }
      >
        <p className="text-sm text-muted-foreground">
          {requireCardPayment
            ? "Thank you for completing your weight loss intake. A licensed doctor reviews it, and a partner pharmacy ships the medication if treatment is approved."
            : `Thank you for completing your weight loss intake. Pay $${holdQuote?.totalBilled ?? ""} by Zelle to ${ZELLE_PAYMENT_EMAIL}. The payment shows as ${LEGAL_BUSINESS_NAME}, the legal name of Clear Choice Pharmacy.`}
        </p>
      </IntakeSuccessPanel>
    )
  }

  return (
    <div className="space-y-6">
      <IntakePhysicianCallNotice national />
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
                onClick={() => {
                  updateFormData("selectedProgram", program.id)
                  const defaultDose = getDefaultWeightLossDoseId(program.id)
                  setFormData((prev) => ({
                    ...prev,
                    selectedProgram: program.id,
                    selectedDoseTier: getWeightLossDose(program, prev.selectedDoseTier)
                      ? prev.selectedDoseTier
                      : defaultDose,
                  }))
                }}
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
                    onValueChange={(v) => {
                      const defaultDose = getDefaultWeightLossDoseId(v)
                      setFormData((prev) => ({
                        ...prev,
                        selectedProgram: v,
                        selectedDoseTier: getWeightLossDose(v, prev.selectedDoseTier)
                          ? prev.selectedDoseTier
                          : defaultDose,
                      }))
                    }}
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
              <div className="pt-4 border-t space-y-4">
                <div className="rounded-xl border-2 border-primary bg-primary/5 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Label className="text-base font-bold text-foreground">
                        {WEIGHT_LOSS_DOSE_SELECT_TITLE} *
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">{WEIGHT_LOSS_DOSE_SELECT_HINT}</p>
                    </div>
                    <span className="shrink-0 rounded-md bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                      Required
                    </span>
                  </div>
                  <Select
                    value={formData.selectedDoseTier}
                    onValueChange={(v) => updateFormData("selectedDoseTier", v)}
                  >
                    <SelectTrigger className="w-full h-12 text-base font-medium border-primary/40 bg-background">
                      <SelectValue placeholder="Select weekly injection amount" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProgram.doses.map((dose) => (
                        <SelectItem key={dose.id} value={dose.id}>
                          {formatDoseOptionLabel(dose, formData.selectedBillingPlan)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedTierMeta && (
                    <p className="text-sm font-medium text-foreground">
                      {formatSelectedDoseSummary(selectedTierMeta, formData.selectedBillingPlan)}
                      <span className="font-normal text-muted-foreground"> · {selectedTierMeta.detail}</span>
                    </p>
                  )}
                </div>
                <div>
                  <Label className="mb-3 block">2. Billing preference</Label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {selectedProgram.billingPlans.map((option) => {
                      const quote = getWeightLossIntakeHoldQuote(
                        selectedProgram,
                        option.plan,
                        formData.selectedDoseTier
                      )
                      return (
                        <button
                          key={option.plan}
                          type="button"
                          onClick={() => updateFormData("selectedBillingPlan", option.plan)}
                          className={`rounded-lg border p-4 text-left ${
                            formData.selectedBillingPlan === option.plan ? "border-primary bg-primary/5" : ""
                          }`}
                        >
                          <p className="font-medium">
                            {option.plan === "monthly" ? "Monthly" : "90-day (3-kit)"}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatKitBillingLabel(option.plan)}</p>
                          {quote && (
                            <p className="text-2xl font-bold mt-2">
                              ${quote.kitPrice}
                              <span className="text-sm font-normal text-muted-foreground">
                                {" "}
                                {formatKitPriceCaption(selectedTierMeta?.label ?? "selected")}
                              </span>
                            </p>
                          )}
                          {option.badge && <span className="text-xs text-primary">{option.badge}</span>}
                          {option.plan === "quarterly" && (
                            <p className="text-xs text-muted-foreground mt-1">Live visit $25 add-on waived</p>
                          )}
                          {option.plan === "monthly" && quote && quote.liveVisitAddon > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              +${quote.liveVisitAddon} if live visit required
                            </p>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <WeightLossDoseTierPricing
                  program={selectedProgram}
                  billingPlan={formData.selectedBillingPlan}
                  compact
                  selectedTierId={formData.selectedDoseTier}
                />
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
            {programPrefilled && selectedProgram && holdQuote && (
              <div className="space-y-4">
                <IntakeOrderSummary
                  productName={selectedProgram.name}
                  productSubtitle={`${selectedProgram.subtitle} · ${selectedTierMeta?.label ?? "Selected"}`}
                  billingLabel={formData.selectedBillingPlan === "monthly" ? "Monthly" : "90-day (3-kit)"}
                  priceLine={
                    requireCardPayment
                      ? `Kit: $${holdQuote.totalBilled} · card hold, charged only if approved`
                      : `Kit: $${holdQuote.totalBilled} · pay by Zelle after you submit`
                  }
                  paymentNote={
                    requireCardPayment
                      ? "Prescription required after clinician review. Payment is authorized as a hold and captured only if approved."
                      : `Prescription required after clinician review. Pay $${holdQuote.totalBilled} by Zelle at ${ZELLE_PAYMENT_EMAIL} after you submit. The payment shows as ${LEGAL_BUSINESS_NAME}.`
                  }
                  changeHref="/weight-loss#programs"
                />
                <div className="space-y-2 rounded-xl border-2 border-primary bg-primary/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <Label className="text-base font-bold text-foreground">Confirm your dose</Label>
                    <span className="shrink-0 rounded-md bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                      Required
                    </span>
                  </div>
                  <Select
                    value={formData.selectedDoseTier}
                    onValueChange={(v) => updateFormData("selectedDoseTier", v)}
                  >
                    <SelectTrigger className="w-full h-12 text-base font-medium border-primary/40 bg-background">
                      <SelectValue placeholder="Select weekly injection amount" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProgram.doses.map((dose) => (
                        <SelectItem key={dose.id} value={dose.id}>
                          {formatDoseOptionLabel(dose, formData.selectedBillingPlan)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {suggestedDoseTier && suggestedDoseTier !== formData.selectedDoseTier && (
                    <div className="mt-1 rounded-md border border-amber-200 bg-amber-50/60 p-3 text-sm">
                      <p className="text-amber-950">
                        Based on your reported dose,{" "}
                        <span className="font-medium">
                          {getWeightLossDose(selectedProgram, suggestedDoseTier)?.label ?? suggestedDoseTier}
                        </span>{" "}
                        may be a better match.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => updateFormData("selectedDoseTier", suggestedDoseTier)}
                      >
                        Switch to {getWeightLossDose(selectedProgram, suggestedDoseTier)?.label ?? suggestedDoseTier}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
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
                <Input id="phone" type="tel" className={cn(isFieldInvalid("phone") && "border-destructive ring-2 ring-destructive")} value={formData.phone} onChange={(e) => updateFormData("phone", formatPhoneInput(e.target.value))} />
              </div>
              <div className="space-y-2" data-field="dateOfBirth">
                <Label htmlFor="dob" className={cn(isFieldInvalid("dateOfBirth") && "text-destructive")}>Date of birth *</Label>
                <Input id="dob" type="date" className={cn(isFieldInvalid("dateOfBirth") && "border-destructive ring-2 ring-destructive")} value={formData.dateOfBirth} onChange={(e) => updateFormData("dateOfBirth", e.target.value)} />
              </div>
              <div className="space-y-2" data-field="gender">
                <Label htmlFor="wl-gender" className={cn(isFieldInvalid("gender") && "text-destructive")}>Sex assigned at birth *</Label>
                <Select value={formData.gender || undefined} onValueChange={(value) => updateFormData("gender", value as FormData["gender"])}>
                  <SelectTrigger id="wl-gender" className={cn(isFieldInvalid("gender") && "border-destructive ring-2 ring-destructive")}>
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2" data-field="state">
                <Label htmlFor="wl-state" className={cn(isFieldInvalid("state") && "text-destructive")}>State *</Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, state: value, visitSlotKey: "" }))
                    clearFieldError("state")
                    clearFieldError("visitSlot")
                  }}
                >
                  <SelectTrigger id="wl-state" className={cn(isFieldInvalid("state") && "border-destructive ring-2 ring-destructive")}>
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((state) => (
                      <SelectItem key={state.code} value={state.name}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {requiresSyncVisit(formData.state) && (
              <div className="space-y-2" data-field="visitSlot">
                <Label htmlFor="wl-visit" className={cn(isFieldInvalid("visitSlot") && "text-destructive")}>
                  Video visit time *
                </Label>
                <Select
                  value={formData.visitSlotKey || undefined}
                  onValueChange={(value) => updateFormData("visitSlotKey", value)}
                  disabled={visitTimesStatus === "loading" || visitSlots.length === 0}
                >
                  <SelectTrigger id="wl-visit" className={cn(isFieldInvalid("visitSlot") && "border-destructive ring-2 ring-destructive")}>
                    <SelectValue placeholder={visitTimesStatus === "loading" ? "Loading times…" : "Choose a time"} />
                  </SelectTrigger>
                  <SelectContent>
                    {visitSlots.map((slot) => {
                      const key = `${slot.scheduleStart}||${slot.scheduleEnd}||${slot.providerGuid}`
                      return (
                        <SelectItem key={key} value={key}>
                          {formatVisitSlot(slot.scheduleStart)}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {visitTimesMessage || "This state requires a live video visit before a doctor can review your intake."}
                </p>
              </div>
            )}

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
                  {bmiBand(bmi) === "standard" && " — eligible for the standard dosing protocol."}
                  {bmiBand(bmi) === "micro" && " — eligible for the microdosing protocol only."}
                  {bmiBand(bmi) === "ineligible" && " — a BMI under 20 is not eligible for this program."}
                </AlertDescription>
              </Alert>
            )}

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
            <CardTitle>Clinical questionnaire</CardTitle>
            <CardDescription>
              These questions follow the GLP-1 prescribing protocol. A clinician licensed in your state uses them to decide whether treatment is appropriate.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Glp1ProtocolQuestions
              answers={formData.protocol}
              sex={formData.gender}
              threeMonth={formData.selectedBillingPlan === "quarterly"}
              invalidFields={fieldErrors}
              onChange={(protocol) => {
                setFormData((prev) => ({ ...prev, protocol }))
                setFieldErrors(new Set())
                setError("")
              }}
            />
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
            <CardTitle>Identity &amp; Consent</CardTitle>
            <CardDescription>
              {requireCardPayment
                ? "Verify your photo ID and pay on this website. A licensed doctor reviews your intake, usually within 24 hours."
                : "Verify your photo ID, then pay by Zelle after you submit. A licensed doctor reviews your intake after payment arrives, usually within 24 hours."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedProgram && holdQuote ? (
                <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-2">
                  <p className="font-semibold">{selectedProgram.name}</p>
                  <p className="text-muted-foreground">
                    {selectedProgram.subtitle} · {selectedTierMeta?.label ?? "Selected"}
                  </p>
                  <p className="text-lg font-bold text-primary mt-2">
                    Kit total: ${holdQuote.totalBilled}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {requireCardPayment
                      ? "You pay this amount on this website. If a doctor does not approve treatment, you are refunded."
                      : `Pay this amount by Zelle to ${ZELLE_PAYMENT_EMAIL} after you submit. The payment shows as ${LEGAL_BUSINESS_NAME}. If a doctor does not approve treatment, you are refunded.`}
                    {holdQuote.liveVisitAddon > 0
                      ? ` A $${holdQuote.liveVisitAddon} live-visit add-on may be added on monthly billing if your clinician requires a live visit.`
                      : " The live-visit add-on is waived on a 90-day supply."}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formData.selectedBillingPlan === "monthly"
                      ? `First 30-day kit (4 weekly injections) · ${selectedTierMeta?.label ?? "selected"}`
                      : `First shipment — 2 kits, 4 injections each (60 days) · ${selectedTierMeta?.label ?? "selected"}`}
                  </p>
                  <p className="text-xs text-muted-foreground">{WEIGHT_LOSS_LIVE_VISIT_FEE_NOTE}</p>
                  <p className="text-xs text-muted-foreground">{weightLossPaymentPatientNote()}</p>
                </div>
              ) : null}

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2" data-field="address">
                <Label htmlFor="address" className={cn(isFieldInvalid("address") && "text-destructive")}>Street address *</Label>
                <Input id="address" className={cn(isFieldInvalid("address") && "border-destructive ring-2 ring-destructive")} value={formData.address} onChange={(e) => updateFormData("address", e.target.value)} />
              </div>
              <div className="space-y-2" data-field="city">
                <Label htmlFor="city" className={cn(isFieldInvalid("city") && "text-destructive")}>City *</Label>
                <Input id="city" className={cn(isFieldInvalid("city") && "border-destructive ring-2 ring-destructive")} value={formData.city} onChange={(e) => updateFormData("city", e.target.value)} />
              </div>
              <div className="space-y-2" data-field="zipCode">
                <Label htmlFor="zip" className={cn(isFieldInvalid("zipCode") && "text-destructive")}>ZIP code *</Label>
                <Input id="zip" className={cn(isFieldInvalid("zipCode") && "border-destructive ring-2 ring-destructive")} value={formData.zipCode} onChange={(e) => updateFormData("zipCode", e.target.value)} />
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
                  <Label htmlFor="wl-shipping-state" className={cn(isFieldInvalid("shippingState") && "text-destructive")}>Shipping state *</Label>
                  <Select value={formData.shippingState} onValueChange={(value) => updateFormData("shippingState", value)}>
                    <SelectTrigger id="wl-shipping-state" className={cn(isFieldInvalid("shippingState") && "border-destructive ring-2 ring-destructive")}>
                      <SelectValue placeholder="Select shipping state" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map((state) => (
                        <SelectItem key={state.code} value={state.name}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              totalBilled={holdQuote?.totalBilled ?? 0}
              invalidFields={fieldErrors}
              showPayment={requireCardPayment}
            />

            <InjectionTelehealthConsents
              idPrefix="glp1"
              variant="weight-loss"
              programId={formData.selectedProgram}
              values={formData.injectionConsents}
              onChange={updateInjectionConsent}
              invalidFields={fieldErrors}
              showHowToInjectLink={false}
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
                  className={cn(
                    "font-normal cursor-pointer leading-snug",
                    isFieldInvalid("authorizeHold") && "text-destructive"
                  )}
                >
                  {requireCardPayment ? (
                    <>
                      I agree to pay <strong>${holdQuote?.totalBilled ?? 0}</strong> on this website for my{" "}
                      {selectedTierMeta?.label ?? "selected"} kit(s). This amount is charged only if a doctor approves
                      treatment. If treatment is not approved, I am refunded. *
                    </>
                  ) : (
                    <>
                      I will pay <strong>${holdQuote?.totalBilled ?? 0}</strong> by Zelle to {ZELLE_PAYMENT_EMAIL} after
                      I submit, for my {selectedTierMeta?.label ?? "selected"} kit(s). The payment will show as{" "}
                      {LEGAL_BUSINESS_NAME}, the legal name of Clear Choice Pharmacy. If treatment is not approved, I
                      will be refunded. *
                    </>
                  )}
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">{weightLossPaymentPatientNote()}</p>
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
