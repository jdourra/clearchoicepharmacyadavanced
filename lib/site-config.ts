/** Canonical site URLs and contact info for Clear Choice Pharmacy */
const PRODUCTION_HOSTS = new Set(["clearchoicepharmacy.com", "www.clearchoicepharmacy.com"])

/**
 * The live site redirects the bare domain to www. Canonicals and the sitemap
 * must use that same host, or Google is sent to a URL that immediately redirects.
 */
export function canonicalSiteUrl(raw?: string | null): string {
  const fallback = "https://www.clearchoicepharmacy.com"
  const value = (raw || fallback).trim().replace(/\/$/, "")
  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`)
    if (PRODUCTION_HOSTS.has(url.hostname)) {
      return fallback
    }
    return url.origin
  } catch {
    return fallback
  }
}

export const SITE_URL = canonicalSiteUrl(process.env.NEXT_PUBLIC_SITE_URL)

export const CONTACT_EMAIL = "info@clearchoicepharmacy.com"
export const INTAKE_EMAIL = "intake@clearchoicepharmacy.com"

/** Legal identity shown for pharmacy certification. */
export const LEGAL_BUSINESS_NAME = "Optimeds Pharmacy LLC"
export const PHARMACY_OWNER = "Dr. Hadi Dourra"
export const PHARMACY_DBA = "Clear Choice Pharmacy"
/** Zelle identifier enrolled on the pharmacy business account. The transfer shows LEGAL_BUSINESS_NAME. */
export const ZELLE_PAYMENT_EMAIL = "payment@optimedsrx.com"
export const MICHIGAN_PHARMACY_LICENSE = "5301013716"
export const PHARMACY_STREET = "40890 Grand River"
export const PHARMACY_CITY = "Novi"
export const PHARMACY_STATE = "MI"
export const PHARMACY_ZIP = "48375"
export const PHARMACY_ADDRESS_LINE = `${PHARMACY_STREET}, ${PHARMACY_CITY}, ${PHARMACY_STATE} ${PHARMACY_ZIP}`

/** Telehealth group that reviews weight-loss, hormone, and ED intakes. */
export const TELEHEALTH_PROVIDER = "Ola Health"
/** Pharmacy fulfillment for 503A compounded medications. */
export const FULFILLMENT_PHARMACY = "RxAve"

/**
 * Weight loss, hormone therapy, and ED are reviewed by Ola Health and fulfilled
 * by RxAve. Clear Choice is licensed only in Michigan and does not compound or
 * dispense compounded medication.
 */
export const NATIONAL_PARTNER_CARE_NOTE =
  "Patients in every U.S. state and the District of Columbia can start an intake for weight loss, hormone therapy, and ED medication. Ola Health reviews it through a clinician licensed in the patient's state. If treatment is approved, RxAve fulfills and ships the compounded medication. Clear Choice Pharmacy is licensed in Michigan only and does not compound or dispense compounded medications. Non-compounded prescriptions Clear Choice dispenses itself stay limited to Michigan patients. A few states require a live video visit."

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
