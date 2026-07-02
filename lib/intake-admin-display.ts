const HIDDEN_DETAIL_KEYS = new Set([
  "id_front_key",
  "id_back_key",
  "intake_payload",
  "updated_at",
])

const FIELD_LABELS: Record<string, string> = {
  first_name: "First name",
  last_name: "Last name",
  email: "Email",
  phone: "Phone",
  state: "State",
  date_of_birth: "Date of birth",
  service_address: "Service address",
  service_city: "City",
  service_state: "State",
  service_zip: "ZIP",
  shipping_address: "Shipping address",
  shipping_city: "Shipping city",
  shipping_state: "Shipping state",
  shipping_zip: "Shipping ZIP",
  preferred_date: "Preferred date",
  preferred_time_window: "Preferred time window",
  selected_package: "Package ID",
  selected_package_title: "IV package",
  selected_boosters: "Boosters",
  selected_program: "Program",
  selected_product: "Product",
  selected_vial: "Vial",
  selected_vial_title: "Vial kit",
  selected_medication: "Medication",
  estimated_total: "Estimated total",
  allergies: "Allergies",
  current_medications: "Current medications",
  kidney_disease: "Kidney disease",
  heart_condition: "Heart condition",
  pregnant_or_breastfeeding: "Pregnant or breastfeeding",
  additional_notes: "Additional notes",
  status: "Status",
  partner_name: "Review channel",
  partner_status: "Partner status",
  stripe_payment_intent_id: "Stripe payment",
  created_at: "Submitted",
}

function formatValue(value: unknown): string {
  if (value == null || value === "") return "—"
  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (typeof value === "object") return JSON.stringify(value, null, 2)
  if (typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}T/)) {
    return new Date(value).toLocaleString()
  }
  return String(value)
}

export function formatIntakeFieldLabel(key: string): string {
  return FIELD_LABELS[key] ?? key.replace(/_/g, " ")
}

export function intakeDetailEntries(detail: Record<string, unknown>) {
  return Object.entries(detail)
    .filter(([key, value]) => value != null && value !== "" && !HIDDEN_DETAIL_KEYS.has(key))
    .map(([key, value]) => ({
      key,
      label: formatIntakeFieldLabel(key),
      value: formatValue(value),
    }))
}
