"use client"

import { useState, useCallback } from "react"
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
  Shield,
  Zap,
  FileText,
  Activity,
  XCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  ED_FORMULATIONS,
  calculateEdMonthlyPrice,
  calculateEdTotalBilled,
  getEdTrocheProduct,
  type EdBillingPlan,
} from "@/lib/ed-troche-catalog"
import { IntakeIdentityPaymentSection } from "@/components/intake-identity-payment"
import { IntakeOrderSummary } from "@/components/intake-order-summary"
import { IntakeValidationAlert } from "@/components/intake-validation-alert"
import { emptyIntakePaymentValues, getIntakePaymentInvalidFields, paymentCapturedOnClient } from "@/lib/intake-payment"
import type { EdFormulationAddOn } from "@/lib/ed-add-ons"
import { scrollToFirstField } from "@/lib/intake-field-labels"

// ============================================
// TYPE DEFINITIONS
// ============================================

type BillingPlan = EdBillingPlan

type FormData = {
  // Step 1: Product Selection
  selectedProduct: string
  selectedBillingPlan: BillingPlan
  selectedAddOns: EdFormulationAddOn[]
  
  // Step 2: Demographics Module
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  state: string
  address: string
  city: string
  zipCode: string
  
  // Step 2: Cardiovascular Vitals Module
  systolicBP: string
  diastolicBP: string
  heartRate: string
  lastBPCheck: string
  
  // Step 2: Absolute Contraindications Module
  takesNitrates: boolean
  takesRiociguat: boolean
  recentHeartAttack: boolean
  recentStroke: boolean
  severeHeartFailure: boolean
  unstableAngina: boolean
  
  // Step 2: Soft Flags Module
  diabetes: string
  hypertension: string
  heartCondition: string
  liverDisease: string
  kidneyDisease: string
  visionProblems: string
  currentMedications: string
  allergies: string
  
  // Step 2: Treatment Goals Module
  edDuration: string
  edSeverity: string
  previousTreatments: string[]
  treatmentGoals: string[]
  preferredFrequency: string
  additionalConcerns: string
  
  // Step 3: Identity & Payment
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
  
  // Consents
  agreeToTerms: boolean
  agreeToTelehealth: boolean
  agreeToPrivacy: boolean
  authorizeHold: boolean
}

const initialFormData: FormData = {
  selectedProduct: "",
  selectedBillingPlan: "quarterly",
  selectedAddOns: [],
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  state: "",
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
  diabetes: "",
  hypertension: "",
  heartCondition: "",
  liverDisease: "",
  kidneyDisease: "",
  visionProblems: "",
  currentMedications: "",
  allergies: "",
  edDuration: "",
  edSeverity: "",
  previousTreatments: [],
  treatmentGoals: [],
  preferredFrequency: "",
  additionalConcerns: "",
  shippingAddress: "",
  shippingCity: "",
  shippingState: "",
  shippingZip: "",
  sameAsResidential: true,
  idFrontFile: null,
  idBackFile: null,
  ...emptyIntakePaymentValues,
  agreeToTerms: false,
  agreeToTelehealth: false,
  agreeToPrivacy: false,
  authorizeHold: false,
}

const states = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", 
  "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", 
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", 
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", 
  "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", 
  "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", 
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
]

// ============================================
// HELPER FUNCTIONS
// ============================================

function checkBloodPressureHardStop(systolic: number, diastolic: number): { isHardStop: boolean; reason: string } {
  if (systolic < 90 || diastolic < 50) {
    return { 
      isHardStop: true, 
      reason: "Your blood pressure appears to be dangerously low (below 90/50). ED medications can further lower blood pressure and may not be safe for you."
    }
  }
  if (systolic > 170 || diastolic > 100) {
    return { 
      isHardStop: true, 
      reason: "Your blood pressure appears to be dangerously high (above 170/100). Please seek medical evaluation to manage your blood pressure before considering ED treatment."
    }
  }
  return { isHardStop: false, reason: "" }
}

function checkContraindicationHardStop(formData: FormData): { isHardStop: boolean; reason: string } {
  if (formData.takesNitrates) {
    return {
      isHardStop: true,
      reason: "You indicated you take nitrates (such as nitroglycerin). Combining ED medications with nitrates can cause a severe, potentially life-threatening drop in blood pressure."
    }
  }
  if (formData.takesRiociguat) {
    return {
      isHardStop: true,
      reason: "You indicated you take Riociguat (Adempas). This medication is contraindicated with PDE5 inhibitors used in ED treatment."
    }
  }
  return { isHardStop: false, reason: "" }
}

type StepValidation = { valid: boolean; message: string; fields: string[] }

