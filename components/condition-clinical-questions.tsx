"use client"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import {
  getConditionLabel,
  getQuestionsForConditions,
  type VisitConditionId,
} from "@/lib/rx-visit-conditions"

type ConditionClinicalQuestionsProps = {
  selectedConditions: VisitConditionId[]
  answers: Record<string, string>
  onChange: (key: string, value: string) => void
  invalidFields?: Set<string>
}

export function ConditionClinicalQuestions({
  selectedConditions,
  answers,
  onChange,
  invalidFields,
}: ConditionClinicalQuestionsProps) {
  if (selectedConditions.length === 0) return null

  const questionsByCondition = selectedConditions
    .filter((id) => id !== "other")
    .map((id) => ({
      id,
      label: getConditionLabel(id),
      questions: getQuestionsForConditions([id]),
    }))
    .filter((block) => block.questions.length > 0)

  if (questionsByCondition.length === 0) return null

  const isInvalid = (key: string) => invalidFields?.has(key) ?? false

  return (
    <div className="space-y-4">
      <p className="font-semibold">Condition-specific questions</p>
      {questionsByCondition.map((block) => (
        <div key={block.id} className="space-y-3 rounded-lg border p-4">
          <p className="font-medium">{block.label}</p>
          {block.questions.map((question) => (
            <div key={question.key} className="space-y-2" data-field={question.key}>
              <Label className={cn(isInvalid(question.key) && "text-destructive")}>{question.label} *</Label>
              {question.type === "textarea" ? (
                <Textarea
                  value={answers[question.key] || ""}
                  onChange={(e) => onChange(question.key, e.target.value)}
                  rows={question.rows ?? 2}
                  placeholder={question.placeholder}
                  className={cn(isInvalid(question.key) && "border-destructive")}
                />
              ) : (
                <RadioGroup
                  value={answers[question.key] || ""}
                  onValueChange={(v) => onChange(question.key, v)}
                  className={cn(isInvalid(question.key) && "rounded-md ring-2 ring-destructive p-2 -m-1")}
                >
                  {(question.options ?? []).map((option) => (
                    <div key={option.value} className="flex items-center gap-2">
                      <RadioGroupItem value={option.value} id={`${question.key}-${option.value}`} />
                      <Label htmlFor={`${question.key}-${option.value}`} className="font-normal cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
