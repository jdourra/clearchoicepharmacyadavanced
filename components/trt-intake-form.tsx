"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Loader2, CheckCircle2, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { TRT_PROGRAMS, type TrtBillingPlan } from "@/lib/trt-catalog"

type FormData = {
  selectedProgram: string
  selectedBillingPlan: TrtBillingPlan
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
  symptoms: string[]
  treatmentGoals: string[]
  priorTrtExperience: string
  hasRecentLabs: string
  prostateCancer: boolean
  breastCancer: boolean
  polycythemia: boolean
  severeSleepApnea: boolean
  uncontrolledHeartFailure: boolean
  fertilityPriority: boolean
  confirmedNoContraindications: boolean
  hypertension: string
  sleepApnea: string
  cardiovascularDisease: string
  diabetes: string
  liverDisease: string
  kidneyDisease: string
  currentMedications: string
  allergies: string
  additionalConcerns: string
  shippingAddress: string
  shippingCity: string
  shippingState: string
  shippingZip: string
  sameAsResidential: boolean
  agreeToTerms: boolean
  agreeToTelehealth: boolean
  agreeToPrivacy: boolean
  authorizeHold: boolean
}

const initialFormData: FormData = {
  selectedProgram: "",
  selectedBillingPlan: "quarterly",
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
  symptoms: [],
  treatmentGoals: [],
  priorTrtExperience: "",
  hasRecentLabs: "",
  prostateCancer: false,
  breastCancer: false,
  polycythemia: false,
  severeSleepApnea: false,
  uncontrolledHeartFailure: false,
  fertilityPriority: false,
  confirmedNoContraindications: false,
  hypertension: "",
  sleepApnea: "",
  cardiovascularDisease: "",
  diabetes: "",
  liverDisease: "",
  kidneyDisease: "",
  currentMedications: "",
  allergies: "",
  additionalConcerns: "",
  shippingAddress: "",
  shippingCity: "",
  shippingState: "",
  shippingZip: "",
  sameAsResidential: true,
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
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
]

const symptomOptions = [
  "Low energy / fatigue",
  "Low libido",
  "Mood changes",
  "Muscle loss or weakness",
  "Increased body fat",
  "Poor sleep",
  "Brain fog",
  "Reduced motivation",
]

const goalOptions = [
  "Increase energy",
  "Improve libido",
  "Build muscle",
  "Improve mood",
  "Better sleep",
  "Overall hormone optimization",
]

function hasHardStopContraindication(formData: FormData) {
  return (
    formData.prostateCancer ||
    formData.breastCancer ||
    formData.polycythemia ||
    formData.severeSleepApnea ||
    formData.uncontrolledHeartFailure
  )
}

function toggleArrayItem(list: string[], item: string) {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item]
}