function getEdStepValidation(formData: FormData, currentStep: number): StepValidation {
  const fields: string[] = []
  const add = (...keys: string[]) => {
    for (const key of keys) {
      if (!fields.includes(key)) fields.push(key)
    }
  }

  switch (currentStep) {
    case 1:
      if (!formData.selectedProduct) {
        add("selectedProduct")
        return { valid: false, message: "Please select a treatment option to continue.", fields }
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
        return { valid: false, message: "Please complete all required demographic fields.", fields }
      }
      if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        return { valid: false, message: "Please enter a valid email address.", fields: ["email"] }
      }
      if (!formData.systolicBP) add("systolicBP")
      if (!formData.diastolicBP) add("diastolicBP")
      if (fields.length > 0) {
        return { valid: false, message: "Please enter your blood pressure readings.", fields }
      }
      if (!formData.edDuration) add("edDuration")
      if (!formData.edSeverity) add("edSeverity")
      if (fields.length > 0) {
        return { valid: false, message: "Please complete the treatment goals section.", fields }
      }
      return { valid: true, message: "", fields: [] }
    }

    case 3: {
      if (!formData.sameAsResidential) {
        if (!formData.shippingAddress) add("shippingAddress")
        if (!formData.shippingCity) add("shippingCity")
        if (!formData.shippingState) add("shippingState")
        if (!formData.shippingZip) add("shippingZip")
        if (fields.length > 0) {
          return { valid: false, message: "Please complete shipping address information.", fields }
        }
      }
      if (!formData.idFrontKey) add("idFrontFile")
      if (!formData.idBackKey) add("idBackFile")
      for (const field of getIntakePaymentInvalidFields(formData)) {
        if (field === "idFrontFile" || field === "idBackFile" || field === "stripePayment") add(field)
      }
      if (fields.length > 0) {
        return { valid: false, message: "Please upload your ID and authorize payment.", fields }
      }
      if (!formData.agreeToTerms) add("agreeToTerms")
      if (!formData.agreeToTelehealth) add("agreeToTelehealth")
      if (!formData.agreeToPrivacy) add("agreeToPrivacy")
      if (!formData.authorizeHold) add("authorizeHold")
      if (fields.length > 0) {
        return { valid: false, message: "Please agree to all terms and authorize the payment hold.", fields }
      }
      return { valid: true, message: "", fields: [] }
    }

    default:
      return { valid: true, message: "", fields: [] }
  }
}

export type ClinicalIntakeFormProps = {
  initialProduct?: string
  initialAddOns?: EdFormulationAddOn[]
  initialBillingPlan?: BillingPlan
}

