export const INJECTION_CONSENT_URLS = {
  /** Set when Clear Choice publishes its own injection video page. */
  howToInject: "",
  refundPolicy: "https://clearchoicepharmacy.com/refund-policy",
  telehealthConsent: "https://clearchoicepharmacy.com/telehealth-consent",
  terms: "https://clearchoicepharmacy.com/terms-and-conditions",
  privacy: "https://clearchoicepharmacy.com/privacy",
} as const

export type InjectionConsentVariant =
  | "weight-loss"
  | "rejuvenation-vial"
  | "trt"
  | "iv-rejuvenation"
  | "specialty-pharmacy"

export type InjectionTelehealthConsentValues = {
  watchedInjectionVideo: boolean
  followBottleInstructions: boolean
  understand28DayExpiration: boolean
  compounding503ADisclosure: boolean
  homeInjectionConsent: boolean
  noReturnsRefundPolicy: boolean
  telehealthConsent: boolean
  termsAndConditions: boolean
  agreeToPrivacy: boolean
  eSignName: string
}

export const emptyInjectionTelehealthConsents: InjectionTelehealthConsentValues = {
  watchedInjectionVideo: false,
  followBottleInstructions: false,
  understand28DayExpiration: false,
  compounding503ADisclosure: false,
  homeInjectionConsent: false,
  noReturnsRefundPolicy: false,
  telehealthConsent: false,
  termsAndConditions: false,
  agreeToPrivacy: false,
  eSignName: "",
}

export function requiresSelfInjectionConsent(variant: InjectionConsentVariant, programId?: string): boolean {
  if (variant === "iv-rejuvenation" || variant === "specialty-pharmacy") return false
  if (variant === "weight-loss" || variant === "rejuvenation-vial") return true
  return variant === "trt" && programId === "testosterone-cypionate"
}

export function show28DayExpiration(variant: InjectionConsentVariant): boolean {
  return variant !== "iv-rejuvenation" && variant !== "specialty-pharmacy"
}

export function showTirzepatideAddendum(programId?: string): boolean {
  return programId === "tirzepatide"
}

export function getInjectionConsentInvalidFields(
  values: InjectionTelehealthConsentValues,
  options: { variant: InjectionConsentVariant; programId?: string }
): string[] {
  const fields: string[] = []
  const selfInject = requiresSelfInjectionConsent(options.variant, options.programId)

  if (selfInject && !values.watchedInjectionVideo) fields.push("watchedInjectionVideo")
  if (selfInject && !values.followBottleInstructions) fields.push("followBottleInstructions")
  if (show28DayExpiration(options.variant) && !values.understand28DayExpiration) {
    fields.push("understand28DayExpiration")
  }
  if (!values.compounding503ADisclosure) fields.push("compounding503ADisclosure")
  if (selfInject && !values.homeInjectionConsent) fields.push("homeInjectionConsent")
  if (!values.noReturnsRefundPolicy) fields.push("noReturnsRefundPolicy")
  if (!values.telehealthConsent) fields.push("telehealthConsent")
  if (!values.termsAndConditions) fields.push("termsAndConditions")
  if (!values.agreeToPrivacy) fields.push("agreeToPrivacy")

  const eSign = values.eSignName.trim()
  if (!eSign || eSign.split(/\s+/).length < 2) fields.push("eSignName")

  return fields
}

export function validateInjectionTelehealthConsents(
  values: InjectionTelehealthConsentValues,
  options: { variant: InjectionConsentVariant; programId?: string }
): { valid: boolean; fields: string[]; message: string } {
  const fields = getInjectionConsentInvalidFields(values, options)
  if (fields.length > 0) {
    return {
      valid: false,
      fields,
      message: "Please complete all required consent acknowledgments and e-sign with your full name.",
    }
  }
  return { valid: true, fields: [], message: "" }
}

export function formatInjectionConsentsSummary(values: InjectionTelehealthConsentValues): string {
  return `
Injection Video Watched:     ${values.watchedInjectionVideo ? "✓ Yes" : "✗ No"}
Follow Bottle Instructions:  ${values.followBottleInstructions ? "✓ Agreed" : "✗ Not Agreed"}
28-Day Expiration:           ${values.understand28DayExpiration ? "✓ Agreed" : "✗ Not Agreed"}
503A Compounding Disclosure: ${values.compounding503ADisclosure ? "✓ Agreed" : "✗ Not Agreed"}
Home Injection Consent:      ${values.homeInjectionConsent ? "✓ Agreed" : "✗ Not Agreed"}
No Returns / Refund Policy:  ${values.noReturnsRefundPolicy ? "✓ Agreed" : "✗ Not Agreed"}
Telehealth Consent:          ${values.telehealthConsent ? "✓ Agreed" : "✗ Not Agreed"}
Terms & Conditions:          ${values.termsAndConditions ? "✓ Agreed" : "✗ Not Agreed"}
HIPAA Privacy:               ${values.agreeToPrivacy ? "✓ Agreed" : "✗ Not Agreed"}
E-Sign Name:                 ${values.eSignName.trim() || "—"}
`.trim()
}
