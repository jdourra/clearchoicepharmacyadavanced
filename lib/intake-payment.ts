export type IntakePaymentValues = {
  idFrontFile: File | null
  idBackFile: File | null
  idFrontKey: string | null
  idBackKey: string | null
  idFrontUploading: boolean
  idBackUploading: boolean
  stripePaymentIntentId: string | null
  paymentAuthorized: boolean
}

export const emptyIntakePaymentValues: IntakePaymentValues = {
  idFrontFile: null,
  idBackFile: null,
  idFrontKey: null,
  idBackKey: null,
  idFrontUploading: false,
  idBackUploading: false,
  stripePaymentIntentId: null,
  paymentAuthorized: false,
}

export function getIntakePaymentInvalidFields(values: IntakePaymentValues): string[] {
  const fields: string[] = []
  if (values.idFrontUploading || values.idBackUploading) fields.push("idUploading")
  if (!values.idFrontKey) fields.push("idFrontFile")
  if (!values.idBackKey) fields.push("idBackFile")
  if (!values.paymentAuthorized || !values.stripePaymentIntentId) fields.push("stripePayment")
  return fields
}

/** ID uploads only — used when payment is collected at the pharmacy terminal after approval. */
export function getIntakeIdentityInvalidFields(values: IntakePaymentValues): string[] {
  const fields: string[] = []
  if (values.idFrontUploading || values.idBackUploading) fields.push("idUploading")
  if (!values.idFrontKey) fields.push("idFrontFile")
  if (!values.idBackKey) fields.push("idBackFile")
  return fields
}

export function validateIntakePayment(values: IntakePaymentValues): {
  valid: boolean
  fields: string[]
  message: string
} {
  const fields = getIntakePaymentInvalidFields(values)
  if (fields.includes("idUploading")) {
    return { valid: false, fields, message: "Please wait for ID uploads to finish." }
  }
  if (fields.length > 0) {
    return {
      valid: false,
      fields,
      message: "Please upload your ID and authorize payment before submitting.",
    }
  }
  return { valid: true, fields: [], message: "" }
}

export function validateIntakeIdentityOnly(values: IntakePaymentValues): {
  valid: boolean
  fields: string[]
  message: string
} {
  const fields = getIntakeIdentityInvalidFields(values)
  if (fields.includes("idUploading")) {
    return { valid: false, fields, message: "Please wait for ID uploads to finish." }
  }
  if (fields.length > 0) {
    return {
      valid: false,
      fields,
      message: "Please upload front and back of your photo ID before submitting.",
    }
  }
  return { valid: true, fields: [], message: "" }
}

/** Metadata safe to send to the server — never include card numbers. */
export function paymentCapturedOnClient(values: IntakePaymentValues) {
  return {
    idFrontUploaded: Boolean(values.idFrontKey),
    idBackUploaded: Boolean(values.idBackKey),
    idFrontKey: values.idFrontKey,
    idBackKey: values.idBackKey,
    paymentOnFile: values.paymentAuthorized,
    stripePaymentIntentId: values.stripePaymentIntentId,
  }
}

export type IntakePaymentMetadata = ReturnType<typeof paymentCapturedOnClient>

export type IntakeConsents = {
  agreeToTerms?: boolean
  agreeToTelehealth?: boolean
  agreeToPrivacy?: boolean
  authorizeHold?: boolean
  /** Weight-loss pay-at-pharmacy acknowledgement (no online card charge). */
  acknowledgePayAtPharmacy?: boolean
}

export function requireIntakePaymentSubmission(
  consents?: IntakeConsents,
  payment?: IntakePaymentMetadata
): string | null {
  if (!payment?.idFrontKey || !payment?.idBackKey) {
    return "Photo ID uploads are required before submission."
  }
  if (!payment?.stripePaymentIntentId || !payment?.paymentOnFile) {
    return "Payment authorization is required before submission."
  }
  if (!consents?.authorizeHold) {
    return "Payment authorization consent is required before submission."
  }
  return null
}

/** Weight-loss path: ID + pay-at-pharmacy acknowledgement; no Stripe hold. */
export function requireIntakeIdentitySubmission(
  consents?: IntakeConsents,
  payment?: IntakePaymentMetadata
): string | null {
  if (!payment?.idFrontKey || !payment?.idBackKey) {
    return "Photo ID uploads are required before submission."
  }
  if (!consents?.acknowledgePayAtPharmacy) {
    return "Please acknowledge that payment is collected at the pharmacy after clinician approval."
  }
  return null
}

export function formatPaymentSummary(
  payment?: IntakePaymentMetadata,
  consents?: IntakeConsents
): string {
  const payAtPharmacy = Boolean(consents?.acknowledgePayAtPharmacy) && !payment?.stripePaymentIntentId
  return `
ID Front Stored:        ${payment?.idFrontKey ? "✓ Yes" : "✗ No"}
ID Back Stored:         ${payment?.idBackKey ? "✓ Yes" : "✗ No"}
Stripe Payment Intent:  ${payment?.stripePaymentIntentId || "—"}
Payment Authorized:     ${
    payAtPharmacy
      ? "Pay at pharmacy after approval (no online hold)"
      : payment?.paymentOnFile
        ? "✓ Hold placed"
        : "✗ Not Authorized"
  }
Payment Consent:        ${
    payAtPharmacy
      ? consents?.acknowledgePayAtPharmacy
        ? "✓ Pay at pharmacy acknowledged"
        : "✗ Not acknowledged"
      : consents?.authorizeHold
        ? "✓ Authorized"
        : "✗ Not Authorized"
  }
`.trim()
}
