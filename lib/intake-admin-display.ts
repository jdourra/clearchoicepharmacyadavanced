import type { AdminIntakeServiceType } from "@/lib/telehealth/intake-registry"
import {
  formatConditionAnswersForAdmin,
  formatVisitReason,
  type VisitConditionId,
} from "@/lib/rx-visit-conditions"
import type { RxDrugClass } from "@/lib/prescription-telemedicine"

const HIDDEN_KEYS = new Set([
  "id_front_key",
  "id_back_key",
  "intake_payload",
  "first_name",
  "last_name",
  "email",
  "phone",
  "date_of_birth",
  "intake_data",
])

const ADMIN_KEYS = new Set([
  "status",
  "partner_name",
  "partner_case_id",
  "partner_status",
  "stripe_payment_intent_id",
  "delivery_method",
  "total_amount",
  "intake_type",
  "order_id",
  "created_at",
  "updated_at",
  "selected_package",
  "selected_vial",
  "selected_program",
  "selected_product",
  "selected_billing_plan",
])

const ADDRESS_KEYS = new Set([
  "service_address",
  "service_city",
  "service_state",
  "service_zip",
  "shipping_address",
  "shipping_city",
  "shipping_state",
  "shipping_zip",
  "address",
  "city",
  "zip_code",
  "state",
])

const TREATMENT_KEYS = new Set([
  "selected_package_title",
  "selected_boosters",
  "estimated_total",
  "preferred_date",
  "preferred_time_window",
  "selected_vial_title",
  "kit_price",
])

const FIELD_LABELS: Record<string, string> = {
  kidney_disease: "Kidney disease",
  heart_condition: "Heart condition",
  pregnant_or_breastfeeding: "Pregnant or breastfeeding",
  allergies: "Allergies",
  current_medications: "Current medications",
  additional_notes: "Additional notes",
  additional_concerns: "Additional concerns",
  systolic_bp: "Systolic BP",
  diastolic_bp: "Diastolic BP",
  heart_rate: "Heart rate",
  diabetes: "Diabetes",
  hypertension: "Hypertension",
  liver_disease: "Liver disease",
  vision_problems: "Vision problems",
  ed_duration: "ED duration",
  ed_severity: "ED severity",
  previous_treatments: "Previous treatments",
  treatment_goals: "Treatment goals",
  symptoms: "Symptoms",
  prior_trt_experience: "Prior TRT experience",
  has_recent_labs: "Recent labs",
  prostate_cancer: "Prostate cancer history",
  breast_cancer: "Breast cancer history",
  polycythemia: "Polycythemia",
  severe_sleep_apnea: "Severe sleep apnea",
  uncontrolled_heart_failure: "Uncontrolled heart failure",
  fertility_priority: "Fertility priority",
  sleep_apnea: "Sleep apnea",
  cardiovascular_disease: "Cardiovascular disease",
  type2_diabetes: "Type 2 diabetes",
  gallbladder_disease: "Gallbladder disease",
  diabetic_retinopathy: "Diabetic retinopathy",
  bariatric_surgery: "Bariatric surgery",
  mtc_or_men2_history: "MTC/MEN2 history",
  pancreatitis_history: "Pancreatitis history",
  type1_diabetes: "Type 1 diabetes",
  eating_disorder: "Eating disorder",
  on_other_glp: "On other GLP-1",
  prior_glp_experience: "Prior GLP-1 experience",
  weight_loss_goals: "Weight loss goals",
  comorbidities: "Comorbidities",
  height_inches: "Height (in)",
  weight_lbs: "Weight (lbs)",
  goal_weight_lbs: "Goal weight (lbs)",
  bmi: "BMI",
  status: "Status",
  partner_name: "Review channel",
  partner_status: "Partner status",
  partner_case_id: "Partner case ID",
  stripe_payment_intent_id: "Stripe payment",
  created_at: "Submitted",
  updated_at: "Last updated",
  selected_package: "Package ID",
  selected_vial: "Vial ID",
  selected_program: "Program ID",
  selected_product: "Product ID",
  selected_billing_plan: "Billing plan",
  selected_conditions: "Conditions for visit",
  other_condition_notes: "Other condition details",
  new_or_worsening_symptoms: "New or worsening symptoms",
  symptom_details: "Symptom details",
  other_conditions: "Other medical conditions",
  recent_labs: "Recent labs",
  lab_upload_notes: "Lab notes for physician",
  delivery_method: "Delivery method",
  total_amount: "Total amount",
  intake_type: "Intake type",
  order_id: "Order ID",
}

