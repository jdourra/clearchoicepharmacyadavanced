import { CONTACT_EMAIL, SITE_URL } from "@/lib/site-config"
import { PRIMARY_PHYSICIAN } from "@/lib/clinical-provider"

export const INTAKE_PAYMENT_REMINDER_SUBJECT =
  "Your prescription is approved — payment due at Clear Choice Pharmacy"

export function buildIntakePharmacyPaymentReminderEmail(params: {
  firstName?: string | null
  serviceLabel: string
  submissionId: string
  amountLabel?: string | null
  accountUrl?: string
}): { text: string; html: string } {
  const greeting = params.firstName?.trim() ? `Hi ${params.firstName.trim()},` : "Hi,"
  const accountUrl = params.accountUrl || `${SITE_URL.replace(/\/$/, "")}/account?tab=orders`
  const amountLine = params.amountLabel
    ? `Amount due: ${params.amountLabel} (pay at the pharmacy — card terminal, phone, or cash).`
    : "Pay at Clear Choice Pharmacy in Novi by card terminal, phone, or cash."

  const text = `${greeting}

Your ${params.serviceLabel} intake (Reference: ${params.submissionId}) has been approved by ${PRIMARY_PHYSICIAN.name}.

${amountLine}

Visit us or call ${PRIMARY_PHYSICIAN.pharmacyPhone} to arrange payment. Once paid, we prepare and ship your medication.

View your account: ${accountUrl}

— Clear Choice Pharmacy
40890 Grand River Ave, Novi, MI 48375
${CONTACT_EMAIL}`

  const html = `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">
  <p>${greeting}</p>
  <p>Your <strong>${params.serviceLabel}</strong> intake (Reference: <strong>${params.submissionId}</strong>) has been approved by ${PRIMARY_PHYSICIAN.name}.</p>
  <p>${amountLine.replace("Amount due:", "<strong>Amount due:</strong>")}</p>
  <p>Visit us or call <a href="tel:+12489876182">${PRIMARY_PHYSICIAN.pharmacyPhone}</a> to arrange payment. Once paid, we prepare and ship your medication.</p>
  <p style="margin: 24px 0;">
    <a href="${accountUrl}" style="display: inline-block; background: #0d9488; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: 600;">View your patient portal</a>
  </p>
  <p style="margin-top: 32px; color: #666; font-size: 14px;">
    — Clear Choice Pharmacy<br>
    40890 Grand River Ave, Novi, MI 48375<br>
    <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>
  </p>
</body>
</html>`

  return { text, html }
}

export const INTAKE_SHIPPED_SUBJECT = "Your order has shipped | Clear Choice Pharmacy"

export function buildIntakeShippedEmail(params: {
  firstName?: string | null
  serviceLabel: string
  submissionId: string
}): { text: string; html: string } {
  const greeting = params.firstName?.trim() ? `Hi ${params.firstName.trim()},` : "Hi,"
  const accountUrl = `${SITE_URL.replace(/\/$/, "")}/account?tab=orders`

  const text = `${greeting}

Great news — your ${params.serviceLabel} order (Reference: ${params.submissionId}) has shipped from Clear Choice Pharmacy.

You should receive it within a few business days depending on shipping. Track updates in your patient portal: ${accountUrl}

Questions? Call ${PRIMARY_PHYSICIAN.pharmacyPhone}.

— Clear Choice Pharmacy`

  const html = `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">
  <p>${greeting}</p>
  <p>Great news — your <strong>${params.serviceLabel}</strong> order (Reference: <strong>${params.submissionId}</strong>) has <strong>shipped</strong> from Clear Choice Pharmacy.</p>
  <p>You should receive it within a few business days depending on shipping.</p>
  <p><a href="${accountUrl}">View your patient portal</a></p>
  <p>Questions? Call <a href="tel:+12489876182">${PRIMARY_PHYSICIAN.pharmacyPhone}</a>.</p>
  <p style="margin-top: 32px; color: #666; font-size: 14px;">— Clear Choice Pharmacy</p>
</body>
</html>`

  return { text, html }
}
