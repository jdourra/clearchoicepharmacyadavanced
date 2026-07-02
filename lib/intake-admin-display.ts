import type { AdminIntakeServiceType } from "@/lib/telehealth/intake-registry"

const HIDDEN_KEYS = new Set([
  "id_front_key",
  "id_back_key",
  "intake_payload",
  "first_name",
  "last_name",
  "email",
  "phone",
  "date_of_birth",
])

const ADMIN_KEYS = new Set([
  "status",
  "partner_name",
  "partner_case_id",
  "partner_status",
  "stripe_payment_intent_id",
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

export function buildIntakeReviewLayout(
  serviceType: AdminIntakeServiceType,
  detail: Record<string, unknown>,
  submissionId: string
): IntakeReviewLayout {
  const first = pick(detail, "first_name") ?? ""
  const last = pick(detail, "last_name") ?? ""
  const name = `${first} ${last}`.trim() || "Patient"

  const patientLine = joinLine([
    name,
    pick(detail, "email"),
    pick(detail, "phone"),
    pick(detail, "date_of_birth") ? `DOB ${pick(detail, "date_of_birth")}` : null,
  ])

  const addressLine = formatAddress(detail)
  const treatmentLine = formatTreatment(serviceType, detail)

  const submitted = pick(detail, "created_at")
  const metaLine = joinLine([
    submitted ? `Submitted ${submitted}` : null,
    `Ref ${submissionId}`,
    pick(detail, "status") ? formatPortalStatusSimple(String(detail.status)) : null,
  ])

  const used = new Set<string>([...HIDDEN_KEYS, ...ADMIN_KEYS, ...ADDRESS_KEYS, ...TREATMENT_KEYS])
  const clinicalOrder = CLINICAL_ORDER[serviceType] ?? []
  const clinicalItems = buildFieldItems(detail, clinicalOrder, used)

  for (const [key, raw] of Object.entries(detail)) {
    if (used.has(key) || HIDDEN_KEYS.has(key) || ADMIN_KEYS.has(key)) continue
    if (ADDRESS_KEYS.has(key) || TREATMENT_KEYS.has(key)) continue
    const value = formatValue(raw)
    if (!value) continue
    clinicalItems.push({ label: fieldLabel(key), value })
    used.add(key)
  }

  const adminItems = buildFieldItems(detail, [...ADMIN_KEYS], new Set())

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
