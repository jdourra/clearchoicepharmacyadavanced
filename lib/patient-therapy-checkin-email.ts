import { CONTACT_EMAIL, SITE_URL } from "@/lib/site-config"
import { PRIMARY_PHYSICIAN } from "@/lib/clinical-provider"

export const THERAPY_CHECKIN_SUBJECT =
  "Quick check-in before your next month of therapy | Clear Choice Pharmacy"

export function buildTherapyCheckInEmail(params: {
  firstName?: string | null
  medicationLabel: string
  monthLabel: string
  doseLabel: string
  checkInUrl: string
}): { text: string; html: string } {
  const greeting = params.firstName?.trim() ? `Hi ${params.firstName.trim()},` : "Hi,"
  const accountUrl = `${SITE_URL.replace(/\/$/, "")}/account?tab=therapy`

  const text = `${greeting}

${PRIMARY_PHYSICIAN.name} and Clear Choice Pharmacy would like a quick update on how you are doing on ${params.medicationLabel} (${params.doseLabel}) for ${params.monthLabel}.

Please tell us:
• Are you tolerating the medication well?
• Have you lost weight (approx. lbs)?
• Any side effects or concerns?

Complete your check-in: ${params.checkInUrl}
Or open your patient portal: ${accountUrl}

This helps ${PRIMARY_PHYSICIAN.name} decide whether to continue your current dose or adjust it before your next kit.

Questions? Call ${PRIMARY_PHYSICIAN.pharmacyPhone}.

— Clear Choice Pharmacy
${CONTACT_EMAIL}`

  const html = `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">
  <p>${greeting}</p>
  <p><strong>${PRIMARY_PHYSICIAN.name}</strong> and Clear Choice Pharmacy would like a quick update on how you are doing on <strong>${params.medicationLabel}</strong> (<strong>${params.doseLabel}</strong>) for <strong>${params.monthLabel}</strong>.</p>
  <p>Please tell us:</p>
  <ul>
    <li>Are you tolerating the medication well?</li>
    <li>Have you lost weight (approx. lbs)?</li>
    <li>Any side effects or concerns?</li>
  </ul>
  <p style="margin: 24px 0;">
    <a href="${params.checkInUrl}" style="display: inline-block; background: #0d9488; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: 600;">Complete check-in</a>
  </p>
  <p><a href="${accountUrl}">Open your patient portal</a></p>
  <p>This helps ${PRIMARY_PHYSICIAN.name} decide whether to continue your current dose or adjust it before your next kit.</p>
  <p>Questions? Call <a href="tel:+12489876182">${PRIMARY_PHYSICIAN.pharmacyPhone}</a>.</p>
  <p style="margin-top: 32px; color: #666; font-size: 14px;">
    — Clear Choice Pharmacy<br>
    <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>
  </p>
</body>
</html>`

  return { text, html }
}