const CLINICAL_ORDER: Partial<Record<AdminIntakeServiceType, string[]>> = {
  iv_rejuvenation: [
    "kidney_disease",
    "heart_condition",
    "pregnant_or_breastfeeding",
    "allergies",
    "current_medications",
    "additional_notes",
  ],
  rejuvenation_vial: [
    "kidney_disease",
    "heart_condition",
    "pregnant_or_breastfeeding",
    "allergies",
    "current_medications",
    "additional_notes",
  ],
  mens_health: [
    "systolic_bp",
    "diastolic_bp",
    "heart_rate",
    "diabetes",
    "hypertension",
    "heart_condition",
    "liver_disease",
    "kidney_disease",
    "vision_problems",
    "ed_duration",
    "ed_severity",
    "previous_treatments",
    "treatment_goals",
    "current_medications",
    "allergies",
  ],
  trt: [
    "symptoms",
    "treatment_goals",
    "prior_trt_experience",
    "has_recent_labs",
    "prostate_cancer",
    "breast_cancer",
    "polycythemia",
    "severe_sleep_apnea",
    "uncontrolled_heart_failure",
    "fertility_priority",
    "systolic_bp",
    "diastolic_bp",
    "hypertension",
    "sleep_apnea",
    "cardiovascular_disease",
    "diabetes",
    "liver_disease",
    "kidney_disease",
    "current_medications",
    "allergies",
    "additional_concerns",
  ],
  weight_loss: [
    "height_inches",
    "weight_lbs",
    "bmi",
    "goal_weight_lbs",
    "systolic_bp",
    "diastolic_bp",
    "pregnant_or_breastfeeding",
    "mtc_or_men2_history",
    "pancreatitis_history",
    "type1_diabetes",
    "eating_disorder",
    "on_other_glp",
    "type2_diabetes",
    "hypertension",
    "gallbladder_disease",
    "diabetic_retinopathy",
    "bariatric_surgery",
    "sleep_apnea",
    "cardiovascular_disease",
    "comorbidities",
    "prior_glp_experience",
    "weight_loss_goals",
    "current_medications",
    "allergies",
    "additional_concerns",
  ],
  specialty_pharmacy: [
    "diagnosis",
    "currently_on_medication",
    "prior_auth_status",
    "prescription_method",
    "doctor_name",
    "doctor_phone",
    "transfer_rx_numbers",
    "transfer_pharmacy_name",
    "transfer_pharmacy_phone",
    "prescriber_name",
    "prescriber_phone",
    "fulfillment_preference",
    "allergies",
    "additional_notes",
    "insurance_plan_name",
    "insurance_member_id",
    "insurance_group_number",
  ],
  prescription_telemedicine: [
    "selected_conditions",
    "new_or_worsening_symptoms",
    "symptom_details",
    "current_medications",
    "allergies",
    "other_conditions",
    "pregnant_or_breastfeeding",
    "recent_labs",
    "lab_upload_notes",
  ],
}

export type IntakeReviewField = { label: string; value: string }

export type IntakeReviewLayout = {
  patientLine: string
  addressLine: string | null
  treatmentLine: string | null
  metaLine: string
  clinicalItems: IntakeReviewField[]
  adminItems: IntakeReviewField[]
}

function formatValue(value: unknown): string | null {
  if (value == null || value === "") return null
  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : null
  if (typeof value === "object") {
    const text = JSON.stringify(value)
    return text === "[]" || text === "{}" ? null : text
  }
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return new Date(value).toLocaleString()
  }
  return String(value)
}

