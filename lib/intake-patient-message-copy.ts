export const INTAKE_CLINICIAN_DELAY_SUBJECT = "Update on your intake — Clear Choice Pharmacy"

export const INTAKE_COURTESY_STAFF_TAG =
  "[staff_note:hold_for_new_clinician courtesy_10pct_if_approved]"

export function buildClinicianDelayCourtesyBody(firstName: string): string {
  const name = firstName.trim()
  const greeting = name ? `Hi ${name},` : "Hi,"
  return `${greeting}

Thank you for submitting your intake with Clear Choice Pharmacy.

The physician originally assigned to review your information is not available right now. We are assigning a new licensed clinician, who we expect to be onboard next week.

We will hold your intake as submitted. You do not need to fill out the form again. The new clinician will review your information when they come onboard. Approval is still based on that clinical review.

For the delay, we will apply a 10% courtesy discount to your order if treatment is approved.

If you have questions, or if you would rather cancel while you wait, call us at (248) 987-6182 or reply to this email.

Thank you for your patience,
Clear Choice Pharmacy
40890 Grand River Ave, Novi, MI
(248) 987-6182`
}
