import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { CLEAR_CHOICE_PHARMACY } from "@/lib/telehealth/types"
import { formatPaymentSummary, requireIntakePaymentSubmission, type IntakePaymentMetadata } from "@/lib/intake-payment"
import { verifyPaymentHoldReady } from "@/lib/stripe-server"
import { submitClinicalIntakeToPartner } from "@/lib/telehealth/submit-clinical-intake"
import { STANDARD_INTAKE_STATUS } from "@/lib/telehealth/intake-status"
import {
  formatInjectionConsentsSummary,
  validateInjectionTelehealthConsents,
  type InjectionTelehealthConsentValues,
} from "@/lib/injection-telehealth-consents"
import { requireMichiganState } from "@/lib/michigan-eligibility"

function formatClinicianSummary(data: Record<string, unknown>, submissionId: string): string {
  return `
═══════════════════════════════════════════════════════════════════════════════
        REJUVENATION VIAL INTAKE — CLEAR CHOICE PHARMACY (MICHIGAN)
═══════════════════════════════════════════════════════════════════════════════
Submission ID: ${submissionId}
Submitted:     ${new Date().toISOString()}
Status:        PENDING PROVIDER REVIEW

FULFILLMENT PHARMACY (on approval):
  ${CLEAR_CHOICE_PHARMACY.name}
  ${CLEAR_CHOICE_PHARMACY.streetAddress}, ${CLEAR_CHOICE_PHARMACY.city}, ${CLEAR_CHOICE_PHARMACY.state} ${CLEAR_CHOICE_PHARMACY.zip}

───────────────────────────────────────────────────────────────────────────────
                              PATIENT CONTACT
───────────────────────────────────────────────────────────────────────────────
Name:   ${data.firstName} ${data.lastName}
Email:  ${data.email}
Phone:  ${data.phone}

───────────────────────────────────────────────────────────────────────────────
                              SHIPPING ADDRESS
───────────────────────────────────────────────────────────────────────────────
${data.shippingAddress}, ${data.shippingCity}, ${data.shippingState} ${data.shippingZip}

───────────────────────────────────────────────────────────────────────────────
                              VIAL SELECTION
───────────────────────────────────────────────────────────────────────────────
Kit:   ${data.selectedVialTitle || data.selectedVial}
Price: $${data.kitPrice ?? "—"}

───────────────────────────────────────────────────────────────────────────────
                           CLINICAL SCREENING
───────────────────────────────────────────────────────────────────────────────
Kidney Disease:     ${data.kidneyDisease || "not answered"}
Heart Condition:    ${data.heartCondition || "not answered"}
Pregnant/BF:        ${data.pregnantOrBreastfeeding ? "YES" : "No"}
Allergies:          ${data.allergies || "None reported"}
Current Meds:       ${data.currentMedications || "None reported"}

Notes:
${data.additionalNotes || "None"}

───────────────────────────────────────────────────────────────────────────────
                           IDENTITY & PAYMENT
───────────────────────────────────────────────────────────────────────────────
${formatPaymentSummary(data.payment as IntakePaymentMetadata, {
  authorizeHold: data.authorizeHold,
})}

───────────────────────────────────────────────────────────────────────────────
                        TELEMEDICINE CONSENTS
───────────────────────────────────────────────────────────────────────────────
${data.injectionConsents ? formatInjectionConsentsSummary(data.injectionConsents as InjectionTelehealthConsentValues) : "Not provided"}

═══════════════════════════════════════════════════════════════════════════════
CLINICIAN ACTION:
1. Review screening and approve/deny via telehealth
2. Issue patient-specific eRx routed to Clear Choice Pharmacy (Novi, MI)
3. Pharmacy compounds homekit → ship to patient address
═══════════════════════════════════════════════════════════════════════════════
`
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    if (!data.firstName || !data.lastName || !data.email || !data.phone) {
      return NextResponse.json({ error: "Missing required contact information" }, { status: 400 })
    }

    if (!data.selectedVial) {
      return NextResponse.json({ error: "Please select a rejuvenation vial kit" }, { status: 400 })
    }

    if (!data.shippingAddress || !data.shippingCity || !data.shippingState || !data.shippingZip) {
      return NextResponse.json({ error: "Complete shipping address is required" }, { status: 400 })
    }

    const miError = requireMichiganState(data.shippingState, "Shipping state")
    if (miError) {
      return NextResponse.json({ error: miError }, { status: 403 })
    }

    const paymentError = requireIntakePaymentSubmission(
      { authorizeHold: data.authorizeHold },
      data.payment
    )
    if (paymentError) {
      return NextResponse.json({ error: paymentError }, { status: 400 })
    }

    const stripeCheck = await verifyPaymentHoldReady(data.payment?.stripePaymentIntentId || "")
    if (!stripeCheck.ok) {
      return NextResponse.json({ error: stripeCheck.error || "Payment not authorized" }, { status: 400 })
    }

    if (!data.injectionConsents) {
      return NextResponse.json({ error: "Telemedicine consents are required before submission." }, { status: 400 })
    }

    const consentError = validateInjectionTelehealthConsents(
      data.injectionConsents as InjectionTelehealthConsentValues,
      { variant: "rejuvenation-vial" }
    )
    if (!consentError.valid) {
      return NextResponse.json({ error: consentError.message }, { status: 400 })
    }

    if (data.pregnantOrBreastfeeding) {
      return NextResponse.json(
        {
          error: "Injectable vitamin therapy requires in-person medical evaluation during pregnancy or breastfeeding.",
          hardStop: true,
        },
        { status: 422 }
      )
    }

    const submissionId = `CCR-VIAL-${Date.now().toString(36).toUpperCase()}`
    const clinicalSummary = formatClinicianSummary(data, submissionId)

    const partnerResult = await submitClinicalIntakeToPartner({
      serviceType: "rejuvenation_vial",
      submissionId,
      patient: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
      },
      clinicalSummary,
    })

    if (!partnerResult.success) {
      return NextResponse.json({ error: partnerResult.error || "Failed to queue intake" }, { status: 502 })
    }

    try {
      await sql(
        `INSERT INTO rejuvenation_vial_intakes (
          id, first_name, last_name, email, phone,
          shipping_address, shipping_city, shipping_state, shipping_zip,
          selected_vial, selected_vial_title, kit_price,
          allergies, current_medications, pregnant_or_breastfeeding,
          kidney_disease, heart_condition, additional_notes,
          status, stripe_payment_intent_id, id_front_key, id_back_key, partner_name, partner_status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
          $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
        )`,
        [
          submissionId,
          data.firstName,
          data.lastName,
          data.email,
          data.phone,
          data.shippingAddress,
          data.shippingCity,
          data.shippingState,
          data.shippingZip,
          data.selectedVial,
          data.selectedVialTitle || null,
          data.kitPrice ?? null,
          data.allergies || null,
          data.currentMedications || null,
          data.pregnantOrBreastfeeding || false,
          data.kidneyDisease || null,
          data.heartCondition || null,
          data.additionalNotes || null,
          STANDARD_INTAKE_STATUS.pending,
          data.payment?.stripePaymentIntentId || null,
          data.payment?.idFrontKey || null,
          data.payment?.idBackKey || null,
          partnerResult.partnerName,
          partnerResult.partnerStatus || "queued_for_manual_review",
        ]
      )
    } catch (dbError) {
      console.error("Failed to save vial intake:", dbError)
      return NextResponse.json({ error: "Failed to save your submission. Please try again." }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message:
        "Your intake has been securely submitted. A licensed telehealth provider will review your request. If approved, your home injection kit will be compounded and shipped from Clear Choice Pharmacy.",
      submissionId,
      status: STANDARD_INTAKE_STATUS.pending,
      estimatedReviewTime: "2-4 business hours",
      fulfillmentPharmacy: CLEAR_CHOICE_PHARMACY.name,
    })
  } catch (error) {
    console.error("Vial intake error:", error)
    return NextResponse.json({ error: "Failed to process submission. Please try again." }, { status: 500 })
  }
}
