/**
 * Telehealth partner integration — shared types and status workflow.
 *
 * MVP (manual): intake saved to DB + clinician email queue.
 * Partner live: set TELEHEALTH_PARTNER + partner API env vars; webhook updates status.
 *
 * IV flow:
 *   pending_provider_review → rx_at_pharmacy → preparing → ready_for_dispatch → dispatched
 */

import type { IntakePaymentMetadata } from "@/lib/intake-payment"
import type { InjectionTelehealthConsentValues } from "@/lib/injection-telehealth-consents"
export type TelehealthPartnerId = "manual" | "beluga" | "openloop" | "wheel"

export type ClinicalServiceType =
  | "mens_health"
  | "trt"
  | "weight_loss"
  | "iv_rejuvenation"
  | "rejuvenation_vial"

export type IvBookingStatus =
  | "pending_provider_review"
  | "provider_denied"
  | "provider_follow_up"
  | "rx_at_pharmacy"
  | "preparing"
  | "ready_for_dispatch"
  | "dispatched"
  | "completed"
  | "cancelled"

export type IvIntakePayload = {
  serviceType: "iv_rejuvenation"
  submissionId: string
  submittedAt: string
  pharmacy: {
    name: "Clear Choice Pharmacy"
    ncpdpId: string | null
    address: string
  }
  patient: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  dispatch: {
    serviceAddress: string
    serviceCity: string
    serviceState: string
    serviceZip: string
    preferredDate: string | null
    preferredTimeWindow: string
  }
  treatment: {
    selectedPackage: string
    selectedPackageTitle: string | null
    selectedBoosters: string[]
    estimatedTotal: number | null
  }
  screening: {
    kidneyDisease: string | null
    heartCondition: string | null
    pregnantOrBreastfeeding: boolean
    allergies: string | null
    currentMedications: string | null
    additionalNotes: string | null
  }
  consents: {
    agreeToTerms: boolean
    agreeToTelehealth: boolean
    agreeToPrivacy?: boolean
    authorizeHold?: boolean
  }
  injectionConsents?: InjectionTelehealthConsentValues
  payment?: IntakePaymentMetadata
}

export type PartnerSubmitResult = {
  success: boolean
  partnerCaseId?: string
  partnerStatus?: string
  mode: "manual" | "api"
  error?: string
}

export type TelehealthWebhookEvent = {
  event:
    | "intake.submitted"
    | "provider.approved"
    | "provider.denied"
    | "provider.follow_up_required"
    | "prescription.sent_to_pharmacy"
  submissionId: string
  serviceType: ClinicalServiceType
  partnerCaseId?: string
  message?: string
  prescription?: {
    pharmacyNcpdp?: string
    rxReference?: string
  }
}

export const CLEAR_CHOICE_PHARMACY = {
  name: "Clear Choice Pharmacy",
  streetAddress: "40890 Grand River Ave",
  city: "Novi",
  state: "MI",
  zip: "48375",
  phone: "(248) 987-6182",
  ncpdpEnvKey: "CLEAR_CHOICE_NCPDP_ID",
} as const

export function getActiveTelehealthPartner(): TelehealthPartnerId {
  const partner = process.env.TELEHEALTH_PARTNER?.toLowerCase()
  if (partner === "beluga" || partner === "openloop" || partner === "wheel") {
    return partner
  }
  return "manual"
}

export function getPharmacyNcpdpId(): string | null {
  return process.env.CLEAR_CHOICE_NCPDP_ID || process.env.PHARMACY_NCPDP_ID || null
}
