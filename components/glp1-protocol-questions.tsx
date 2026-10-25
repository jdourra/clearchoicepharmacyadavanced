"use client"

import { useState, type ReactNode } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { prepareIdUploadFile } from "@/lib/prepare-id-upload"
import {
  COMPOUNDING_ACKNOWLEDGMENT,
  CONTRACEPTION_ACKNOWLEDGMENT,
  GLP1_ALCOHOL,
  GLP1_CONCERNS,
  GLP1_CONTRACEPTION,
  GLP1_DOSE_PREFERENCES,
  GLP1_EXCLUSIONS,
  GLP1_MEDICATION_ACKNOWLEDGMENT,
  OCP_ACKNOWLEDGMENT,
  PREVENTIVE_ACKNOWLEDGMENT,
  THYROID_ACKNOWLEDGMENT,
  WARFARIN_ACKNOWLEDGMENT,
  type DosePreference,
  type Glp1ProtocolAnswers,
  type YesNo,
} from "@/lib/glp1-intake-protocol"

type Props = {
  answers: Glp1ProtocolAnswers
  sex: string
  threeMonth: boolean
  invalidFields: Set<string>
  onChange: (next: Glp1ProtocolAnswers) => void
}

function Field({
  id,
  invalid,
  children,
}: {
  id: string
  invalid: boolean
  children: ReactNode
}) {
  return (
    <div
      data-field={id}
      className={cn("space-y-2 rounded-md", invalid && "ring-2 ring-destructive bg-destructive/5 p-3")}
    >
      {children}
    </div>
  )
}

function YesNo({
  id,
  label,
  value,
  invalid,
  onChange,
}: {
  id: string
  label: string
  value: YesNo
  invalid: boolean
  onChange: (value: YesNo) => void
}) {
  return (
    <Field id={id} invalid={invalid}>
      <Label className={cn(invalid && "text-destructive")}>{label}</Label>
      <RadioGroup value={value} onValueChange={(next) => onChange(next as YesNo)} className="flex gap-4">
        <div className="flex items-center gap-2">
          <RadioGroupItem value="yes" id={`${id}-yes`} />
          <Label htmlFor={`${id}-yes`} className="font-normal">Yes</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="no" id={`${id}-no`} />
          <Label htmlFor={`${id}-no`} className="font-normal">No</Label>
        </div>
      </RadioGroup>
    </Field>
  )
}

function DoseChoice({
  id,
  label,
  value,
  invalid,
  onChange,
}: {
  id: string
  label: string
  value: DosePreference
  invalid: boolean
  onChange: (value: DosePreference) => void
}) {
  return (
    <Field id={id} invalid={invalid}>
      <Label className={cn(invalid && "text-destructive")}>{label}</Label>
      <RadioGroup value={value} onValueChange={(next) => onChange(next as DosePreference)} className="space-y-2">
        {GLP1_DOSE_PREFERENCES.map((option) => (
          <div key={option.id} className="flex items-center gap-2">
            <RadioGroupItem value={option.id} id={`${id}-${option.id}`} />
            <Label htmlFor={`${id}-${option.id}`} className="font-normal">{option.label}</Label>
          </div>
        ))}
      </RadioGroup>
    </Field>
  )
}