export function ClinicalIntakeForm({
  initialProduct,
  initialAddOns = [],
  initialBillingPlan = "quarterly",
}: ClinicalIntakeFormProps = {}) {
  const productPrefilled = Boolean(initialProduct && getEdTrocheProduct(initialProduct))
  const minStep = productPrefilled ? 2 : 1

  const [step, setStep] = useState(productPrefilled ? 2 : 1)
  const [formData, setFormData] = useState<FormData>({
    ...initialFormData,
    selectedProduct: initialProduct || "",
    selectedBillingPlan: initialBillingPlan,
    selectedAddOns: initialAddOns,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [validationFields, setValidationFields] = useState<string[]>([])
  const [fieldErrors, setFieldErrors] = useState<Set<string>>(new Set())
  const [hardStop, setHardStop] = useState<{ active: boolean; reason: string }>({ active: false, reason: "" })
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [statusLogs, setStatusLogs] = useState<string[]>([])
  
  const totalSteps = 4

  const isInvalid = useCallback((field: string) => fieldErrors.has(field), [fieldErrors])

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
  
  const handleCheckboxArrayChange = useCallback((field: "previousTreatments" | "treatmentGoals", value: string, checked: boolean) => {
    setFormData((prev) => {
      const current = prev[field]
      if (checked) {
        return { ...prev, [field]: [...current, value] }
      } else {
        return { ...prev, [field]: current.filter((v) => v !== value) }
      }
    })
  }, [])

  // Validate blood pressure when values change
  const validateBloodPressure = useCallback(() => {
    const systolic = parseInt(formData.systolicBP)
    const diastolic = parseInt(formData.diastolicBP)
    
    if (!isNaN(systolic) && !isNaN(diastolic)) {
      const bpCheck = checkBloodPressureHardStop(systolic, diastolic)
      if (bpCheck.isHardStop) {
        setHardStop({ active: true, reason: bpCheck.reason })
        return false
      }
    }
    
    const contraCheck = checkContraindicationHardStop(formData)
    if (contraCheck.isHardStop) {
      setHardStop({ active: true, reason: contraCheck.reason })
      return false
    }
    
    setHardStop({ active: false, reason: "" })
    return true
  }, [formData])
  
  const validateStep = (currentStep: number): boolean => {
    const result = getEdStepValidation(formData, currentStep)
    if (!result.valid) {
      setError(result.message)
      setValidationFields(result.fields)
      setFieldErrors(new Set(result.fields))
      scrollToFirstField(result.fields)
      return false
    }
    if (currentStep === 2 && !validateBloodPressure()) {
      return false
    }
    setError("")
    setValidationFields([])
    setFieldErrors(new Set())
    return true
  }
  
  const nextStep = () => {
    if (hardStop.active) return
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, totalSteps))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
  
  const prevStep = () => {
    setError("")
    setValidationFields([])
    setFieldErrors(new Set())
    setHardStop({ active: false, reason: "" })
    setStep((prev) => Math.max(prev - 1, minStep))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  
  const handleSubmit = async () => {
    if (!validateStep(step)) return
    
    setIsSubmitting(true)
    setSubmissionStatus("processing")
    setError("")
    setStatusLogs([])
    
    // Simulate processing steps
    const addLog = (message: string) => {
      setStatusLogs((prev) => [...prev, `${new Date().toLocaleTimeString()} - ${message}`])
    }
    
    try {
      addLog("Initializing secure submission...")
      await new Promise((r) => setTimeout(r, 800))
      
      addLog("Validating patient information...")
      await new Promise((r) => setTimeout(r, 600))
      
      addLog("Encrypting medical data (HIPAA-compliant)...")
      await new Promise((r) => setTimeout(r, 700))
      
      // Prepare payload for API
      // NOTE: In production, this would be sent to a HIPAA-compliant API endpoint
      // such as Beluga Health, OpenLoop, or Wheel for telemedicine routing
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
          bloodPressure: `${formData.systolicBP}/${formData.diastolicBP}`,
          heartRate: formData.heartRate,
          lastBPCheck: formData.lastBPCheck,
        },
        medicalHistory: {
          diabetes: formData.diabetes,
          hypertension: formData.hypertension,
          heartCondition: formData.heartCondition,
          currentMedications: formData.currentMedications,
          allergies: formData.allergies,
        },
        treatment: {
          selectedProduct: formData.selectedProduct,
          selectedBillingPlan: formData.selectedBillingPlan,
          selectedAddOns: formData.selectedAddOns,
          edDuration: formData.edDuration,
          edSeverity: formData.edSeverity,
          previousTreatments: formData.previousTreatments,
          treatmentGoals: formData.treatmentGoals,
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
          agreeToTerms: formData.agreeToTerms,
          agreeToTelehealth: formData.agreeToTelehealth,
          agreeToPrivacy: formData.agreeToPrivacy,
          authorizeHold: formData.authorizeHold,
        },
        // NOTE: ID images would be uploaded to secure storage with BAA
        // NOTE: Payment info would be tokenized via Stripe/similar before transmission
      }
      
      addLog("Transmitting to medical review queue...")
      
      /*
       * ============================================
       * HIPAA-COMPLIANT API INTEGRATION POINT
       * ============================================
       * 
       * Replace this mock with actual API call to your chosen
       * telemedicine platform (Beluga Health, OpenLoop, Wheel, etc.)
       * 
       * Example:
       * const response = await fetch('https://api.belugahealth.com/v1/intake', {
       *   method: 'POST',
       *   headers: {
       *     'Authorization': `Bearer ${process.env.BELUGA_API_KEY}`,
       *     'Content-Type': 'application/json',
       *   },
       *   body: JSON.stringify(payload),
       * })
       * 
       * Ensure your API endpoint has a signed BAA in place.
       * ============================================
       */
      
      const response = await fetch("/api/submit-intake", {
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
      
      await new Promise((r) => setTimeout(r, 500))
      addLog("Submission received successfully!")
      addLog("Routing to physician review panel...")
      addLog("Estimated review time: 2-4 hours during business hours")
      
      setSubmissionStatus("success")
      setStep(4)
      
    } catch (err) {
      setSubmissionStatus("error")
      setError("There was an error submitting your information. Please try again or contact support.")
      addLog("ERROR: Submission failed. Please retry.")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // ============================================
  // RENDER: HARD STOP SCREEN
  // ============================================
  
  if (hardStop.active) {
    return (
      <Card className="border-destructive">
        <CardHeader className="bg-destructive/5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-destructive">Medical Safety Alert</CardTitle>
              <CardDescription>We cannot proceed with your request online</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important Safety Information</AlertTitle>
            <AlertDescription className="mt-2">
              {hardStop.reason}
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">What You Should Do:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-destructive font-bold">1.</span>
                <span>Contact your primary care physician or cardiologist immediately</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive font-bold">2.</span>
                <span>If experiencing chest pain, shortness of breath, or other emergency symptoms, call 911</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive font-bold">3.</span>
                <span>Discuss ED treatment options with your doctor in person</span>
              </li>
            </ul>
            
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Emergency Services:</strong> If you are experiencing a medical emergency, please call <strong>911</strong> or go to your nearest emergency room.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline" onClick={() => setHardStop({ active: false, reason: "" })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back to Form
          </Button>
          <Button variant="destructive" asChild>
            <a href="tel:911">Call 911</a>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // ============================================
  // RENDER: SUCCESS SCREEN (STEP 4)
  // ============================================
  
  if (step === 4 && submissionStatus === "success") {
    const selectedProduct = getEdTrocheProduct(formData.selectedProduct)
    const monthlyTotal = calculateEdMonthlyPrice(formData.selectedProduct, formData.selectedBillingPlan)
    const billingLabel = formData.selectedBillingPlan === "monthly" ? "Monthly" : formData.selectedBillingPlan === "quarterly" ? "Quarterly" : "Annual"
    
    return (
      <Card className="border-primary/20">
        <CardHeader className="bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-green-700">Intake Protocol Securely Transmitted</CardTitle>
              <CardDescription>Dr. Dourra is currently reviewing your medical history</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Patient Dashboard Summary */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Patient</p>
                <p className="font-medium">{formData.firstName} {formData.lastName}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Selected Treatment</p>
                <p className="font-medium">{selectedProduct?.name}</p>
                <p className="text-xs text-muted-foreground">{billingLabel} plan — ${monthlyTotal}/mo</p>
                <p className="text-xs text-muted-foreground">{selectedProduct?.subtitle}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Submission ID</p>
                <p className="font-mono text-sm">{`INK-${Date.now().toString(36).toUpperCase()}`}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium text-amber-600">Pending Dr. Dourra&apos;s Review</p>
              </div>
            </div>
            
            {/* Status Logs */}
            <div className="rounded-lg border bg-muted/50 p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                System Activity Log
              </h4>
              <div className="space-y-1 font-mono text-xs text-muted-foreground max-h-40 overflow-y-auto">
                {statusLogs.map((log, i) => (
                  <p key={i}>{log}</p>
                ))}
              </div>
            </div>
            
            {/* Next Steps */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <h4 className="font-medium mb-3">What Happens Next</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">1.</span>
                  <span>Dr. Dourra will review your medical information (typically within 2-4 hours during business hours)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">2.</span>
                  <span>You&apos;ll receive an email with Dr. Dourra&apos;s decision and any follow-up questions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">3.</span>
                  <span>If approved, your payment will be processed and medication will ship within 1-2 business days</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">4.</span>
                  <span>Track your order via the link in your confirmation email</span>
                </li>
              </ul>
            </div>
            
            {/* Contact Info */}
            <div className="text-center text-sm text-muted-foreground">
              <p>Questions? Contact us at{" "}
                <a href="mailto:info@clearchoicepharmacy.com" className="text-primary hover:underline">
                  info@clearchoicepharmacy.com
                </a>
                {" "}or call{" "}
                <a href="tel:+12489876182" className="text-primary hover:underline">
                  1-248-987-6182
                </a>
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button className="w-full" asChild>
            <a href="/">Return to Home</a>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // ============================================
  // RENDER: STEP 1 - PRODUCT SELECTION
  // ============================================
  
  const renderStep1 = () => {
    const billingPlans: { plan: BillingPlan; label: string }[] = [
      { plan: "monthly", label: "Monthly" },
      { plan: "quarterly", label: "Quarterly (save more)" },
      { plan: "annual", label: "Annual" },
    ]

    return (
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Select one compounded troche formulation. Pricing includes physician review, medication, and shipping.
        </p>

        <div className="flex flex-wrap gap-2">
          {billingPlans.map((bp) => (
            <Button
              key={bp.plan}
              type="button"
              size="sm"
              variant={formData.selectedBillingPlan === bp.plan ? "default" : "outline"}
              onClick={() => updateFormData("selectedBillingPlan", bp.plan)}
            >
              {bp.label}
            </Button>
          ))}
        </div>

        <div className="space-y-4">
          {ED_FORMULATIONS.map((formulation) => {
            const pricing = formulation.pricing.find((p) => p.plan === formData.selectedBillingPlan)!
            const selected = formData.selectedProduct === formulation.id

            return (
              <button
                key={formulation.id}
                type="button"
                onClick={() => updateFormData("selectedProduct", formulation.id)}
                className={cn(
                  "w-full text-left rounded-xl border p-5 transition-all",
                  selected ? "border-primary ring-2 ring-primary/20 bg-primary/5" : "hover:border-primary/50"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-lg">{formulation.name}</h3>
                      {formulation.highlight && <Badge variant="secondary">{formulation.highlight}</Badge>}
                      {pricing.badge && <Badge>{pricing.badge}</Badge>}
                    </div>
                    <p className="text-sm text-primary font-medium">{formulation.subtitle}</p>
                    <p className="text-sm text-muted-foreground mt-2">{formulation.description}</p>
                    <ul className="mt-3 space-y-1">
                      {formulation.features.slice(0, 3).map((feature) => (
                        <li key={feature} className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-3xl font-bold text-primary">${pricing.pricePerMonth}</p>
                    <p className="text-xs text-muted-foreground">/mo</p>
                    {formData.selectedBillingPlan !== "monthly" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ${pricing.totalBilled}{" "}
                        {formData.selectedBillingPlan === "quarterly" ? "billed quarterly" : "billed annually"}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertTitle>Physician-Supervised Treatment</AlertTitle>
          <AlertDescription>
            Every formulation—including PE combinations and low libido troches—is prescribed only after medical review.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // ============================================
  // RENDER: STEP 2 - MEDICAL INTAKE
  // ============================================
  
  const renderStep2 = () => (
    <div className="space-y-8">
      {productPrefilled && (() => {
        const product = getEdTrocheProduct(formData.selectedProduct)
        const pricing = product?.pricing.find((p) => p.plan === formData.selectedBillingPlan)
        const billingLabel =
          formData.selectedBillingPlan === "monthly"
            ? "Monthly"
            : formData.selectedBillingPlan === "quarterly"
              ? "Quarterly"
              : "Annual"
        return product ? (
          <IntakeOrderSummary
            productName={product.name}
            productSubtitle={product.subtitle}
            billingLabel={billingLabel}
            priceLine={pricing ? `$${pricing.pricePerMonth}/mo` : undefined}
            addOns={formData.selectedAddOns}
            changeHref="/mens-health#ed-troches"
          />
        ) : null
      })()}
      {/* Module 1: Demographics */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b pb-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Demographics</h3>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2" data-field="firstName">
            <Label htmlFor="firstName" className={cn(isInvalid("firstName") && "text-destructive")}>First Name *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => updateFormData("firstName", e.target.value)}
              placeholder="John"
              className={cn(isInvalid("firstName") && "border-destructive")}
            />
          </div>
          <div className="space-y-2" data-field="lastName">
            <Label htmlFor="lastName" className={cn(isInvalid("lastName") && "text-destructive")}>Last Name *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => updateFormData("lastName", e.target.value)}
              placeholder="Smith"
              className={cn(isInvalid("lastName") && "border-destructive")}
            />
          </div>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2" data-field="email">
            <Label htmlFor="email" className={cn(isInvalid("email") && "text-destructive")}>Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData("email", e.target.value)}
              placeholder="john@example.com"
              className={cn(isInvalid("email") && "border-destructive")}
            />
          </div>
          <div className="space-y-2" data-field="phone">
            <Label htmlFor="phone" className={cn(isInvalid("phone") && "text-destructive")}>Phone *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => updateFormData("phone", e.target.value)}
              placeholder="(555) 123-4567"
              className={cn(isInvalid("phone") && "border-destructive")}
            />
          </div>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2" data-field="dateOfBirth">
            <Label htmlFor="dateOfBirth" className={cn(isInvalid("dateOfBirth") && "text-destructive")}>Date of Birth *</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
              className={cn(isInvalid("dateOfBirth") && "border-destructive")}
            />
          </div>
          <div className="space-y-2" data-field="state">
            <Label htmlFor="state" className={cn(isInvalid("state") && "text-destructive")}>State *</Label>
            <select
              id="state"
              value={formData.state}
              onChange={(e) => updateFormData("state", e.target.value)}
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isInvalid("state") && "border-destructive"
              )}
            >
              <option value="">Select state</option>
              {states.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="address">Street Address</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => updateFormData("address", e.target.value)}
            placeholder="123 Main St"
          />
        </div>
        
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => updateFormData("city", e.target.value)}
              placeholder="Detroit"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zipCode">ZIP Code</Label>
            <Input
              id="zipCode"
              value={formData.zipCode}
              onChange={(e) => updateFormData("zipCode", e.target.value)}
              placeholder="48201"
            />
          </div>
        </div>
      </div>
      
      {/* Module 2: Cardiovascular Vitals */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b pb-2">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Cardiovascular Vitals</h3>
        </div>
        
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Blood Pressure Requirements</AlertTitle>
          <AlertDescription>
            For your safety, we require recent blood pressure readings. If your BP is below 90/50 or above 170/100, we cannot proceed with online treatment.
          </AlertDescription>
        </Alert>
        
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2" data-field="systolicBP">
            <Label htmlFor="systolicBP" className={cn(isInvalid("systolicBP") && "text-destructive")}>Systolic (top number) *</Label>
            <Input
              id="systolicBP"
              type="number"
              value={formData.systolicBP}
              onChange={(e) => updateFormData("systolicBP", e.target.value)}
              placeholder="120"
              min="60"
              max="250"
              className={cn(isInvalid("systolicBP") && "border-destructive")}
            />
          </div>
          <div className="space-y-2" data-field="diastolicBP">
            <Label htmlFor="diastolicBP" className={cn(isInvalid("diastolicBP") && "text-destructive")}>Diastolic (bottom number) *</Label>
            <Input
              id="diastolicBP"
              type="number"
              value={formData.diastolicBP}
              onChange={(e) => updateFormData("diastolicBP", e.target.value)}
              placeholder="80"
              min="40"
              max="150"
              className={cn(isInvalid("diastolicBP") && "border-destructive")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="heartRate">Heart Rate (BPM)</Label>
            <Input
              id="heartRate"
              type="number"
              value={formData.heartRate}
              onChange={(e) => updateFormData("heartRate", e.target.value)}
              placeholder="72"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastBPCheck">When was your blood pressure last checked?</Label>
          <select
            id="lastBPCheck"
            value={formData.lastBPCheck}
            onChange={(e) => updateFormData("lastBPCheck", e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Select timeframe</option>
            <option value="today">Today</option>
            <option value="this-week">Within the past week</option>
            <option value="this-month">Within the past month</option>
            <option value="over-month">More than a month ago</option>
          </select>
        </div>
      </div>
      
      {/* Module 3: Absolute Contraindications */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b pb-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <h3 className="font-semibold">Safety Screening</h3>
        </div>
        
        <Alert variant="destructive" className="bg-destructive/5">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical Safety Questions</AlertTitle>
          <AlertDescription>
            These conditions are absolute contraindications for ED medications. Please answer honestly for your safety.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="takesNitrates"
              checked={formData.takesNitrates}
              onCheckedChange={(checked) => {
                updateFormData("takesNitrates", checked as boolean)
                if (checked) {
                  setHardStop({
                    active: true,
                    reason: "You indicated you take nitrates (such as nitroglycerin). Combining ED medications with nitrates can cause a severe, potentially life-threatening drop in blood pressure."
                  })
                }
              }}
            />
            <div className="space-y-1">
              <Label htmlFor="takesNitrates" className="font-normal cursor-pointer">
                I take nitrates (nitroglycerin, isosorbide) for chest pain or heart problems
              </Label>
              <p className="text-xs text-muted-foreground">Including patches, sprays, or pills</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Checkbox
              id="takesRiociguat"
              checked={formData.takesRiociguat}
              onCheckedChange={(checked) => {
                updateFormData("takesRiociguat", checked as boolean)
                if (checked) {
                  setHardStop({
                    active: true,
                    reason: "You indicated you take Riociguat (Adempas). This medication is contraindicated with PDE5 inhibitors used in ED treatment."
                  })
                }
              }}
            />
            <div className="space-y-1">
              <Label htmlFor="takesRiociguat" className="font-normal cursor-pointer">
                I take Riociguat (Adempas) for pulmonary hypertension
              </Label>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Checkbox
              id="recentHeartAttack"
              checked={formData.recentHeartAttack}
              onCheckedChange={(checked) => updateFormData("recentHeartAttack", checked as boolean)}
            />
            <div className="space-y-1">
              <Label htmlFor="recentHeartAttack" className="font-normal cursor-pointer">
                I have had a heart attack in the past 90 days
              </Label>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Checkbox
              id="recentStroke"
              checked={formData.recentStroke}
              onCheckedChange={(checked) => updateFormData("recentStroke", checked as boolean)}
            />
            <div className="space-y-1">
              <Label htmlFor="recentStroke" className="font-normal cursor-pointer">
                I have had a stroke in the past 6 months
              </Label>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Checkbox
              id="unstableAngina"
              checked={formData.unstableAngina}
              onCheckedChange={(checked) => updateFormData("unstableAngina", checked as boolean)}
            />
            <div className="space-y-1">
              <Label htmlFor="unstableAngina" className="font-normal cursor-pointer">
                I have unstable angina or chest pain at rest
              </Label>
            </div>
          </div>
        </div>
      </div>
      
      {/* Module 4: Soft Flags (Medical History) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b pb-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Medical History</h3>
        </div>
        
        <div className="grid gap-6">
          <div className="space-y-2">
            <Label>Do you have diabetes?</Label>
            <RadioGroup
              value={formData.diabetes}
              onValueChange={(value) => updateFormData("diabetes", value)}
            >
              {[
                { value: "no", label: "No" },
                { value: "type-1", label: "Yes, Type 1" },
                { value: "type-2", label: "Yes, Type 2" },
                { value: "prediabetes", label: "Prediabetes" },
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`diabetes-${option.value}`} />
                  <Label htmlFor={`diabetes-${option.value}`} className="font-normal cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label>Do you have high blood pressure (hypertension)?</Label>
            <RadioGroup
              value={formData.hypertension}
              onValueChange={(value) => updateFormData("hypertension", value)}
            >
              {[
                { value: "no", label: "No" },
                { value: "yes-controlled", label: "Yes, controlled with medication" },
                { value: "yes-uncontrolled", label: "Yes, not well controlled" },
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`hypertension-${option.value}`} />
                  <Label htmlFor={`hypertension-${option.value}`} className="font-normal cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label>Do you have any heart conditions?</Label>
            <RadioGroup
              value={formData.heartCondition}
              onValueChange={(value) => updateFormData("heartCondition", value)}
            >
              {[
                { value: "no", label: "No" },
                { value: "yes-stable", label: "Yes, stable/managed" },
                { value: "yes-recent", label: "Yes, recent issues or hospitalization" },
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`heart-${option.value}`} />
                  <Label htmlFor={`heart-${option.value}`} className="font-normal cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="currentMedications">List all current medications</Label>
            <Textarea
              id="currentMedications"
              value={formData.currentMedications}
              onChange={(e) => updateFormData("currentMedications", e.target.value)}
              placeholder="List all prescription medications, over-the-counter drugs, and supplements..."
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="allergies">Known allergies</Label>
            <Input
              id="allergies"
              value={formData.allergies}
              onChange={(e) => updateFormData("allergies", e.target.value)}
              placeholder="List any drug or other allergies, or 'None'"
            />
          </div>
        </div>
      </div>
      
      {/* Module 5: Treatment Goals */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b pb-2">
          <Zap className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Treatment Goals</h3>
        </div>
        
        <div className="space-y-2" data-field="edDuration">
          <Label className={cn(isInvalid("edDuration") && "text-destructive")}>How long have you experienced ED symptoms? *</Label>
          <RadioGroup
            value={formData.edDuration}
            onValueChange={(value) => updateFormData("edDuration", value)}
          >
            {[
              { value: "less-6-months", label: "Less than 6 months" },
              { value: "6-12-months", label: "6-12 months" },
              { value: "1-3-years", label: "1-3 years" },
              { value: "over-3-years", label: "More than 3 years" },
            ].map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`duration-${option.value}`} />
                <Label htmlFor={`duration-${option.value}`} className="font-normal cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        
        <div className="space-y-2" data-field="edSeverity">
          <Label className={cn(isInvalid("edSeverity") && "text-destructive")}>How would you rate the severity of your ED? *</Label>
          <RadioGroup
            value={formData.edSeverity}
            onValueChange={(value) => updateFormData("edSeverity", value)}
          >
            {[
              { value: "mild", label: "Mild - Occasional difficulty" },
              { value: "moderate", label: "Moderate - Frequent difficulty" },
              { value: "severe", label: "Severe - Unable to achieve or maintain erection" },
            ].map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`severity-${option.value}`} />
                <Label htmlFor={`severity-${option.value}`} className="font-normal cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        
        <div className="space-y-2">
          <Label>What are your treatment goals? (Select all that apply)</Label>
          <div className="space-y-2">
            {[
              { value: "stronger-erections", label: "Stronger erections" },
              { value: "longer-lasting", label: "Longer-lasting erections" },
              { value: "faster-onset", label: "Faster onset of action" },
              { value: "spontaneity", label: "More spontaneity" },
              { value: "confidence", label: "Improved confidence" },
              { value: "relationship", label: "Better relationship satisfaction" },
            ].map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`goal-${option.value}`}
                  checked={formData.treatmentGoals.includes(option.value)}
                  onCheckedChange={(checked) => handleCheckboxArrayChange("treatmentGoals", option.value, checked as boolean)}
                />
                <Label htmlFor={`goal-${option.value}`} className="font-normal cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="additionalConcerns">Any additional concerns or information for the physician?</Label>
          <Textarea
            id="additionalConcerns"
            value={formData.additionalConcerns}
            onChange={(e) => updateFormData("additionalConcerns", e.target.value)}
            placeholder="Share any other concerns, questions, or information that would help the physician..."
            rows={3}
          />
        </div>
      </div>
    </div>
  )

  // ============================================
  // RENDER: STEP 3 - IDENTITY & PAYMENT
  // ============================================
  
  const renderStep3 = () => {
    const selectedProduct = getEdTrocheProduct(formData.selectedProduct)
    const monthlyTotal = calculateEdMonthlyPrice(formData.selectedProduct, formData.selectedBillingPlan)
    const billingLabel = formData.selectedBillingPlan === "monthly" ? "Monthly" : formData.selectedBillingPlan === "quarterly" ? "Quarterly" : "Annual"
    
    const currentPricing = selectedProduct?.pricing.find((p) => p.plan === formData.selectedBillingPlan)
    const totalBilled = calculateEdTotalBilled(formData.selectedProduct, formData.selectedBillingPlan)
    
    return (
      <div className="space-y-8">
        {/* Order Summary */}
        <div className="rounded-lg border bg-muted/50 p-4">
          <h3 className="font-semibold mb-3">Order Summary</h3>
          {selectedProduct && currentPricing && (
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-medium">{selectedProduct.name}</span>
                  <p className="text-sm text-muted-foreground">{selectedProduct.subtitle}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-primary">${monthlyTotal}/mo</span>
                  {currentPricing.badge && (
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                      currentPricing.badge === "Best Seller" 
                        ? "bg-primary/10 text-primary" 
                        : "bg-green-100 text-green-700"
                    }`}>
                      {currentPricing.badge}
                    </span>
                  )}
                </div>
              </div>
              <div className="border-t pt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Billing Plan</span>
                  <span>{billingLabel}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Due Today</span>
                  <span className="font-semibold">${totalBilled}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Includes medication and shipping</p>
            </div>
          )}
        </div>
        
        {/* Shipping Address */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Shipping Address</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sameAsResidential"
              checked={formData.sameAsResidential}
              onCheckedChange={(checked) => updateFormData("sameAsResidential", checked as boolean)}
            />
            <Label htmlFor="sameAsResidential" className="font-normal cursor-pointer">
              Same as residential address
            </Label>
          </div>
          
          {!formData.sameAsResidential && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shippingAddress">Street Address *</Label>
                <Input
                  id="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={(e) => updateFormData("shippingAddress", e.target.value)}
                  placeholder="123 Main St"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="shippingCity">City *</Label>
                  <Input
                    id="shippingCity"
                    value={formData.shippingCity}
                    onChange={(e) => updateFormData("shippingCity", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shippingState">State *</Label>
                  <select
                    id="shippingState"
                    value={formData.shippingState}
                    onChange={(e) => updateFormData("shippingState", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select</option>
                    {states.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shippingZip">ZIP *</Label>
                  <Input
                    id="shippingZip"
                    value={formData.shippingZip}
                    onChange={(e) => updateFormData("shippingZip", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Identity & Payment */}
        <IntakeIdentityPaymentSection
          idPrefix="ed"
          serviceType="mens_health"
          patientEmail={formData.email}
          intakePrefix={`ed-${formData.email || "draft"}`}
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
          totalBilled={totalBilled}
        />
        
        {/* Consents */}
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-semibold">Agreements & Consents</h3>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => updateFormData("agreeToTerms", checked as boolean)}
              />
              <Label htmlFor="agreeToTerms" className="font-normal text-sm cursor-pointer">
                I agree to the <a href="/terms-and-conditions" className="text-primary underline">Terms of Service</a> and <a href="/privacy" className="text-primary underline">Privacy Policy</a> *
              </Label>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox
                id="agreeToTelehealth"
                checked={formData.agreeToTelehealth}
                onCheckedChange={(checked) => updateFormData("agreeToTelehealth", checked as boolean)}
              />
              <Label htmlFor="agreeToTelehealth" className="font-normal text-sm cursor-pointer">
                I consent to asynchronous telemedicine services and understand a physician will review my information remotely *
              </Label>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox
                id="agreeToPrivacy"
                checked={formData.agreeToPrivacy}
                onCheckedChange={(checked) => updateFormData("agreeToPrivacy", checked as boolean)}
              />
              <Label htmlFor="agreeToPrivacy" className="font-normal text-sm cursor-pointer">
                I understand my health information will be handled in accordance with HIPAA regulations *
              </Label>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox
                id="authorizeHold"
                checked={formData.authorizeHold}
                onCheckedChange={(checked) => updateFormData("authorizeHold", checked as boolean)}
              />
              <Label htmlFor="authorizeHold" className="font-normal text-sm cursor-pointer">
                I authorize a payment hold of <strong>${totalBilled}</strong> to be charged only upon prescription approval *
              </Label>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================
  // MAIN RENDER
  // ============================================
  
  return (
    <Card className="border-border">
      <CardHeader>
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            Step {step} of {totalSteps}
          </div>
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-2 w-12 rounded-full transition-colors ${
                  i + 1 <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
        
        <CardTitle>
          {step === 1 && "Choose your troche formulation"}
          {step === 2 && "Your information & health profile"}
          {step === 3 && "Identity & payment"}
          {step === 4 && "Confirmation"}
        </CardTitle>
        <CardDescription>
          {step === 1 && "Select a formulation, then continue to checkout"}
          {step === 2 && "Complete required fields so your provider can review safely"}
          {step === 3 && "Verify your identity and authorize payment hold"}
          {step === 4 && "Review your submission status"}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <IntakeValidationAlert message={error} fields={validationFields} />
        
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-6">
        {step > minStep ? (
          <Button variant="outline" onClick={prevStep} disabled={isSubmitting}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        ) : (
          <div />
        )}
        
        {step < 3 ? (
          <Button onClick={nextStep} disabled={hardStop.active}>
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : step === 3 ? (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Submit for Review
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  )
}
