import { CONTACT_EMAIL, SITE_URL } from "@/lib/site-config"

export const SIGNUP_FOLLOWUP_SUBJECT = "Can we help with your prescription? | Clear Choice Pharmacy"

export function buildSignupFollowupEmail(params: {
  firstName?: string | null
}): { text: string; html: string } {
  const greeting = params.firstName?.trim() ? `Hi ${params.firstName.trim()},` : "Hi,"
  const prescriptionsUrl = `${SITE_URL.replace(/\/$/, "")}/prescriptions`
  const medicationsUrl = `${SITE_URL.replace(/\/$/, "")}/medications`

  const text = `${greeting}

Thanks for creating an account with Clear Choice Pharmacy in Novi, MI. We wanted to check in — sometimes people pause because of pricing questions, transferring a prescription, or not having a script yet.

We're happy to help with:
• A quick price lookup for your medication
• Transferring a prescription from another pharmacy
• Our $40 telemedicine visit if you need a new prescription

Look up prices: ${prescriptionsUrl}
Build a medication list: ${medicationsUrl}

Reply to this email or call us at (248) 987-6182 if you have any questions. No pressure — we're here when you're ready.

— Clear Choice Pharmacy
40890 Grand River Ave, Novi, MI 48375
${CONTACT_EMAIL}`

  const html = `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">
  <p>${greeting}</p>
  <p>Thanks for creating an account with <strong>Clear Choice Pharmacy</strong> in Novi, MI. We wanted to check in — sometimes people pause because of pricing questions, transferring a prescription, or not having a script yet.</p>
  <p>We're happy to help with:</p>
  <ul>
    <li>A quick price lookup for your medication</li>
    <li>Transferring a prescription from another pharmacy</li>
    <li>Our $40 telemedicine visit if you need a new prescription</li>
  </ul>
  <p style="margin: 24px 0;">
    <a href="${prescriptionsUrl}" style="display: inline-block; background: #0d9488; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: 600;">Look up prescription prices</a>
  </p>
  <p><a href="${medicationsUrl}">Build your medication cost list</a></p>
  <p>Reply to this email or call us at <a href="tel:+12489876182">(248) 987-6182</a> if you have any questions. No pressure — we're here when you're ready.</p>
  <p style="margin-top: 32px; color: #666; font-size: 14px;">
    — Clear Choice Pharmacy<br>
    40890 Grand River Ave, Novi, MI 48375<br>
    <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>
  </p>
</body>
</html>`

  return { text, html }
}