export function Glp1ProtocolQuestions({ answers, sex, threeMonth, invalidFields, onChange }: Props) {
  const invalid = (id: string) => invalidFields.has(id)
  const patch = (partial: Partial<Glp1ProtocolAnswers>) => onChange({ ...answers, ...partial })
  const [uploadError, setUploadError] = useState("")
  const [uploading, setUploading] = useState(false)
  const needsContraceptionAck =
    answers.contraception === "Not using any contraception" ||
    answers.contraception === "Barrier method (condoms, sponges, diaphragm)"

  const uploadMedicationPhoto = async (file: File | null) => {
    if (!file) return
    setUploading(true)
    setUploadError("")
    try {
      const prepared = await prepareIdUploadFile(file)
      const body = new FormData()
      body.append("file", prepared)
      body.append("side", answers.medicationPhotoKeys.length % 2 === 0 ? "front" : "back")
      body.append("intakePrefix", `wl-med-${answers.medicationPhotoKeys.length + 1}`)
      const response = await fetch("/api/intake/upload-id", { method: "POST", body })
      const result = (await response.json().catch(() => ({}))) as { storageKey?: string; error?: string }
      if (!response.ok || !result.storageKey) throw new Error(result.error || "Upload failed")
      patch({ medicationPhotoKeys: [...answers.medicationPhotoKeys, result.storageKey] })
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-8">
      <YesNo
        id="telehealthConsent"
        label="Do you consent to a telehealth visit?"
        value={answers.telehealthConsent}
        invalid={invalid("telehealthConsent")}
        onChange={(telehealthConsent) => patch({ telehealthConsent })}
      />

      <Field id="exclusions" invalid={invalid("exclusions")}>
        <Label className={cn(invalid("exclusions") && "text-destructive")}>
          Do you currently have, or have you ever been diagnosed with, any of the following?
        </Label>
        <p className="text-sm text-muted-foreground">
          Any checked condition, other than None of the above, means this visit cannot continue online.
        </p>
        <div className="space-y-2">
          {GLP1_EXCLUSIONS.map((option) => (
            <div key={option.id} className="flex items-start gap-2">
              <Checkbox
                id={`ex-${option.id}`}
                checked={answers.exclusions.includes(option.id)}
                onCheckedChange={(checked) => {
                  const next = checked === true
                    ? [...answers.exclusions.filter((id) => (option.id === "none" ? false : id !== "none")), option.id]
                    : answers.exclusions.filter((id) => id !== option.id)
                  patch({ exclusions: option.id === "none" && checked === true ? ["none"] : next })
                }}
              />
              <Label htmlFor={`ex-${option.id}`} className="font-normal leading-snug">{option.label}</Label>
            </div>
          ))}
        </div>
      </Field>

      <YesNo
        id="substanceUse"
        label="Do you currently have an active substance use disorder involving drugs or alcohol, or are you in active treatment for one?"
        value={answers.substanceUse}
        invalid={invalid("substanceUse")}
        onChange={(substanceUse) => patch({ substanceUse })}
      />

      <Field id="alcohol" invalid={invalid("alcohol")}>
        <Label className={cn(invalid("alcohol") && "text-destructive")}>How often do you drink alcohol?</Label>
        <RadioGroup value={answers.alcohol} onValueChange={(alcohol) => patch({ alcohol })} className="space-y-2">
          {GLP1_ALCOHOL.map((option) => (
            <div key={option.id} className="flex items-center gap-2">
              <RadioGroupItem value={option.id} id={`alcohol-${option.id}`} />
              <Label htmlFor={`alcohol-${option.id}`} className="font-normal">{option.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </Field>

      <YesNo id="pregnant" label="Are you currently pregnant?" value={answers.pregnant} invalid={invalid("pregnant")} onChange={(pregnant) => patch({ pregnant })} />
      <YesNo id="breastfeeding" label="Are you currently breastfeeding or bottle-feeding with breast milk?" value={answers.breastfeeding} invalid={invalid("breastfeeding")} onChange={(breastfeeding) => patch({ breastfeeding })} />
      <YesNo id="pregnancyPlanned" label="Are you planning to become pregnant within the next 2 months?" value={answers.pregnancyPlanned} invalid={invalid("pregnancyPlanned")} onChange={(pregnancyPlanned) => patch({ pregnancyPlanned })} />

      <Field id="medications" invalid={invalid("medications")}>
        <Label htmlFor="protocol-meds" className={cn(invalid("medications") && "text-destructive")}>List all medications you currently take, including supplements.</Label>
        <Textarea id="protocol-meds" value={answers.medications} onChange={(event) => patch({ medications: event.target.value })} placeholder="List them, or write None" />
      </Field>
      <Field id="allergies" invalid={invalid("allergies")}>
        <Label htmlFor="protocol-allergies" className={cn(invalid("allergies") && "text-destructive")}>List any allergies (drug, food, or other).</Label>
        <Textarea id="protocol-allergies" value={answers.allergies} onChange={(event) => patch({ allergies: event.target.value })} placeholder="List them, or write None" />
      </Field>

      <YesNo id="oralContraceptive" label="Do you currently take an oral contraceptive (birth control pill)?" value={answers.oralContraceptive} invalid={invalid("oralContraceptive")} onChange={(oralContraceptive) => patch({ oralContraceptive, ocpAck: "" })} />
      {answers.oralContraceptive === "yes" && (
        <Field id="ocpAck" invalid={invalid("ocpAck")}>
          <p className="text-sm leading-relaxed">{OCP_ACKNOWLEDGMENT}</p>
          <RadioGroup value={answers.ocpAck} onValueChange={(ocpAck) => patch({ ocpAck: ocpAck as Glp1ProtocolAnswers["ocpAck"] })}>
            <div className="flex items-center gap-2"><RadioGroupItem value="ack" id="ocp-ack" /><Label htmlFor="ocp-ack" className="font-normal">I have read and understand this information</Label></div>
            <div className="flex items-center gap-2"><RadioGroupItem value="stop" id="ocp-stop" /><Label htmlFor="ocp-stop" className="font-normal">I do not wish to proceed at this time</Label></div>
          </RadioGroup>
        </Field>
      )}

      <YesNo id="thyroidMed" label="Do you currently take a thyroid hormone medication such as levothyroxine, Synthroid, Levoxyl, or Armour Thyroid?" value={answers.thyroidMed} invalid={invalid("thyroidMed")} onChange={(thyroidMed) => patch({ thyroidMed, thyroidAck: "" })} />
      {answers.thyroidMed === "yes" && (
        <Field id="thyroidAck" invalid={invalid("thyroidAck")}>
          <p className="text-sm leading-relaxed">{THYROID_ACKNOWLEDGMENT}</p>
          <RadioGroup value={answers.thyroidAck} onValueChange={(thyroidAck) => patch({ thyroidAck: thyroidAck as Glp1ProtocolAnswers["thyroidAck"] })}>
            <div className="flex items-center gap-2"><RadioGroupItem value="ack" id="thyroid-ack" /><Label htmlFor="thyroid-ack" className="font-normal">I have read and understand this information</Label></div>
            <div className="flex items-center gap-2"><RadioGroupItem value="stop" id="thyroid-stop" /><Label htmlFor="thyroid-stop" className="font-normal">I do not wish to proceed at this time</Label></div>
          </RadioGroup>
        </Field>
      )}

      <YesNo id="warfarin" label="Do you currently take warfarin (Coumadin)?" value={answers.warfarin} invalid={invalid("warfarin")} onChange={(warfarin) => patch({ warfarin, warfarinAck: "" })} />
      {answers.warfarin === "yes" && (
        <Field id="warfarinAck" invalid={invalid("warfarinAck")}>
          <p className="text-sm leading-relaxed">{WARFARIN_ACKNOWLEDGMENT}</p>
          <RadioGroup value={answers.warfarinAck} onValueChange={(warfarinAck) => patch({ warfarinAck: warfarinAck as Glp1ProtocolAnswers["warfarinAck"] })}>
            <div className="flex items-center gap-2"><RadioGroupItem value="ack" id="warfarin-ack" /><Label htmlFor="warfarin-ack" className="font-normal">I have read and understand this information</Label></div>
            <div className="flex items-center gap-2"><RadioGroupItem value="stop" id="warfarin-stop" /><Label htmlFor="warfarin-stop" className="font-normal">I do not wish to proceed at this time</Label></div>
          </RadioGroup>
        </Field>
      )}

      {sex === "female" && (
        <Field id="contraception" invalid={invalid("contraception") || invalid("contraceptionAck")}>
          <Label className={cn((invalid("contraception") || invalid("contraceptionAck")) && "text-destructive")}>What form of contraception are you currently using?</Label>
          <RadioGroup value={answers.contraception} onValueChange={(contraception) => patch({ contraception, contraceptionAck: false })} className="space-y-2">
            {GLP1_CONTRACEPTION.map((option) => (
              <div key={option} className="flex items-start gap-2">
                <RadioGroupItem value={option} id={`bc-${option}`} />
                <Label htmlFor={`bc-${option}`} className="font-normal leading-snug">{option}</Label>
              </div>
            ))}
          </RadioGroup>
          {needsContraceptionAck && (
            <div className="space-y-2 rounded-md border p-3">
              <p className="text-sm leading-relaxed">{CONTRACEPTION_ACKNOWLEDGMENT}</p>
              <div className="flex items-start gap-2">
                <Checkbox id="contraceptionAck" checked={answers.contraceptionAck} onCheckedChange={(checked) => patch({ contraceptionAck: checked === true })} />
                <Label htmlFor="contraceptionAck" className="font-normal">I have read and understand this information</Label>
              </div>
            </div>
          )}
        </Field>
      )}

      <Field id="concerns" invalid={invalid("concerns")}>
        <Label className={cn(invalid("concerns") && "text-destructive")}>Which of the following apply to you?</Label>
        <p className="text-sm text-muted-foreground">A compounded prescription needs at least one of these clinical concerns.</p>
        <div className="space-y-2">
          {GLP1_CONCERNS.map((option) => (
            <div key={option.id} className="flex items-start gap-2">
              <Checkbox
                id={`concern-${option.id}`}
                checked={answers.concerns.includes(option.id)}
                onCheckedChange={(checked) => {
                  const next = checked === true
                    ? [...answers.concerns.filter((id) => (option.id === "none" ? false : id !== "none")), option.id]
                    : answers.concerns.filter((id) => id !== option.id)
                  patch({ concerns: option.id === "none" && checked === true ? ["none"] : next })
                }}
              />
              <Label htmlFor={`concern-${option.id}`} className="font-normal leading-snug">{option.label}</Label>
            </div>
          ))}
        </div>
      </Field>

      <YesNo id="priorGlp4Weeks" label="Have you taken a GLP-1 medication in the last 4 weeks?" value={answers.priorGlp4Weeks} invalid={invalid("priorGlp4Weeks")} onChange={(priorGlp4Weeks) => patch({ priorGlp4Weeks })} />
      {answers.priorGlp4Weeks === "yes" && (
        <div className="space-y-4 rounded-lg border p-4">
          <Field id="medicationPhotoKeys" invalid={invalid("medicationPhotoKeys")}>
            <Label className={cn(invalid("medicationPhotoKeys") && "text-destructive")}>Upload photos of the medication label</Label>
            <p className="text-sm text-muted-foreground">The photo needs your name, medication name, dose, frequency, and the date it was last filled. The clinician may not continue your current dose if that information is not visible.</p>
            <Input type="file" accept="image/*,.pdf,.heic" disabled={uploading} onChange={(event) => uploadMedicationPhoto(event.target.files?.[0] || null)} />
            {answers.medicationPhotoKeys.length > 0 && <p className="text-sm">{answers.medicationPhotoKeys.length} photo{answers.medicationPhotoKeys.length === 1 ? "" : "s"} uploaded.</p>}
            {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}
          </Field>
          <Field id="lastDoseDate" invalid={invalid("lastDoseDate")}>
            <Label htmlFor="last-dose" className={cn(invalid("lastDoseDate") && "text-destructive")}>Date of your last dose</Label>
            <Input id="last-dose" type="date" value={answers.lastDoseDate} onChange={(event) => patch({ lastDoseDate: event.target.value })} />
          </Field>
          <YesNo id="takingAsPrescribed" label="Have you been taking this medication as prescribed?" value={answers.takingAsPrescribed} invalid={invalid("takingAsPrescribed")} onChange={(takingAsPrescribed) => patch({ takingAsPrescribed })} />
          {answers.takingAsPrescribed === "no" && (
            <Field id="takingAsPrescribedDetail" invalid={invalid("takingAsPrescribedDetail")}>
              <Label htmlFor="taking-detail">How have you been taking your medication?</Label>
              <Textarea id="taking-detail" value={answers.takingAsPrescribedDetail} onChange={(event) => patch({ takingAsPrescribedDetail: event.target.value })} />
            </Field>
          )}
        </div>
      )}

      {!threeMonth && answers.priorGlp4Weeks === "no" && (
        <p className="text-sm text-muted-foreground">This one-month prescription starts at the introductory dose. The clinician decides the dose that is prescribed.</p>
      )}
      {!threeMonth && answers.priorGlp4Weeks === "yes" && (
        <DoseChoice id="dosePreference" label="What dose do you prefer for this prescription? The clinician makes the final decision." value={answers.dosePreference} invalid={invalid("dosePreference")} onChange={(dosePreference) => patch({ dosePreference })} />
      )}
      {threeMonth && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Tell us your preference for the next three months. The clinician decides the dose for each month.</p>
          {answers.priorGlp4Weeks === "no" ? (
            <p className="text-sm">The first month starts at the introductory dose.</p>
          ) : answers.priorGlp4Weeks === "yes" ? (
            <DoseChoice id="month1Preference" label="After your current dose, what do you prefer for the first month?" value={answers.month1Preference} invalid={invalid("month1Preference")} onChange={(month1Preference) => patch({ month1Preference })} />
          ) : null}
          <DoseChoice id="month2Preference" label="What do you prefer for the second month?" value={answers.month2Preference} invalid={invalid("month2Preference")} onChange={(month2Preference) => patch({ month2Preference })} />
          <DoseChoice id="month3Preference" label="What do you prefer for the third month?" value={answers.month3Preference} invalid={invalid("month3Preference")} onChange={(month3Preference) => patch({ month3Preference })} />
        </div>
      )}

      <Field id="glpAck" invalid={invalid("glpAck")}>
        <Label className={cn(invalid("glpAck") && "text-destructive")}>GLP-1 medication acknowledgment</Label>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {GLP1_MEDICATION_ACKNOWLEDGMENT.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <RadioGroup value={answers.glpAck} onValueChange={(glpAck) => patch({ glpAck: glpAck as Glp1ProtocolAnswers["glpAck"] })}>
          <div className="flex items-center gap-2"><RadioGroupItem value="agree" id="glp-agree" /><Label htmlFor="glp-agree" className="font-normal">I agree and consent to treatment</Label></div>
          <div className="flex items-center gap-2"><RadioGroupItem value="decline" id="glp-decline" /><Label htmlFor="glp-decline" className="font-normal">I do not agree</Label></div>
        </RadioGroup>
      </Field>

      <Field id="compoundingAck" invalid={invalid("compoundingAck")}>
        <Label className={cn(invalid("compoundingAck") && "text-destructive")}>Compounded medication consent</Label>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {COMPOUNDING_ACKNOWLEDGMENT.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <RadioGroup value={answers.compoundingAck} onValueChange={(compoundingAck) => patch({ compoundingAck: compoundingAck as Glp1ProtocolAnswers["compoundingAck"] })}>
          <div className="flex items-center gap-2"><RadioGroupItem value="agree" id="cmp-agree" /><Label htmlFor="cmp-agree" className="font-normal">I acknowledge and consent to receiving compounded medication</Label></div>
          <div className="flex items-center gap-2"><RadioGroupItem value="decline" id="cmp-decline" /><Label htmlFor="cmp-decline" className="font-normal">I do not consent</Label></div>
        </RadioGroup>
      </Field>

      <Field id="preventiveAck" invalid={invalid("preventiveAck")}>
        <Label className={cn(invalid("preventiveAck") && "text-destructive")}>Preventive health screening</Label>
        <p className="text-sm leading-relaxed text-muted-foreground">{PREVENTIVE_ACKNOWLEDGMENT}</p>
        <RadioGroup value={answers.preventiveAck} onValueChange={(preventiveAck) => patch({ preventiveAck: preventiveAck as Glp1ProtocolAnswers["preventiveAck"] })}>
          <div className="flex items-center gap-2"><RadioGroupItem value="agree" id="prev-agree" /><Label htmlFor="prev-agree" className="font-normal">I acknowledge and agree</Label></div>
          <div className="flex items-center gap-2"><RadioGroupItem value="decline" id="prev-decline" /><Label htmlFor="prev-decline" className="font-normal">I do not agree</Label></div>
        </RadioGroup>
      </Field>
    </div>
  )
}
