/** Canonical site URLs and contact info for Clear Choice Pharmacy */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://clearchoicepharmacy.com"

export const CONTACT_EMAIL = "info@clearchoicepharmacy.com"
export const INTAKE_EMAIL = "intake@clearchoicepharmacy.com"

/** Legal identity shown for pharmacy certification. */
export const LEGAL_BUSINESS_NAME = "LNR Associates LLC"
export const PHARMACY_DBA = "Clear Choice Pharmacy"
/** Zelle identifier enrolled on the pharmacy business account. The transfer shows LEGAL_BUSINESS_NAME. */
export const ZELLE_PAYMENT_EMAIL = "payment@clearchoicepharmacy.com"
export const PHARMACIST_IN_CHARGE = "Joseph Dourra"
export const MICHIGAN_PHARMACY_LICENSE = "5301013716"

/**
 * Weight loss, hormone therapy, and ED are reviewed and filled through licensed
 * partners in the patient's state. Clear Choice's own Michigan license does not
 * cover dispensing those medications nationwide.
 */
export const NATIONAL_PARTNER_CARE_NOTE =
  "Patients in every U.S. state and the District of Columbia can start an intake for weight loss, hormone therapy, and ED medication. A clinician licensed in your state reviews it. If treatment is approved, a pharmacy licensed to dispense in your state fills and ships it. Clear Choice Pharmacy is licensed in Michigan and dispenses its own prescriptions only to Michigan patients. A few states require a live video visit."

export const HORMONE_THERAPY_CONTROLLED_NOTE =
  "Testosterone is a Schedule III controlled medication. It is prescribed only when a clinician licensed in your state decides it is medically appropriate. It is not offered for athletic performance or bodybuilding."

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
