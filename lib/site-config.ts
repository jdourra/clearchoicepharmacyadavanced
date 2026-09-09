/** Canonical site URLs and contact info for Clear Choice Pharmacy */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://clearchoicepharmacy.com"

export const CONTACT_EMAIL = "info@clearchoicepharmacy.com"
export const INTAKE_EMAIL = "intake@clearchoicepharmacy.com"

/**
 * Direct Google Business Profile review link.
 * Set GOOGLE_REVIEW_URL (or NEXT_PUBLIC_GOOGLE_REVIEW_URL) in Vercel to your
 * "Ask for reviews" / g.page/r/... URL from Google Business Profile.
 */
export const GOOGLE_REVIEW_URL =
  process.env.GOOGLE_REVIEW_URL?.trim() ||
  process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL?.trim() ||
  ""

export function isGoogleReviewUrlConfigured(): boolean {
  return Boolean(GOOGLE_REVIEW_URL)
}
