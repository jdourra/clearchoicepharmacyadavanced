import { PHARMACY_PHONE_DISPLAY } from "@/lib/phone"
import { CONTACT_EMAIL } from "@/lib/site-config"

/** Display name for the reviewing clinician on patient-facing copy. */
export const PRIMARY_PHYSICIAN = {
  name: "Licensed clinician",
  credentials: "Michigan-licensed clinician",
  state: "Michigan",
  reviewSla: "usually 4–5 days",
  pharmacyPhone: PHARMACY_PHONE_DISPLAY,
} as const

export function getAdminInboxEmail(): string {
  return process.env.ADMIN_EMAIL?.trim().toLowerCase() || CONTACT_EMAIL
}

/** New clinician inbox. Do not fall back to a former reviewer's personal email. */
export function getClinicianInboxEmail(): string {
  return process.env.TELEHEALTH_CLINICIAN_EMAIL?.trim().toLowerCase() || ""
}

/** @deprecated Use getClinicianInboxEmail */
export function getDrDourraInboxEmail(): string {
  return getClinicianInboxEmail()
}

/** Admin plus current clinician inbox only (former reviewer is not copied). */
export function getClinicalIntakeRecipientEmails(): string[] {
  return [...new Set([getAdminInboxEmail(), getClinicianInboxEmail()].filter(Boolean))]
}

export const PATIENT_REVIEW_TIMELINE =
  "Dr. Dourra usually takes 4–5 days to review your intake."

export const PATIENT_FULFILLMENT_TIMELINE =
  "After payment is received, processing and shipping take about 5 business days."

export const PATIENT_ORDER_TIMELINE = `${PATIENT_REVIEW_TIMELINE} ${PATIENT_FULFILLMENT_TIMELINE}`

export function physicianReviewPendingLabel(): string {
  return "Pending clinician review"
}

export function physicianReviewDescription(): string {
  return PATIENT_ORDER_TIMELINE
}

export function physicianReviewShort(): string {
  return `${PRIMARY_PHYSICIAN.name}, ${PRIMARY_PHYSICIAN.credentials}`
}

export const DEFAULT_INTAKE_SUCCESS_STEPS = [
  PATIENT_REVIEW_TIMELINE,
  "You'll receive an email when the review is finished. Approval depends on that clinical review.",
  PATIENT_FULFILLMENT_TIMELINE,
] as const
