import { LIVE_VIDEO_VISIT_NOTE } from "@/lib/us-states"

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
export const PHARMACY_DBA = "Clear Choice Pharmacy"
/** Zelle identifier enrolled on the pharmacy business account. The transfer shows LEGAL_BUSINESS_NAME. */
export const ZELLE_PAYMENT_EMAIL = "payment@optimedsrx.com"
/** Venmo uses the same business email until card payments are turned on. */
export const CASH_PAY_TRANSFER_EMAIL = ZELLE_PAYMENT_EMAIL
export const CASH_PAY_INSTRUCTION =
  `After you submit, pay by Zelle or Venmo at ${CASH_PAY_TRANSFER_EMAIL}. The payment shows as ${LEGAL_BUSINESS_NAME}. Put your name in the memo. The intake is sent for review after the payment arrives. If treatment is not approved, the pharmacy refunds you. If the name on the Zelle or Venmo screen is different, call (248) 987-6182 and do not send the payment.`
export const MICHIGAN_PHARMACY_LICENSE = "5301013716"
export const PHARMACY_STREET = "8276 Merriman Rd"
export const PHARMACY_CITY = "Westland"
export const PHARMACY_STATE = "MI"
export const PHARMACY_ZIP = "48185"
export const PHARMACY_ADDRESS_LINE = `${PHARMACY_STREET}, ${PHARMACY_CITY}, ${PHARMACY_STATE} ${PHARMACY_ZIP}`

/** Telehealth group that reviews weight-loss, hormone, and ED intakes. */
export const TELEHEALTH_PROVIDER = "Ola Health"
/** Routes an approved compounded prescription to a compounding pharmacy licensed to dispense in the patient's state. */
export const FULFILLMENT_PHARMACY = "RxAve"
/** Shown wherever a patient can select a dose, strength, or program. */
export const PHYSICIAN_DECIDES_DOSE =
  "A licensed physician will decide the appropriate dose for you."
/** Shown next to each compounded product name and price. */
export const COMPOUNDED_MEDICATION_DISCLOSURE =
  "This medication is compounded. It is not FDA-approved and is not a commercially manufactured product. A licensed physician will decide whether it is appropriate for you."

/**
 * Weight loss, hormone therapy, and ED are reviewed by Ola Health. RxAve routes
 * an approved prescription to a compounding pharmacy licensed to dispense in the patient's state. Clear Choice is
 * licensed only in Michigan and does not compound or dispense compounded medication.
 */
export const INTAKE_SERVICE_AREA =
  "every U.S. state and the District of Columbia except Alaska, Mississippi, and New Jersey"

export const NATIONAL_PARTNER_CARE_NOTE =
  `Patients in ${INTAKE_SERVICE_AREA} can start an intake for weight loss, hormone therapy, and ED medication. Ola Health reviews it through a clinician licensed in the patient's state. If treatment is approved, RxAve routes an approved prescription to a compounding pharmacy licensed to dispense in the patient's state, which dispenses and ships the compounded medication. Clear Choice Pharmacy is licensed in Michigan only and does not compound or dispense compounded medications. Non-compounded prescriptions Clear Choice dispenses itself stay limited to Michigan patients. ${LIVE_VIDEO_VISIT_NOTE}`

export const HORMONE_THERAPY_CONTROLLED_NOTE =
  "Testosterone therapy is for patients with low testosterone. It is a Schedule III controlled medication and is not offered for athletic performance or bodybuilding. Submit laboratory results from the last 12 months with the intake. A licensed physician reviews those results and decides whether treatment is appropriate. The intake cannot be submitted without the lab report."

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