export function TrtIntakeForm() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [submissionId, setSubmissionId] = useState("")

  const updateFormData = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    setError("")
  }, [])

  const selectedProgram = TRT_PROGRAMS.find((p) => p.id === formData.selectedProgram)
  const currentPricing = selectedProgram?.pricing.find((p) => p.plan === formData.selectedBillingPlan)

  const handleSubmit = async () => {
    setSubmitting(true)
    setError("")
    try {
      const response = await fetch("/api/submit-trt-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
          },
          contraindications: {
            prostateCancer: formData.prostateCancer,
            breastCancer: formData.breastCancer,
            polycythemia: formData.polycythemia,
            severeSleepApnea: formData.severeSleepApnea,
            uncontrolledHeartFailure: formData.uncontrolledHeartFailure,
            fertilityPriority: formData.fertilityPriority,
          },
          medicalHistory: {
            hypertension: formData.hypertension,
            sleepApnea: formData.sleepApnea,
            cardiovascularDisease: formData.cardiovascularDisease,
            diabetes: formData.diabetes,
            liverDisease: formData.liverDisease,
            kidneyDisease: formData.kidneyDisease,
            currentMedications: formData.currentMedications,
            allergies: formData.allergies,
          },
          treatmentInfo: {
            selectedProgram: formData.selectedProgram,
            selectedBillingPlan: formData.selectedBillingPlan,
            symptoms: formData.symptoms,
            treatmentGoals: formData.treatmentGoals,
            priorTrtExperience: formData.priorTrtExperience,
            hasRecentLabs: formData.hasRecentLabs,
            additionalConcerns: formData.additionalConcerns,
          },
          identity: {
            shippingAddress: formData.sameAsResidential ? formData.address : formData.shippingAddress,
            shippingCity: formData.sameAsResidential ? formData.city : formData.shippingCity,
            shippingState: formData.sameAsResidential ? formData.state : formData.shippingState,
            shippingZip: formData.sameAsResidential ? formData.zipCode : formData.shippingZip,
          },
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || "Submission failed")
      }
      setSubmissionId(result.submissionId)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="pt-8 pb-8 text-center">
          <CheckCircle2 className="h-14 w-14 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Intake Submitted</h2>
          <p className="text-muted-foreground mb-4">
            A licensed provider will review your TRT intake. Reference: <span className="font-mono font-semibold">{submissionId}</span>
          </p>
          <Button asChild variant="outline">
            <Link href="/mens-health">Back to Men&apos;s Health</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className={cn("flex-1 h-1.5 rounded-full", step >= n ? "bg-primary" : "bg-muted")} />
        ))}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Unable to continue</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Choose your TRT program</CardTitle>
            <CardDescription>Transparent pricing includes physician review, medication, supplies, and shipping.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-2">
              {(["monthly", "quarterly"] as TrtBillingPlan[]).map((plan) => (
                <Button
                  key={plan}
                  type="button"
                  size="sm"
                  variant={formData.selectedBillingPlan === plan ? "default" : "outline"}
                  onClick={() => updateFormData("selectedBillingPlan", plan)}
                >
                  {plan === "monthly" ? "Monthly" : "Quarterly (save more)"}
                </Button>
              ))}
            </div>

            <div className="space-y-4">
              {TRT_PROGRAMS.map((program) => {
                const pricing = program.pricing.find((p) => p.plan === formData.selectedBillingPlan)!
                const selected = formData.selectedProgram === program.id
                return (
                  <button
                    key={program.id}
                    type="button"
                    onClick={() => updateFormData("selectedProgram", program.id)}
                    className={cn(
                      "w-full text-left rounded-xl border p-5 transition-all",
                      selected ? "border-primary ring-2 ring-primary/20 bg-primary/5" : "hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg">{program.name}</h3>
                          {program.highlight && <Badge variant="secondary">{program.highlight}</Badge>}
                          {pricing.badge && <Badge>{pricing.badge}</Badge>}
                        </div>
                        <p className="text-sm text-primary font-medium mt-1">{program.subtitle}</p>
                        <p className="text-sm text-muted-foreground mt-2">{program.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-3xl font-bold text-primary">${pricing.pricePerMonth}</p>
                        <p className="text-xs text-muted-foreground">/mo</p>
                        {formData.selectedBillingPlan === "quarterly" && (
                          <p className="text-xs text-muted-foreground mt-1">${pricing.totalBilled} billed quarterly</p>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button onClick={() => formData.selectedProgram ? setStep(2) : setError("Please select a TRT program.")}>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Your information & symptoms</CardTitle>
            <CardDescription>Tell us about yourself and what you&apos;re experiencing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First name</Label>
                <Input value={formData.firstName} onChange={(e) => updateFormData("firstName", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Last name</Label>
                <Input value={formData.lastName} onChange={(e) => updateFormData("lastName", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={formData.email} onChange={(e) => updateFormData("email", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input type="tel" value={formData.phone} onChange={(e) => updateFormData("phone", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Date of birth</Label>
                <Input type="date" value={formData.dateOfBirth} onChange={(e) => updateFormData("dateOfBirth", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.state}
                  onChange={(e) => updateFormData("state", e.target.value)}
                  required
                >
                  <option value="">Select state</option>
                  {states.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Systolic BP</Label>
                <Input value={formData.systolicBP} onChange={(e) => updateFormData("systolicBP", e.target.value)} placeholder="120" />
              </div>
              <div className="space-y-2">
                <Label>Diastolic BP</Label>
                <Input value={formData.diastolicBP} onChange={(e) => updateFormData("diastolicBP", e.target.value)} placeholder="80" />
              </div>
              <div className="space-y-2">
                <Label>Heart rate</Label>
                <Input value={formData.heartRate} onChange={(e) => updateFormData("heartRate", e.target.value)} placeholder="72" />
              </div>
            </div>

            <div>
              <Label className="mb-3 block">Symptoms you&apos;re experiencing</Label>
              <div className="grid sm:grid-cols-2 gap-2">
                {symptomOptions.map((symptom) => (
                  <label key={symptom} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={formData.symptoms.includes(symptom)}
                      onCheckedChange={() => updateFormData("symptoms", toggleArrayItem(formData.symptoms, symptom))}
                    />
                    {symptom}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-3 block">Treatment goals</Label>
              <div className="grid sm:grid-cols-2 gap-2">
                {goalOptions.map((goal) => (
                  <label key={goal} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={formData.treatmentGoals.includes(goal)}
                      onCheckedChange={() => updateFormData("treatmentGoals", toggleArrayItem(formData.treatmentGoals, goal))}
                    />
                    {goal}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Prior TRT or hormone therapy experience</Label>
              <RadioGroup value={formData.priorTrtExperience} onValueChange={(v) => updateFormData("priorTrtExperience", v)}>
                <div className="flex items-center space-x-2"><RadioGroupItem value="none" id="trt-none" /><Label htmlFor="trt-none" className="font-normal">No prior TRT</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="current" id="trt-current" /><Label htmlFor="trt-current" className="font-normal">Currently on TRT</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="past" id="trt-past" /><Label htmlFor="trt-past" className="font-normal">Used TRT in the past</Label></div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Do you have recent lab work (within 12 months)?</Label>
              <RadioGroup value={formData.hasRecentLabs} onValueChange={(v) => updateFormData("hasRecentLabs", v)}>
                <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="labs-yes" /><Label htmlFor="labs-yes" className="font-normal">Yes</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="labs-no" /><Label htmlFor="labs-no" className="font-normal">No — I need guidance on labs</Label></div>
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
            <Button
              onClick={() => {
                if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.dateOfBirth || !formData.state) {
                  setError("Please complete all required fields.")
                  return
                }
                if (formData.symptoms.length === 0) {
                  setError("Please select at least one symptom.")
                  return
                }
                setStep(3)
              }}
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Medical history & safety screening</CardTitle>
            <CardDescription>These questions help our physician determine if TRT is appropriate for you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3 rounded-lg border p-4">
              <p className="text-sm font-semibold">Contraindications — check all that apply</p>
              {[
                { key: "prostateCancer" as const, label: "Active or history of prostate cancer" },
                { key: "breastCancer" as const, label: "Male breast cancer" },
                { key: "polycythemia" as const, label: "Polycythemia (high red blood cell count)" },
                { key: "severeSleepApnea" as const, label: "Severe untreated sleep apnea" },
                { key: "uncontrolledHeartFailure" as const, label: "Uncontrolled heart failure" },
                { key: "fertilityPriority" as const, label: "Trying to conceive soon (fertility is a priority)" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-start gap-2 text-sm cursor-pointer">
                  <Checkbox checked={formData[key]} onCheckedChange={(c) => updateFormData(key, c === true)} />
                  {label}
                </label>
              ))}
              <label className="flex items-start gap-2 text-sm cursor-pointer pt-2 border-t">
                <Checkbox
                  checked={formData.confirmedNoContraindications}
                  onCheckedChange={(c) => updateFormData("confirmedNoContraindications", c === true)}
                />
                None of the serious contraindications above apply to me
              </label>
            </div>

            {hasHardStopContraindication(formData) && (
              <Alert variant="destructive">
                <AlertDescription>
                  Based on your responses, TRT may not be appropriate through this online program. Please consult an in-person specialist.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4">
              {[
                { key: "hypertension" as const, label: "High blood pressure?" },
                { key: "sleepApnea" as const, label: "Sleep apnea?" },
                { key: "cardiovascularDisease" as const, label: "Cardiovascular disease?" },
                { key: "diabetes" as const, label: "Diabetes?" },
                { key: "liverDisease" as const, label: "Liver disease?" },
                { key: "kidneyDisease" as const, label: "Kidney disease?" },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <Label>{label}</Label>
                  <RadioGroup value={formData[key]} onValueChange={(v) => updateFormData(key, v)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id={`${key}-yes`} /><Label htmlFor={`${key}-yes`} className="font-normal">Yes</Label></div>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="no" id={`${key}-no`} /><Label htmlFor={`${key}-no`} className="font-normal">No</Label></div>
                    </div>
                  </RadioGroup>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Current medications & supplements</Label>
              <Textarea value={formData.currentMedications} onChange={(e) => updateFormData("currentMedications", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Allergies</Label>
              <Textarea value={formData.allergies} onChange={(e) => updateFormData("allergies", e.target.value)} />
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
            <Button
              onClick={() => {
                if (hasHardStopContraindication(formData)) {
                  setError("TRT is not appropriate based on your contraindication responses.")
                  return
                }
                if (!hasHardStopContraindication(formData) && !formData.confirmedNoContraindications) {
                  setError('Please confirm that none of the serious contraindications apply, or check the items that do.')
                  return
                }
                const yesNoFields = ["hypertension", "sleepApnea", "cardiovascularDisease", "diabetes", "liverDisease", "kidneyDisease"] as const
                if (yesNoFields.some((f) => formData[f] !== "yes" && formData[f] !== "no")) {
                  setError("Please answer Yes or No for each medical history question.")
                  return
                }
                setStep(4)
              }}
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Shipping & consent</CardTitle>
            <CardDescription>Review your selection and authorize clinical review.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-1">
              <p className="font-semibold">{selectedProgram?.name}</p>
              <p className="text-muted-foreground">{selectedProgram?.subtitle}</p>
              <p className="text-lg font-bold text-primary mt-2">${currentPricing?.pricePerMonth}/mo</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label>Street address</Label>
                <Input value={formData.address} onChange={(e) => updateFormData("address", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={formData.city} onChange={(e) => updateFormData("city", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>ZIP code</Label>
                <Input value={formData.zipCode} onChange={(e) => updateFormData("zipCode", e.target.value)} />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={formData.sameAsResidential} onCheckedChange={(c) => updateFormData("sameAsResidential", c === true)} />
              Shipping address same as above
            </label>

            {[
              { key: "agreeToTerms" as const, label: "I agree to the Terms of Service" },
              { key: "agreeToTelehealth" as const, label: "I consent to telehealth evaluation for TRT" },
              { key: "agreeToPrivacy" as const, label: "I acknowledge the HIPAA Privacy Notice" },
              { key: "authorizeHold" as const, label: "I authorize a payment hold upon provider approval (no charge until approved)" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-start gap-2 text-sm cursor-pointer">
                <Checkbox checked={formData[key]} onCheckedChange={(c) => updateFormData(key, c === true)} />
                {label}
              </label>
            ))}
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={() => setStep(3)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
            <Button
              disabled={submitting}
              onClick={() => {
                if (!formData.address || !formData.city || !formData.zipCode) {
                  setError("Please complete your address.")
                  return
                }
                if (!formData.agreeToTerms || !formData.agreeToTelehealth || !formData.agreeToPrivacy || !formData.authorizeHold) {
                  setError("Please agree to all required consents.")
                  return
                }
                handleSubmit()
              }}
            >
              {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : "Submit TRT intake"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