function fieldLabel(key: string): string {
  return FIELD_LABELS[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function joinLine(parts: (string | null | undefined)[]): string {
  return parts.filter(Boolean).join(" · ")
}

function pick(detail: Record<string, unknown>, key: string): string | null {
  return formatValue(detail[key])
}

function formatAddress(detail: Record<string, unknown>): string | null {
  if (detail.service_address) {
    const parts = [
      pick(detail, "service_address"),
      pick(detail, "service_city"),
      [pick(detail, "service_state"), pick(detail, "service_zip")].filter(Boolean).join(" "),
    ].filter(Boolean)
    return parts.length > 0 ? parts.join(", ") : null
  }

  const shipStreet = pick(detail, "shipping_address")
  if (shipStreet) {
    return joinLine([
      shipStreet,
      [pick(detail, "shipping_city"), pick(detail, "shipping_state"), pick(detail, "shipping_zip")]
        .filter(Boolean)
        .join(", "),
    ])
  }

  const street = pick(detail, "address")
  if (street) {
    return joinLine([
      street,
      [pick(detail, "city"), pick(detail, "state"), pick(detail, "zip_code")].filter(Boolean).join(", "),
    ])
  }

  return pick(detail, "state")
}

function formatTreatment(serviceType: AdminIntakeServiceType, detail: Record<string, unknown>): string | null {
  switch (serviceType) {
    case "iv_rejuvenation": {
      const boosters = detail.selected_boosters
      let boosterText: string | null = null
      if (Array.isArray(boosters) && boosters.length > 0) {
        boosterText = `Boosters: ${boosters.join(", ")}`
      } else if (typeof boosters === "string" && boosters) {
        boosterText = `Boosters: ${boosters}`
      }
      return joinLine([
        pick(detail, "selected_package_title") || pick(detail, "selected_package"),
        boosterText,
        pick(detail, "estimated_total") ? `Est. $${pick(detail, "estimated_total")}` : null,
        pick(detail, "preferred_date") ? `Date: ${pick(detail, "preferred_date")}` : null,
        pick(detail, "preferred_time_window")
          ? `Window: ${formatTimeWindow(String(detail.preferred_time_window))}`
          : null,
      ])
    }
    case "rejuvenation_vial":
      return joinLine([
        pick(detail, "selected_vial_title") || pick(detail, "selected_vial"),
        pick(detail, "kit_price") ? `$${pick(detail, "kit_price")}` : null,
      ])
    case "weight_loss":
      return joinLine([
        pick(detail, "selected_program"),
        pick(detail, "selected_billing_plan") ? `Plan: ${pick(detail, "selected_billing_plan")}` : null,
      ])
    case "trt":
      return joinLine([
        pick(detail, "selected_program"),
        pick(detail, "selected_billing_plan") ? `Plan: ${pick(detail, "selected_billing_plan")}` : null,
      ])
    case "mens_health":
      return joinLine([
        pick(detail, "selected_product"),
        pick(detail, "selected_billing_plan") ? `Plan: ${pick(detail, "selected_billing_plan")}` : null,
      ])
    case "specialty_pharmacy":
      return joinLine([
        pick(detail, "selected_medication"),
        pick(detail, "request_type"),
      ])
    case "prescription_telemedicine": {
      const meds = detail.requested_medications
      const medLine =
        Array.isArray(meds) && meds.length > 0
          ? meds
              .map((m) =>
                m && typeof m === "object" ? String((m as Record<string, unknown>).name ?? "") : ""
              )
              .filter(Boolean)
              .join(", ")
          : null
      return joinLine([
        medLine,
        pick(detail, "visit_reason") ? `Reason: ${pick(detail, "visit_reason")}` : null,
        pick(detail, "total_amount") ? `Total: $${pick(detail, "total_amount")}` : null,
        pick(detail, "delivery_method") ? `Delivery: ${pick(detail, "delivery_method")}` : null,
      ])
    }
    default:
      return null
  }
}

function formatTimeWindow(value: string): string {
  const labels: Record<string, string> = {
    asap: "ASAP",
    morning: "Morning (8am–12pm)",
    afternoon: "Afternoon (12pm–5pm)",
    evening: "Evening (5pm–8pm)",
  }
  return labels[value] ?? value.replace(/_/g, " ")
}

function buildFieldItems(
  detail: Record<string, unknown>,
  keys: string[],
  used: Set<string>
): IntakeReviewField[] {
  const items: IntakeReviewField[] = []
  for (const key of keys) {
    const value = formatValue(detail[key])
    if (!value) continue
    used.add(key)
    items.push({ label: fieldLabel(key), value })
  }
  return items
}

const RX_DRUG_CLASS_LABELS: Record<RxDrugClass, string> = {
  cardiovascular: "Blood pressure / heart medication",
  cholesterol: "Cholesterol medication",
  thyroid: "Thyroid medication",
  diabetes: "Diabetes medication",
  antibiotic: "Antibiotic",
  mental_health: "Mental health medication",
  general: "Additional clinical questions",
}

const RX_DRUG_CLASS_QUESTION_LABELS: Record<string, string> = {
  "cardiovascular-bp": "Most recent blood pressure reading",
  "cardiovascular-symptoms": "Dizziness, fainting, or swelling",
  "cholesterol-lipids": "Recent lipid panel / cholesterol",
  "cholesterol-myalgia": "Muscle pain or weakness on statins",
  "thyroid-labs": "When thyroid labs were last checked",
  "diabetes-a1c": "Recent A1c / blood sugar",
  "diabetes-hypo": "History of low blood sugar symptoms",
  "antibiotic-infection": "Infection symptoms and duration",
  "antibiotic-fever": "Fever / systemic symptoms",
  "mental_health-mood": "Current mood symptoms",
  "mental_health-safety": "Thoughts of harming yourself or others",
  "general-rationale": "Why this medication is appropriate today",
}

function formatRxDrugClassAnswerValue(key: string, raw: string): string {
  const value = String(raw)
  if (value === "yes") {
    if (key === "mental_health-safety") return "Yes — I need urgent help"
    return "Yes"
  }
  if (value === "no") return "No"
  if (value === "na") return "Not applicable / never tried"
  if (value === "yes-once") return "Yes — once"
  if (value === "yes-multiple") return "Yes — multiple times"
  if (value === "yes-mild") return "Yes — mild new symptoms"
  if (value === "yes-significant") return "Yes — significant or worsening symptoms"
  return value
}

function formatRxDrugClassAnswersForAdmin(
  selectedClasses: RxDrugClass[],
  answers: Record<string, string>
): IntakeReviewField[] {
  const classSet = new Set<RxDrugClass>(selectedClasses)
  const items: IntakeReviewField[] = []

  for (const [key, raw] of Object.entries(answers)) {
    if (!raw || typeof raw !== "string") continue
    const prefix = key.split("-")[0] as RxDrugClass
    if (!classSet.has(prefix)) continue

    const labelBase =
      RX_DRUG_CLASS_QUESTION_LABELS[key] ??
      key.replace(/_/g, " ").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())

    const classLabel = RX_DRUG_CLASS_LABELS[prefix] ?? prefix
    const value = formatRxDrugClassAnswerValue(key, raw)
    items.push({
      label: `${classLabel} — ${labelBase}`,
      value,
    })
  }

  return items
}

function formatRxSymptomStatus(value: unknown): string | null {
  if (value == null || value === "") return null
  const raw = String(value)
  const labels: Record<string, string> = {
    no: "No — stable / maintenance refill",
    "yes-mild": "Yes — mild new symptoms",
    "yes-significant": "Yes — significant or worsening symptoms",
  }
  return labels[raw] ?? raw
}

function mergeRxTelemedicineClinicalDetail(detail: Record<string, unknown>): Record<string, unknown> {
  const merged = { ...detail }
  const intakeData = detail.intake_data
  if (!intakeData || typeof intakeData !== "object") return merged

  const clinical = (intakeData as Record<string, unknown>).clinical as Record<string, unknown> | undefined
  if (!clinical) return merged

  const selectedIds = (clinical.selectedConditions ?? []) as VisitConditionId[]
  if (selectedIds.length > 0) {
    merged.selected_conditions = formatVisitReason(
      selectedIds,
      clinical.otherConditionNotes != null ? String(clinical.otherConditionNotes) : undefined
    )
  } else if (clinical.primaryCondition != null) {
    merged.selected_conditions = String(clinical.primaryCondition)
  }

  const fieldMap: [string, string][] = [
    ["otherConditionNotes", "other_condition_notes"],
    ["newOrWorseningSymptoms", "new_or_worsening_symptoms"],
    ["symptomDetails", "symptom_details"],
    ["currentMedications", "current_medications"],
    ["allergies", "allergies"],
    ["otherConditions", "other_conditions"],
    ["pregnantOrBreastfeeding", "pregnant_or_breastfeeding"],
    ["recentLabs", "recent_labs"],
    ["labUploadNotes", "lab_upload_notes"],
  ]

  for (const [src, dest] of fieldMap) {
    const value = clinical[src]
    if (value != null && value !== "") {
      merged[dest] =
        src === "newOrWorseningSymptoms" ? formatRxSymptomStatus(value) : value
    }
  }

  return merged
}

export function buildIntakeReviewLayout(
  serviceType: AdminIntakeServiceType,
  detail: Record<string, unknown>,
  submissionId: string
): IntakeReviewLayout {
  const reviewDetail =
    serviceType === "prescription_telemedicine" ? mergeRxTelemedicineClinicalDetail(detail) : detail
  const first = pick(reviewDetail, "first_name") ?? ""
  const last = pick(reviewDetail, "last_name") ?? ""
  const name = `${first} ${last}`.trim() || "Patient"

  const patientLine = joinLine([
    name,
    pick(reviewDetail, "email"),
    pick(reviewDetail, "phone"),
    pick(reviewDetail, "date_of_birth") ? `DOB ${pick(reviewDetail, "date_of_birth")}` : null,
  ])

  const addressLine = formatAddress(reviewDetail)
  const treatmentLine = formatTreatment(serviceType, reviewDetail)

  const submitted = pick(reviewDetail, "created_at")
  const metaLine = joinLine([
    submitted ? `Submitted ${submitted}` : null,
    `Ref ${submissionId}`,
    pick(reviewDetail, "status") ? formatPortalStatusSimple(String(reviewDetail.status)) : null,
  ])

  const used = new Set<string>([...HIDDEN_KEYS, ...ADMIN_KEYS, ...ADDRESS_KEYS, ...TREATMENT_KEYS])
  const clinicalItems: IntakeReviewField[] = []

  if (serviceType === "prescription_telemedicine") {
    // Physician-facing screening: only the fields needed for approval + the condition-driven Q&A.
    // Anything billing/order-related goes into adminItems (see ADMIN_KEYS).
    const clinicalOrder = CLINICAL_ORDER.prescription_telemedicine ?? []
    clinicalItems.push(...buildFieldItems(reviewDetail, clinicalOrder, used))

    const intakeData = detail.intake_data
    if (intakeData && typeof intakeData === "object") {
      const intake = intakeData as Record<string, unknown>
      const selectedDrugClasses = (intake.drugClasses ?? []) as RxDrugClass[]
      const clinical = intake.clinical as Record<string, unknown> | undefined
      const selectedIds = (clinical?.selectedConditions ?? []) as VisitConditionId[]
      const conditionAnswers = (clinical?.conditionAnswers ?? {}) as Record<string, string>
      const classAnswers = (clinical?.classAnswers ?? {}) as Record<string, string>

      // Condition-specific screening (only what pertains to the selected condition(s))
      for (const item of formatConditionAnswersForAdmin(selectedIds, conditionAnswers)) {
        clinicalItems.push({ label: item.label, value: item.value })
      }

      // Medication-specific screening (only for drug classes present in cart)
      clinicalItems.push(...formatRxDrugClassAnswersForAdmin(selectedDrugClasses, classAnswers))
    }
  } else {
    const clinicalOrder = CLINICAL_ORDER[serviceType] ?? []
    clinicalItems.push(...buildFieldItems(reviewDetail, clinicalOrder, used))

    for (const [key, raw] of Object.entries(reviewDetail)) {
      if (used.has(key) || HIDDEN_KEYS.has(key) || ADMIN_KEYS.has(key)) continue
      if (ADDRESS_KEYS.has(key) || TREATMENT_KEYS.has(key)) continue
      const value = formatValue(raw)
      if (!value) continue
      clinicalItems.push({ label: fieldLabel(key), value })
      used.add(key)
    }
  }

  const adminItems = buildFieldItems(reviewDetail, [...ADMIN_KEYS], new Set())

  return {
    patientLine,
    addressLine,
    treatmentLine,
    metaLine,
    clinicalItems,
    adminItems,
  }
}

function formatPortalStatusSimple(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

/** @deprecated Use buildIntakeReviewLayout */
export function formatIntakeFieldLabel(key: string): string {
  return fieldLabel(key)
}

/** @deprecated Use buildIntakeReviewLayout */
export function intakeDetailEntries(detail: Record<string, unknown>) {
  return Object.entries(detail)
    .filter(([key, value]) => value != null && value !== "" && !HIDDEN_KEYS.has(key))
    .map(([key, value]) => ({
      key,
      label: fieldLabel(key),
      value: formatValue(value) ?? "—",
    }))
}
