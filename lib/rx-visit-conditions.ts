export type VisitConditionId =
  | "hypertension"
  | "high_cholesterol"
  | "hypothyroidism"
  | "type2_diabetes"
  | "uti"
  | "sinus_infection"
  | "acid_reflux"
  | "anxiety_depression"
  | "birth_control"
  | "skin_infection_acne"
  | "other"

export type ConditionQuestionType = "textarea" | "radio"

export type ConditionQuestion = {
  key: string
  label: string
  type: ConditionQuestionType
  required?: boolean
  options?: { value: string; label: string }[]
  placeholder?: string
  rows?: number
}

export type VisitCondition = {
  id: VisitConditionId
  label: string
  questions: ConditionQuestion[]
}

const yesNo = [
  { value: "no", label: "No" },
  { value: "yes", label: "Yes" },
]

export const VISIT_CONDITIONS: VisitCondition[] = [
  {
    id: "hypertension",
    label: "High blood pressure / hypertension",
    questions: [
      {
        key: "hypertension-bp",
        label: "Most recent blood pressure reading (if known)",
        type: "textarea",
        required: true,
        rows: 2,
        placeholder: "e.g. 128/82 at home last week",
      },
      {
        key: "hypertension-symptoms",
        label: "Dizziness, fainting, chest pain, or swelling?",
        type: "radio",
        required: true,
        options: [
          { value: "no", label: "No" },
          { value: "yes", label: "Yes — describe in symptom notes below" },
        ],
      },
    ],
  },
  {
    id: "high_cholesterol",
    label: "High cholesterol",
    questions: [
      {
        key: "cholesterol-lipids",
        label: "Recent lipid panel or last known cholesterol (if known)",
        type: "textarea",
        required: true,
        rows: 2,
      },
      {
        key: "cholesterol-myalgia",
        label: "Muscle pain or weakness on statins?",
        type: "radio",
        required: true,
        options: [
          { value: "no", label: "No" },
          { value: "yes", label: "Yes" },
          { value: "na", label: "Not applicable / never tried" },
        ],
      },
    ],
  },
  {
    id: "hypothyroidism",
    label: "Hypothyroidism / thyroid disorder",
    questions: [
      {
        key: "thyroid-labs",
        label: "When were thyroid labs last checked?",
        type: "textarea",
        required: true,
        rows: 2,
        placeholder: "e.g. TSH 2.1 in March 2026",
      },
      {
        key: "thyroid-symptoms",
        label: "Fatigue, weight change, or palpitations?",
        type: "radio",
        required: true,
        options: yesNo,
      },
    ],
  },
  {
    id: "type2_diabetes",
    label: "Type 2 diabetes",
    questions: [
      {
        key: "diabetes-a1c",
        label: "Recent A1c or blood sugar (if known)",
        type: "textarea",
        required: true,
        rows: 2,
      },
      {
        key: "diabetes-hypo",
        label: "History of low blood sugar symptoms?",
        type: "radio",
        required: true,
        options: yesNo,
      },
    ],
  },
  {
    id: "uti",
    label: "Urinary tract infection (UTI)",
    questions: [
      {
        key: "uti-symptoms",
        label: "Describe your symptoms and how long you have had them",
        type: "textarea",
        required: true,
        rows: 3,
        placeholder: "Burning, frequency, urgency, back pain…",
      },
      {
        key: "uti-fever",
        label: "Fever, chills, nausea, or vomiting?",
        type: "radio",
        required: true,
        options: yesNo,
      },
      {
        key: "uti-prior",
        label: "Prior UTIs in the past 12 months?",
        type: "radio",
        required: true,
        options: [
          { value: "no", label: "No" },
          { value: "yes-once", label: "Yes — once" },
          { value: "yes-multiple", label: "Yes — multiple times" },
        ],
      },
    ],
  },
  {
    id: "sinus_infection",
    label: "Sinus / upper respiratory infection",
    questions: [
      {
        key: "uri-symptoms",
        label: "Describe your symptoms and how long you have had them",
        type: "textarea",
        required: true,
        rows: 3,
      },
      {
        key: "uri-fever",
        label: "Fever or feeling systemically ill?",
        type: "radio",
        required: true,
        options: yesNo,
      },
      {
        key: "uri-breathing",
        label: "Shortness of breath or difficulty breathing?",
        type: "radio",
        required: true,
        options: yesNo,
      },
    ],
  },
  {
    id: "acid_reflux",
    label: "Acid reflux / GERD",
    questions: [
      {
        key: "gerd-symptoms",
        label: "Describe your reflux symptoms and how long you have had them",
        type: "textarea",
        required: true,
        rows: 3,
      },
      {
        key: "gerd-alarm",
        label: "Trouble swallowing, vomiting blood, or unintentional weight loss?",
        type: "radio",
        required: true,
        options: yesNo,
      },
    ],
  },
  {
    id: "anxiety_depression",
    label: "Anxiety / depression (refill)",
    questions: [
      {
        key: "mh-mood",
        label: "Current mood symptoms",
        type: "textarea",
        required: true,
        rows: 2,
      },
      {
        key: "mh-safety",
        label: "Thoughts of harming yourself or others?",
        type: "radio",
        required: true,
        options: [
          { value: "no", label: "No" },
          { value: "yes", label: "Yes — I need urgent help" },
        ],
      },
    ],
  },
  {
    id: "birth_control",
    label: "Birth control / contraception",
    questions: [
      {
        key: "bc-pregnancy",
        label: "Could you be pregnant?",
        type: "radio",
        required: true,
        options: [
          { value: "no", label: "No" },
          { value: "yes", label: "Yes or unsure" },
        ],
      },
      {
        key: "bc-migraine",
        label: "Migraine with aura?",
        type: "radio",
        required: true,
        options: yesNo,
      },
      {
        key: "bc-smoking",
        label: "Do you smoke cigarettes?",
        type: "radio",
        required: true,
        options: yesNo,
      },
      {
        key: "bc-clots",
        label: "History of blood clots (DVT, PE) or stroke?",
        type: "radio",
        required: true,
        options: yesNo,
      },
    ],
  },
  {
    id: "skin_infection_acne",
    label: "Skin infection / acne",
    questions: [
      {
        key: "skin-area",
        label: "Affected area(s) and description",
        type: "textarea",
        required: true,
        rows: 2,
      },
      {
        key: "skin-prior",
        label: "Prior treatments tried for this issue",
        type: "textarea",
        required: true,
        rows: 2,
        placeholder: "Topicals, antibiotics, isotretinoin, etc.",
      },
      {
        key: "skin-spreading",
        label: "Rapidly spreading redness, fever, or severe pain?",
        type: "radio",
        required: true,
        options: yesNo,
      },
    ],
  },
  {
    id: "other",
    label: "Other",
    questions: [],
  },
]

