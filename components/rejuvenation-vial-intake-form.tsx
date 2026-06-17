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
import { getRejuvenationVial } from "@/lib/rejuvenation-vial-catalog"

const states = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
  "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico",
  "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
  "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
]

type RejuvenationVialIntakeFormProps = {
  vialId: string
}

export function RejuvenationVialIntakeForm({ vialId }: RejuvenationVialIntakeFormProps) {
  const router = useRouter()
  const selectedVial = getRejuvenationVial(vialId)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [shippingAddress, setShippingAddress] = useState("")
  const [shippingCity, setShippingCity] = useState("")
  const [shippingState, setShippingState] = useState("Michigan")
  const [shippingZip, setShippingZip] = useState("")
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
    if (!shippingAddress) invalid.add("shippingAddress")
    if (!shippingCity) invalid.add("shippingCity")
    if (!shippingState) invalid.add("shippingState")
    if (!shippingZip) invalid.add("shippingZip")
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
    if (!selectedVial) return
    if (!validate()) return

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/submit-rejuvenation-vial-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          shippingAddress,
          shippingCity,
          shippingState,
          shippingZip,
          selectedVial: vialId,
          selectedVialTitle: selectedVial.title,
          kitPrice: selectedVial.price,
          allergies,
          currentMedications,
          kidneyDisease,
          heartCondition,
          pregnantOrBreastfeeding,
          additionalNotes,
          agreeToTerms,
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
      setError(err instanceof Error ? err.message : "Failed to submit intake. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!selectedVial) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground mb-4">No vial kit selected. Please choose a rejuvenation vial first.</p>
          <Button asChild>
            <Link href="/iv-rejuvenation#vial-menu">View Vial Menu</Link>
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
            Thank you! A licensed telehealth provider will review your screening. If approved, your{" "}
            <strong className="text-slate-900">{selectedVial.title}</strong> will be compounded at{" "}
            <strong className="text-slate-900">Clear Choice Pharmacy</strong> and shipped to your address.
          </p>
          <ol className="text-sm space-y-2 list-decimal list-inside">
            <li>Provider review (typically 2–4 business hours)</li>
            <li>Prescription received at Clear Choice Pharmacy</li>
            <li>Homekit shipped with supplies and injection instructions</li>
          </ol>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => router.push("/iv-rejuvenation")}>
            Back to IV &amp; Rejuvenation
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
            <li>Your 30-day home injection kit is shipped to your door</li>
          </ol>
        </CardContent>
      </Card>

      <Card className="border-sky-200 bg-sky-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Your Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <span className="font-medium text-slate-900">{selectedVial.title}</span>
            <span className="font-bold text-sky-600">${selectedVial.price}</span>
          </div>
          <p className="text-slate-600">{selectedVial.supply} · {selectedVial.route}</p>
          {selectedVial.shippingNote && (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
              {selectedVial.shippingNote}
            </p>
          )}
          <p className="text-xs text-slate-500 pt-1">
            Includes syringes, alcohol pads, and physician telehealth review. Shipping included.
          </p>
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
          <CardTitle>Shipping Address</CardTitle>
          <CardDescription>Where should we ship your home injection kit?</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2 sm:col-span-2" data-field="shippingAddress">
            <Label className={cn(isInvalid("shippingAddress") && "text-destructive")}>Street address *</Label>
            <Input className={cn(isInvalid("shippingAddress") && "border-destructive ring-2 ring-destructive")} value={shippingAddress} onChange={(e) => { setShippingAddress(e.target.value); clearError("shippingAddress") }} />
          </div>
          <div className="space-y-2" data-field="shippingCity">
            <Label className={cn(isInvalid("shippingCity") && "text-destructive")}>City *</Label>
            <Input className={cn(isInvalid("shippingCity") && "border-destructive ring-2 ring-destructive")} value={shippingCity} onChange={(e) => { setShippingCity(e.target.value); clearError("shippingCity") }} />
          </div>
          <div className="space-y-2" data-field="shippingState">
            <Label className={cn(isInvalid("shippingState") && "text-destructive")}>State *</Label>
            <select
              className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm", isInvalid("shippingState") && "border-destructive ring-2 ring-destructive")}
              value={shippingState}
              onChange={(e) => { setShippingState(e.target.value); clearError("shippingState") }}
            >
              {states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2" data-field="shippingZip">
            <Label className={cn(isInvalid("shippingZip") && "text-destructive")}>ZIP code *</Label>
            <Input className={cn(isInvalid("shippingZip") && "border-destructive ring-2 ring-destructive")} value={shippingZip} onChange={(e) => { setShippingZip(e.target.value); clearError("shippingZip") }} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Brief Health Screening</CardTitle>
          <CardDescription>Required before your kit can be shipped</CardDescription>
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
            <Label>Questions for the provider</Label>
            <Textarea value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)} placeholder="Prior injection experience, concerns, etc." />
          </div>
          <div
            data-field="agreeToTerms"
            className={cn("flex items-start space-x-2 rounded-md p-2 -mx-2", isInvalid("agreeToTerms") && "ring-2 ring-destructive bg-destructive/5")}
          >
            <Checkbox id="agree" checked={agreeToTerms} onCheckedChange={(c) => { setAgreeToTerms(c === true); clearError("agreeToTerms") }} />
            <Label htmlFor="agree" className={cn("font-normal cursor-pointer leading-snug", isInvalid("agreeToTerms") && "text-destructive")}>
              I agree to the Terms of Service and consent to telehealth screening before my kit is shipped *
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
