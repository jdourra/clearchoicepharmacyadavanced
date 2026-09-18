import { PHARMACY_PHONE_DISPLAY } from "@/lib/phone"
import { CONTACT_EMAIL } from "@/lib/site-config"

/** Display name for the reviewing clinician on patient-facing copy. */
export const PRIMARY_PHYSICIAN = {
  name: "Licensed clinician",
  credentials: "Michigan-licensed clinician",
  state: "Michigan",
  reviewSla: "typically within one week",
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

export function physicianReviewPendingLabel(): string {
  return "Pending clinician review"
}

export function physicianReviewDescription(): string {
  return "A licensed clinician will review your medical history. Review is currently delayed about one week while we assign a new provider."
}

export function physicianReviewShort(): string {
  return `${PRIMARY_PHYSICIAN.name}, ${PRIMARY_PHYSICIAN.credentials}`
}

export const DEFAULT_INTAKE_SUCCESS_STEPS = [
  `A licensed clinician will review your medical information (${PRIMARY_PHYSICIAN.reviewSla})`,
  "You'll receive an email with the clinician's decision. Approved orders receive a 10% courtesy discount for the current delay.",
  "If approved, Clear Choice Pharmacy will contact you to collect payment and prepare your order",
] as const
