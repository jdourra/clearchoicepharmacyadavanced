"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Loader2, AlertTriangle, Phone } from "lucide-react"
import { cn } from "@/lib/utils"
import { calculateIvTotal, getIvBoosters, getIvPackage, type IvBooster } from "@/lib/iv-catalog"

const TIME_WINDOWS = [
  { value: "asap", label: "ASAP — dispatch when available" },
  { value: "morning", label: "Morning (8am – 12pm)" },
  { value: "afternoon", label: "Afternoon (12pm – 5pm)" },
  { value: "evening", label: "Evening (5pm – 8pm)" },
]

const states = [
  "Michigan",
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
  "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Minnesota", "Mississippi",
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico",
  "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
  "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
]

type IvBookingFormProps = {
  packageId: string
  boosterIds: string[]
}

export function IvBookingForm({ packageId, boosterIds }: IvBookingFormProps) {
  const router = useRouter()
  const selectedPackage = getIvPackage(packageId)
  const selectedBoosters = getIvBoosters(boosterIds)
  const estimatedTotal = calculateIvTotal(packageId, boosterIds)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [serviceAddress, setServiceAddress] = useState("")
  const [serviceCity, setServiceCity] = useState("")
  const [serviceState, setServiceState] = useState("Michigan")
  const [serviceZip, setServiceZip] = useState("")
  const [preferredDate, setPreferredDate] = useState("")
  const [preferredTimeWindow, setPreferredTimeWindow] = useState("")
  const [allergies, setAllergies] = useState("")
  const [currentMedications, setCurrentMedications] = useState("")
  const [kidneyDisease, setKidneyDisease] = useState("")
  const [heartCondition, setHeartCondition] = useState("")
  const [pregnantOrBreastfeeding, setPregnantOrBreastfeeding] = useState(false)
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [agreeToTerms, setAgreeToTerms] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [submissionId, setSubmissionId] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Set<string>>(new Set())

  const isInvalid = useCallback((field: string) => fieldErrors.has(field), [fieldErrors])

  const validate = (): boolean => {
    const invalid = new Set<string>()
    if (!firstName) invalid.add("firstName")
    if (!lastName) invalid.add("lastName")
    if (!email) invalid.add("email")
    if (!phone) invalid.add("phone")
    if (!serviceAddress) invalid.add("serviceAddress")
    if (!serviceCity) invalid.add("serviceCity")
    if (!serviceState) invalid.add("serviceState")
    if (!serviceZip) invalid.add("serviceZip")
    if (!preferredTimeWindow) invalid.add("preferredTimeWindow")
    if (!kidneyDisease) invalid.add("kidneyDisease")
    if (!heartCondition) invalid.add("heartCondition")
    if (!agreeToTerms) invalid.add("agreeToTerms")
    if (email && !/^\S+@\S+\.\S+$/.test(email)) invalid.add("email")

    if (invalid.size > 0) {
      setFieldErrors(invalid)
      setError("Please complete all highlighted fields before submitting.")
      const first = [...invalid][0]
      document.querySelector(`[data-field="${first}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" })
      return false
    }

    setFieldErrors(new Set())
    setError("")
    return true
  }

  const clearError = (field: string) => {
    setFieldErrors((prev) => {
      if (!prev.has(field)) return prev
      const next = new Set(prev)
      next.delete(field)
      return next
    })
  }

  const handleSubmit = async () => {
    if (!selectedPackage) return
    if (!validate()) return

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/submit-iv-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          serviceAddress,
          serviceCity,
          serviceState,
          serviceZip,
          preferredDate,
          preferredTimeWindow,
          selectedPackage: packageId,
          selectedPackageTitle: selectedPackage.title,
          selectedBoosters: selectedBoosters.map((b) => b.name),
          estimatedTotal,
          allergies,
          currentMedications,
          kidneyDisease,
          heartCondition,
          pregnantOrBreastfeeding,
          additionalNotes,
          agreeToTerms,
          agreeToTelehealth: agreeToTerms,
        }),
      })

      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        if (result.hardStop) {
          setError(result.error)
          return
        }
        throw new Error(result.error || "Submission failed")
      }

      setSubmissionId(result.submissionId || "")
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit booking. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!selectedPackage) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground mb-4">No IV package selected. Please choose a drip first.</p>
          <Button asChild>
            <Link href="/iv-rejuvenation#iv-menu">View IV Menu</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (success) {
    return (
      <Card className="border-green-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            <div>
              <CardTitle>Intake Submitted — Pending Provider Review</CardTitle>
              <CardDescription>Reference: {submissionId}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            Thank you! A licensed telehealth provider will review your screening. If approved, your prescription
            will be sent to <strong className="text-slate-900">Clear Choice Pharmacy</strong> in Novi, MI to prepare
            your IV. Our team will then contact you to schedule mobile RN dispatch.
          </p>
          <ol className="text-sm space-y-2 list-decimal list-inside">
            <li>Provider review (typically 2–4 business hours)</li>
            <li>Prescription received at Clear Choice Pharmacy</li>
            <li>IV prepared and RN dispatch scheduled</li>
          </ol>
          <p className="text-sm">
            Need immediate assistance? Call{" "}
            <a href="tel:+12489876182" className="text-sky-600 font-medium hover:underline">
              1-248-987-6182
            </a>
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => router.push("/iv-rejuvenation")}>
            Back to IV Menu
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="pt-6 text-sm text-slate-600 space-y-2">
          <p className="font-medium text-slate-900">What happens next</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Licensed telehealth provider reviews your intake</li>
            <li>If approved, eRx is routed to Clear Choice Pharmacy (Michigan)</li>
            <li>Pharmacy prepares your IV → RN dispatched to your location</li>
          </ol>
        </CardContent>
      </Card>

      <Card className="border-sky-200 bg-sky-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Your Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <span className="font-medium text-slate-900">{selectedPackage.title}</span>
            <span className="font-bold text-sky-600">${selectedPackage.price}</span>
          </div>
          {selectedBoosters.map((b: IvBooster) => (
            <div key={b.id} className="flex justify-between gap-4 text-slate-600">
              <span>+ {b.name}</span>
              <span>${b.price}</span>
            </div>
          ))}
          <div className="flex justify-between gap-4 border-t border-sky-200 pt-2 font-semibold">
            <span>Estimated Total</span>
            <span className="text-sky-600">${estimatedTotal}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2" data-field="firstName">
            <Label className={cn(isInvalid("firstName") && "text-destructive")}>First name *</Label>
            <Input className={cn(isInvalid("firstName") && "border-destructive ring-2 ring-destructive")} value={firstName} onChange={(e) => { setFirstName(e.target.value); clearError("firstName") }} />
          </div>
          <div className="space-y-2" data-field="lastName">
            <Label className={cn(isInvalid("lastName") && "text-destructive")}>Last name *</Label>
            <Input className={cn(isInvalid("lastName") && "border-destructive ring-2 ring-destructive")} value={lastName} onChange={(e) => { setLastName(e.target.value); clearError("lastName") }} />
          </div>
          <div className="space-y-2" data-field="email">
            <Label className={cn(isInvalid("email") && "text-destructive")}>Email *</Label>
            <Input type="email" className={cn(isInvalid("email") && "border-destructive ring-2 ring-destructive")} value={email} onChange={(e) => { setEmail(e.target.value); clearError("email") }} />
          </div>
          <div className="space-y-2" data-field="phone">
            <Label className={cn(isInvalid("phone") && "text-destructive")}>Mobile phone *</Label>
            <Input type="tel" className={cn(isInvalid("phone") && "border-destructive ring-2 ring-destructive")} value={phone} onChange={(e) => { setPhone(e.target.value); clearError("phone") }} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mobile Dispatch Address</CardTitle>
          <CardDescription>Where should our licensed RN meet you?</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2 sm:col-span-2" data-field="serviceAddress">
            <Label className={cn(isInvalid("serviceAddress") && "text-destructive")}>Street address *</Label>
            <Input className={cn(isInvalid("serviceAddress") && "border-destructive ring-2 ring-destructive")} value={serviceAddress} onChange={(e) => { setServiceAddress(e.target.value); clearError("serviceAddress") }} />
          </div>
          <div className="space-y-2" data-field="serviceCity">
            <Label className={cn(isInvalid("serviceCity") && "text-destructive")}>City *</Label>
            <Input className={cn(isInvalid("serviceCity") && "border-destructive ring-2 ring-destructive")} value={serviceCity} onChange={(e) => { setServiceCity(e.target.value); clearError("serviceCity") }} />
          </div>
          <div className="space-y-2" data-field="serviceState">
            <Label className={cn(isInvalid("serviceState") && "text-destructive")}>State *</Label>
            <select
              className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm", isInvalid("serviceState") && "border-destructive ring-2 ring-destructive")}
              value={serviceState}
              onChange={(e) => { setServiceState(e.target.value); clearError("serviceState") }}
            >
              {states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2" data-field="serviceZip">
            <Label className={cn(isInvalid("serviceZip") && "text-destructive")}>ZIP code *</Label>
            <Input className={cn(isInvalid("serviceZip") && "border-destructive ring-2 ring-destructive")} value={serviceZip} onChange={(e) => { setServiceZip(e.target.value); clearError("serviceZip") }} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferred Appointment Time</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="preferredDate">Preferred date (optional)</Label>
            <Input id="preferredDate" type="date" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} min={new Date().toISOString().split("T")[0]} />
          </div>
          <div className="space-y-2" data-field="preferredTimeWindow">
            <Label className={cn(isInvalid("preferredTimeWindow") && "text-destructive")}>Time window *</Label>
            <RadioGroup value={preferredTimeWindow} onValueChange={(v) => { setPreferredTimeWindow(v); clearError("preferredTimeWindow") }}>
              {TIME_WINDOWS.map((tw) => (
                <div key={tw.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={tw.value} id={tw.value} />
                  <Label htmlFor={tw.value} className="font-normal cursor-pointer">{tw.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Brief Health Screening</CardTitle>
          <CardDescription>Required before RN dispatch</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2" data-field="kidneyDisease">
            <Label className={cn(isInvalid("kidneyDisease") && "text-destructive")}>Kidney disease? *</Label>
            <RadioGroup value={kidneyDisease} onValueChange={(v) => { setKidneyDisease(v); clearError("kidneyDisease") }} className="flex gap-4">
              <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="kidney-no" /><Label htmlFor="kidney-no" className="font-normal">No</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="kidney-yes" /><Label htmlFor="kidney-yes" className="font-normal">Yes</Label></div>
            </RadioGroup>
          </div>
          <div className="space-y-2" data-field="heartCondition">
            <Label className={cn(isInvalid("heartCondition") && "text-destructive")}>Heart condition? *</Label>
            <RadioGroup value={heartCondition} onValueChange={(v) => { setHeartCondition(v); clearError("heartCondition") }} className="flex gap-4">
              <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="heart-no" /><Label htmlFor="heart-no" className="font-normal">No</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="heart-yes" /><Label htmlFor="heart-yes" className="font-normal">Yes</Label></div>
            </RadioGroup>
          </div>
          <div className="flex items-start space-x-2">
            <Checkbox id="pregnant" checked={pregnantOrBreastfeeding} onCheckedChange={(c) => setPregnantOrBreastfeeding(c === true)} />
            <Label htmlFor="pregnant" className="font-normal cursor-pointer leading-snug">I am pregnant, planning pregnancy, or breastfeeding</Label>
          </div>
          <div className="space-y-2">
            <Label>Allergies</Label>
            <Textarea value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="List any allergies" />
          </div>
          <div className="space-y-2">
            <Label>Current medications</Label>
            <Textarea value={currentMedications} onChange={(e) => setCurrentMedications(e.target.value)} placeholder="List medications and supplements" />
          </div>
          <div className="space-y-2">
            <Label>Special instructions for the RN</Label>
            <Textarea value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)} placeholder="Gate code, parking, symptoms, etc." />
          </div>
          <div
            data-field="agreeToTerms"
            className={cn("flex items-start space-x-2 rounded-md p-2 -mx-2", isInvalid("agreeToTerms") && "ring-2 ring-destructive bg-destructive/5")}
          >
            <Checkbox id="agree" checked={agreeToTerms} onCheckedChange={(c) => { setAgreeToTerms(c === true); clearError("agreeToTerms") }} />
            <Label htmlFor="agree" className={cn("font-normal cursor-pointer leading-snug", isInvalid("agreeToTerms") && "text-destructive")}>
              I agree to the Terms of Service and consent to telehealth screening before IV administration *
            </Label>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <Button className="w-full bg-sky-500 hover:bg-sky-400" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
            ) : (
              "Submit for Provider Review"
            )}
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <a href="tel:+12489876182">
              <Phone className="mr-2 h-4 w-4" /> Prefer to call? 1-248-987-6182
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
