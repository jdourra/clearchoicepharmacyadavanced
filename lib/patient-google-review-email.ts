import { CONTACT_EMAIL, GOOGLE_REVIEW_URL, SITE_URL } from "@/lib/site-config"

export const GOOGLE_REVIEW_REQUEST_SUBJECT =
  "How was your experience? | Clear Choice Pharmacy"

export function buildGoogleReviewRequestEmail(params: {
  firstName?: string | null
  reviewUrl?: string
}): { text: string; html: string } {
  const greeting = params.firstName?.trim() ? `Hi ${params.firstName.trim()},` : "Hi,"
  const reviewUrl = params.reviewUrl || GOOGLE_REVIEW_URL
  const siteUrl = SITE_URL.replace(/\/$/, "")

  const text = `${greeting}

Thank you for choosing Clear Choice Pharmacy in Novi. We hope your prescription and service met your expectations.

If you had a good experience, would you take a minute to leave us a Google review? It helps other patients in our community find trusted local care.

Leave a Google review: ${reviewUrl}

If anything could have gone better, please reply to this email or call us at (248) 987-6182 — we'd rather hear from you directly so we can make it right.

— Clear Choice Pharmacy
40890 Grand River Ave, Novi, MI 48375
${CONTACT_EMAIL}
${siteUrl}`

  const html = `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">
  <p>${greeting}</p>
  <p>Thank you for choosing <strong>Clear Choice Pharmacy</strong> in Novi. We hope your prescription and service met your expectations.</p>
  <p>If you had a good experience, would you take a minute to leave us a <strong>Google review</strong>? It helps other patients in our community find trusted local care.</p>
  <p style="margin: 24px 0;">
    <a href="${reviewUrl}" style="display: inline-block; background: #0d9488; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: 600;">Leave a Google review</a>
  </p>
  <p>If anything could have gone better, please reply to this email or call us at <a href="tel:+12489876182">(248) 987-6182</a> — we'd rather hear from you directly so we can make it right.</p>
  <p style="margin-top: 32px; color: #666; font-size: 14px;">
    — Clear Choice Pharmacy<br>
    40890 Grand River Ave, Novi, MI 48375<br>
    <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>
  </p>
</body>
</html>`

  return { text, html }
}
