import { CONTACT_EMAIL, SITE_URL } from "@/lib/site-config"
import { formatSupplyLabel } from "@/lib/supply-reminder-schedule"

export const REFILL_REMINDER_SUBJECT =
  "Time to reorder — start early to stay on track | Clear Choice Pharmacy"

export function buildRefillReminderEmail(params: {
  firstName?: string | null
  productLabel: string
  supplyPeriodDays: number
  reorderUrl: string
}): { text: string; html: string } {
  const greeting = params.firstName?.trim() ? `Hi ${params.firstName.trim()},` : "Hi,"
  const supplyLabel = formatSupplyLabel(params.supplyPeriodDays)
  const accountUrl = `${SITE_URL.replace(/\/$/, "")}/account?tab=orders`

  const text = `${greeting}

Based on your ${supplyLabel} of ${params.productLabel}, you're about one week away from needing your next refill.

Start your order early so your medication arrives on time — compounding and shipping can take a few days.

Reorder now: ${params.reorderUrl}
View your account: ${accountUrl}

Questions? Reply to this email or call us at (248) 987-6182.

— Clear Choice Pharmacy
40890 Grand River Ave, Novi, MI 48375
${CONTACT_EMAIL}`

  const html = `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">
  <p>${greeting}</p>
  <p>Based on your <strong>${supplyLabel}</strong> of <strong>${params.productLabel}</strong>, you're about <strong>one week away</strong> from needing your next refill.</p>
  <p><strong>Start your order early</strong> so your medication arrives on time — compounding and shipping can take a few days.</p>
  <p style="margin: 24px 0;">
    <a href="${params.reorderUrl}" style="display: inline-block; background: #0d9488; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: 600;">Start your reorder</a>
  </p>
  <p><a href="${accountUrl}">View your orders in your patient portal</a></p>
  <p>Questions? Reply to this email or call us at <a href="tel:+12489876182">(248) 987-6182</a>.</p>
  <p style="margin-top: 32px; color: #666; font-size: 14px;">
    — Clear Choice Pharmacy<br>
    40890 Grand River Ave, Novi, MI 48375<br>
    <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>
  </p>
</body>
</html>`

  return { text, html }
}
