/** Primary reviewing physician for Michigan clinical intakes (manual telehealth queue). */
export const PRIMARY_PHYSICIAN = {
  name: "Dr. Dourra",
  credentials: "Michigan-Licensed Physician",
  state: "Michigan",
  reviewSla: "2–4 hours during business hours",
  pharmacyPhone: "1-248-987-6182",
} as const

export function getAdminInboxEmail(): string {
  return process.env.ADMIN_EMAIL?.trim().toLowerCase() || ""
}

export function getDrDourraInboxEmail(): string {
  return (
    process.env.TELEHEALTH_CLINICIAN_EMAIL?.trim().toLowerCase() ||
    process.env.DR_DOURRA_EMAIL?.trim().toLowerCase() ||
    ""
  )
}

/** @deprecated Prefer getDrDourraInboxEmail or getClinicalIntakeRecipientEmails */
export function getClinicianInboxEmail(): string {
  return getDrDourraInboxEmail() || getAdminInboxEmail()
}

/** Admin + Dr. Dourra for new clinical intake alerts (deduped). */
export function getClinicalIntakeRecipientEmails(): string[] {
  return [...new Set([getAdminInboxEmail(), getDrDourraInboxEmail()].filter(Boolean))]
}

export function physicianReviewPendingLabel(): string {
  return `Pending ${PRIMARY_PHYSICIAN.name}'s Review`
}

export function physicianReviewDescription(): string {
  return `${PRIMARY_PHYSICIAN.name} is currently reviewing your medical history`
}

export function physicianReviewShort(): string {
  return `${PRIMARY_PHYSICIAN.name}, ${PRIMARY_PHYSICIAN.credentials}`
}

export const DEFAULT_INTAKE_SUCCESS_STEPS = [
  `${PRIMARY_PHYSICIAN.name} will review your medical information (typically ${PRIMARY_PHYSICIAN.reviewSla})`,
  `You'll receive an email with ${PRIMARY_PHYSICIAN.name}'s decision and any follow-up questions`,
  "If approved, your payment hold will be captured and Clear Choice Pharmacy will prepare your order",
] as const