const CONDITION_BY_ID = new Map(VISIT_CONDITIONS.map((c) => [c.id, c]))

export const VISIT_CONDITION_OPTIONS = VISIT_CONDITIONS.map(({ id, label }) => ({ id, label }))

export function getConditionLabel(id: VisitConditionId): string {
  return CONDITION_BY_ID.get(id)?.label ?? id
}

export function getQuestionsForConditions(ids: VisitConditionId[]): ConditionQuestion[] {
  const seen = new Set<string>()
  const questions: ConditionQuestion[] = []
  for (const id of ids) {
    const condition = CONDITION_BY_ID.get(id)
    if (!condition) continue
    for (const question of condition.questions) {
      if (seen.has(question.key)) continue
      seen.add(question.key)
      questions.push(question)
    }
  }
  return questions
}

export function validateConditionAnswers(
  selectedConditions: VisitConditionId[],
  answers: Record<string, string>,
  otherConditionNotes: string
): string[] {
  const invalid: string[] = []
  if (selectedConditions.length === 0) {
    invalid.push("selectedConditions")
  }
  if (selectedConditions.includes("other") && !otherConditionNotes.trim()) {
    invalid.push("otherConditionNotes")
  }
  for (const question of getQuestionsForConditions(selectedConditions)) {
    if (question.required !== false && !answers[question.key]?.trim()) {
      invalid.push(question.key)
    }
  }
  return invalid
}

export function formatVisitReason(
  selectedConditions: VisitConditionId[],
  otherConditionNotes?: string
): string {
  const labels = selectedConditions
    .filter((id) => id !== "other")
    .map((id) => getConditionLabel(id))
  if (selectedConditions.includes("other") && otherConditionNotes?.trim()) {
    labels.push(`Other: ${otherConditionNotes.trim()}`)
  } else if (selectedConditions.includes("other")) {
    labels.push("Other")
  }
  return labels.join(", ")
}

const QUESTION_LABELS = new Map<string, string>()
for (const condition of VISIT_CONDITIONS) {
  for (const q of condition.questions) {
    QUESTION_LABELS.set(q.key, q.label)
  }
}

export function formatConditionAnswerLabel(key: string): string {
  return QUESTION_LABELS.get(key) ?? key.replace(/-/g, " ")
}

export function formatConditionAnswersForAdmin(
  selectedConditions: VisitConditionId[],
  answers: Record<string, string>
): { label: string; value: string }[] {
  const items: { label: string; value: string }[] = []
  for (const question of getQuestionsForConditions(selectedConditions)) {
    const value = answers[question.key]?.trim()
    if (!value) continue
    let display = value
    if (question.type === "radio") {
      const option = question.options?.find((o) => o.value === value)
      if (option) display = option.label
    }
    items.push({ label: question.label, value: display })
  }
  return items
}
