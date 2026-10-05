export const INTAKE_CLINICIAN_DELAY_SUBJECT = "Update on your intake — Clear Choice Pharmacy"

/** Staff-note marker for this delay email. The older 10% note counts as already sent. */
export const INTAKE_DELAY_COURTESY_MARKER = "courtesy_5pct_delay_if_approved"

export const PRIOR_INTAKE_DELAY_MARKERS = [
  INTAKE_DELAY_COURTESY_MARKER,
  "courtesy_10pct_if_approved",
] as const

export const INTAKE_COURTESY_STAFF_TAG =
  `[staff_note:glp_review_backlog ${INTAKE_DELAY_COURTESY_MARKER}]`

export const INTAKE_DELAY_NOTICE_MIN_AGE_MS = 24 * 60 * 60 * 1000

export type DelayCourtesyPercent = 5 | 10

export function delayCourtesyPercentFromNotes(
  ...notes: Array<string | null | undefined>
): DelayCourtesyPercent | null {
  const text = notes.filter((note) => note != null && note !== "").join("\n")
  if (text.includes(INTAKE_DELAY_COURTESY_MARKER)) return 5
  if (text.includes("courtesy_10pct_if_approved")) return 10
  return null
}

export function intakeDelayCourtesyPercent(
  detail: Record<string, unknown> | null | undefined
): DelayCourtesyPercent | null {
  if (!detail) return null
  return delayCourtesyPercentFromNotes(
    detail.additional_concerns != null ? String(detail.additional_concerns) : "",
    detail.additional_notes != null ? String(detail.additional_notes) : "",
    detail.order_notes != null ? String(detail.order_notes) : ""
  )
}

export function courtesyDiscountedAmount(amount: number, percent: DelayCourtesyPercent) {
  const due = Math.round(amount * (100 - percent)) / 100
  const discount = Math.round((amount - due) * 100) / 100
  return { original: amount, discount, due }
}

export function formatCourtesyUsd(amount: number): string {
  return `$${amount.toFixed(2)}`
}

export function intakeWaitingLongEnoughForDelayNotice(
  createdAt: string,
  now = Date.now()
): boolean {
  const created = Date.parse(createdAt)
  if (Number.isNaN(created)) return false
  return now - created >= INTAKE_DELAY_NOTICE_MIN_AGE_MS
}

export function buildClinicianDelayCourtesyBody(firstName: string): string {
  const name = firstName.trim()
  const greeting = name ? `Hi ${name},` : "Hi,"
  return `${greeting}

Thank you for waiting on your Clear Choice Pharmacy intake.

We have had a high number of patients asking about GLP weight-loss treatment, so clinician review is taking longer than usual. Dr. Dourra is reviewing intakes in the order they were received. You do not need to submit the form again. We will email you as soon as your review is finished.

We are sorry for the wait. If treatment is approved, we will take 5% off the original medication price as a courtesy for the delay.

If you have questions, or if you would rather cancel while you wait, call us at (248) 987-6182 or reply to this email.

Thank you for your patience,
Clear Choice Pharmacy
40890 Grand River Ave, Novi, MI
(248) 987-6182`
}
