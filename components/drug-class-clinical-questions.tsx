"use client"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { RxDrugClass } from "@/lib/prescription-telemedicine"

type DrugClassClinicalQuestionsProps = {
  drugClasses: RxDrugClass[]
  answers: Record<string, string>
  onChange: (key: string, value: string) => void
}

const CLASS_LABELS: Record<RxDrugClass, string> = {
  cardiovascular: "Blood pressure / heart medication",
  cholesterol: "Cholesterol medication",
  thyroid: "Thyroid medication",
  diabetes: "Diabetes medication",
  antibiotic: "Antibiotic",
  mental_health: "Mental health medication",
  general: "Additional clinical questions",
}

function ClassBlock({
  drugClass,
  answers,
  onChange,
}: {
  drugClass: RxDrugClass
  answers: Record<string, string>
  onChange: (key: string, value: string) => void
}) {
  const prefix = drugClass

  if (drugClass === "cardiovascular") {
    return (
      <div className="space-y-3 rounded-lg border p-4">
        <p className="font-medium">{CLASS_LABELS.cardiovascular}</p>
        <div className="space-y-2">
          <Label>Most recent blood pressure reading (if known)</Label>
          <Textarea
            value={answers[`${prefix}-bp`] || ""}
            onChange={(e) => onChange(`${prefix}-bp`, e.target.value)}
            rows={2}
            placeholder="e.g. 128/82 at home last week"
          />
        </div>
        <div className="space-y-2">
          <Label>Dizziness, fainting, or swelling?</Label>
          <RadioGroup value={answers[`${prefix}-symptoms`] || ""} onValueChange={(v) => onChange(`${prefix}-symptoms`, v)}>
            {[
              ["no", "No"],
              ["yes", "Yes — describe in symptom notes"],
            ].map(([value, label]) => (
              <div key={value} className="flex items-center gap-2">
                <RadioGroupItem value={value} id={`${prefix}-sym-${value}`} />
                <Label htmlFor={`${prefix}-sym-${value}`} className="font-normal cursor-pointer">
                  {label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
    )
  }

  if (drugClass === "cholesterol") {
    return (
      <div className="space-y-3 rounded-lg border p-4">
        <p className="font-medium">{CLASS_LABELS.cholesterol}</p>
        <div className="space-y-2">
          <Label>Recent lipid panel or last known cholesterol (optional)</Label>
          <Textarea
            value={answers[`${prefix}-lipids`] || ""}
            onChange={(e) => onChange(`${prefix}-lipids`, e.target.value)}
            rows={2}
          />
        </div>
        <div className="space-y-2">
          <Label>Muscle pain or weakness on statins?</Label>
          <RadioGroup value={answers[`${prefix}-myalgia`] || ""} onValueChange={(v) => onChange(`${prefix}-myalgia`, v)}>
            {[
              ["no", "No"],
              ["yes", "Yes"],
              ["na", "Not applicable / never tried"],
            ].map(([value, label]) => (
              <div key={value} className="flex items-center gap-2">
                <RadioGroupItem value={value} id={`${prefix}-my-${value}`} />
                <Label htmlFor={`${prefix}-my-${value}`} className="font-normal cursor-pointer">
                  {label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
    )
  }

  if (drugClass === "thyroid") {
    return (
      <div className="space-y-3 rounded-lg border p-4">
        <p className="font-medium">{CLASS_LABELS.thyroid}</p>
        <div className="space-y-2">
          <Label>When were thyroid labs last checked?</Label>
          <Textarea
            value={answers[`${prefix}-labs`] || ""}
            onChange={(e) => onChange(`${prefix}-labs`, e.target.value)}
            rows={2}
            placeholder="e.g. TSH 2.1 in March 2026"
          />
        </div>
      </div>
    )
  }

  if (drugClass === "diabetes") {
    return (
      <div className="space-y-3 rounded-lg border p-4">
        <p className="font-medium">{CLASS_LABELS.diabetes}</p>
        <div className="space-y-2">
          <Label>Recent A1c or blood sugar (if known)</Label>
          <Textarea
            value={answers[`${prefix}-a1c`] || ""}
            onChange={(e) => onChange(`${prefix}-a1c`, e.target.value)}
            rows={2}
          />
        </div>
        <div className="space-y-2">
          <Label>History of low blood sugar symptoms?</Label>
          <RadioGroup value={answers[`${prefix}-hypo`] || ""} onValueChange={(v) => onChange(`${prefix}-hypo`, v)}>
            {[
              ["no", "No"],
              ["yes", "Yes"],
            ].map(([value, label]) => (
              <div key={value} className="flex items-center gap-2">
                <RadioGroupItem value={value} id={`${prefix}-hypo-${value}`} />
                <Label htmlFor={`${prefix}-hypo-${value}`} className="font-normal cursor-pointer">
                  {label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
    )
  }

  if (drugClass === "antibiotic") {
    return (
      <div className="space-y-3 rounded-lg border p-4">
        <p className="font-medium">{CLASS_LABELS.antibiotic}</p>
        <div className="space-y-2">
          <Label>Describe the infection symptoms and how long you have had them</Label>
          <Textarea
            value={answers[`${prefix}-infection`] || ""}
            onChange={(e) => onChange(`${prefix}-infection`, e.target.value)}
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label>Fever or feeling systemically ill?</Label>
          <RadioGroup value={answers[`${prefix}-fever`] || ""} onValueChange={(v) => onChange(`${prefix}-fever`, v)}>
            {[
              ["no", "No"],
              ["yes", "Yes"],
            ].map(([value, label]) => (
              <div key={value} className="flex items-center gap-2">
                <RadioGroupItem value={value} id={`${prefix}-fever-${value}`} />
                <Label htmlFor={`${prefix}-fever-${value}`} className="font-normal cursor-pointer">
                  {label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
    )
  }

  if (drugClass === "mental_health") {
    return (
      <div className="space-y-3 rounded-lg border p-4">
        <p className="font-medium">{CLASS_LABELS.mental_health}</p>
        <div className="space-y-2">
          <Label>Current mood symptoms</Label>
          <Textarea
            value={answers[`${prefix}-mood`] || ""}
            onChange={(e) => onChange(`${prefix}-mood`, e.target.value)}
            rows={2}
          />
        </div>
        <div className="space-y-2">
          <Label>Thoughts of harming yourself or others?</Label>
          <RadioGroup value={answers[`${prefix}-safety`] || ""} onValueChange={(v) => onChange(`${prefix}-safety`, v)}>
            {[
              ["no", "No"],
              ["yes", "Yes — I need urgent help"],
            ].map(([value, label]) => (
              <div key={value} className="flex items-center gap-2">
                <RadioGroupItem value={value} id={`${prefix}-safe-${value}`} />
                <Label htmlFor={`${prefix}-safe-${value}`} className="font-normal cursor-pointer">
                  {label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <p className="font-medium">{CLASS_LABELS.general}</p>
      <div className="space-y-2">
        <Label>Why do you believe this medication is appropriate for you today?</Label>
        <Textarea
          value={answers[`${prefix}-rationale`] || ""}
          onChange={(e) => onChange(`${prefix}-rationale`, e.target.value)}
          rows={3}
        />
      </div>
    </div>
  )
}

export function DrugClassClinicalQuestions({ drugClasses, answers, onChange }: DrugClassClinicalQuestionsProps) {
  const uniqueClasses = Array.from(new Set(drugClasses))
  if (uniqueClasses.length === 0) return null

  return (
    <div className="space-y-4">
      <p className="font-semibold">Medication-specific questions</p>
      {uniqueClasses.map((drugClass) => (
        <ClassBlock key={drugClass} drugClass={drugClass} answers={answers} onChange={onChange} />
      ))}
    </div>
  )
}
