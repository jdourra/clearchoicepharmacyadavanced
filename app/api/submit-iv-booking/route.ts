import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { partnerDisplayName } from "@/lib/telehealth/partner-client"
import { submitClinicalIntakeToPartner } from "@/lib/telehealth/submit-clinical-intake"
import { STANDARD_INTAKE_STATUS } from "@/lib/telehealth/intake-status"
import {
  CLEAR_CHOICE_PHARMACY,
  getActiveTelehealthPartner,
  getPharmacyNcpdpId,
  type IvIntakePayload,
} from "@/lib/telehealth/types"
import { formatPaymentSummary, requireIntakePaymentSubmission } from "@/lib/intake-payment"
import { verifyPaymentHoldReady } from "@/lib/stripe-server"
import {
  formatInjectionConsentsSummary,
  validateInjectionTelehealthConsents,
  type InjectionTelehealthConsentValues,
} from "@/lib/injection-telehealth-consents"

/**
 * IV Rejuvenation intake API
 *
 * Workflow:
 * 1. Patient submits booking + clinical screening on clearchoicepharmacy.com
 * 2. Intake routed to telehealth partner (or manual clinician queue)
 * 3. On provider approval, partner sends eRx to Clear Choice Pharmacy (Michigan)
 * 4. Pharmacy prepares IV bag → RN dispatch scheduled
 */

function formatClinicianSummary(payload: IvIntakePayload, partnerLabel: string): string {
  const b = payload.treatment.selectedBoosters
  return `
═══════════════════════════════════════════════════════════════════════════════
           IV REJUVENATION INTAKE — CLEAR CHOICE PHARMACY (MICHIGAN)
═══════════════════════════════════════════════════════════════════════════════
Submission ID: ${payload.submissionId}
Submitted:     ${payload.submittedAt}
Status:        PENDING PROVIDER REVIEW
Telehealth:    ${partnerLabel}

FULFILLMENT PHARMACY (on approval):
  ${payload.pharmacy.name}
  NCPDP: ${payload.pharmacy.ncpdpId || "Configure CLEAR_CHOICE_NCPDP_ID"}
  ${payload.pharmacy.address}

───────────────────────────────────────────────────────────────────────────────
                              PATIENT CONTACT
───────────────────────────────────────────────────────────────────────────────
Name:   ${payload.patient.firstName} ${payload.patient.lastName}
Email:  ${payload.patient.email}
Phone:  ${payload.patient.phone}

───────────────────────────────────────────────────────────────────────────────
                           MOBILE DISPATCH LOCATION
───────────────────────────────────────────────────────────────────────────────
${payload.dispatch.serviceAddress}, ${payload.dispatch.serviceCity}, ${payload.dispatch.serviceState} ${payload.dispatch.serviceZip}

───────────────────────────────────────────────────────────────────────────────
                           APPOINTMENT PREFERENCE
───────────────────────────────────────────────────────────────────────────────
Preferred Date:   ${payload.dispatch.preferredDate || "Flexible / ASAP"}
Time Window:      ${payload.dispatch.preferredTimeWindow}

───────────────────────────────────────────────────────────────────────────────
                              IV SELECTION
───────────────────────────────────────────────────────────────────────────────
Package:  ${payload.treatment.selectedPackageTitle || payload.treatment.selectedPackage}
Boosters: ${b.length > 0 ? b.join(", ") : "None"}
Estimated Total: $${payload.treatment.estimatedTotal ?? "—"} (includes $50 mobile travel & dispatch)

───────────────────────────────────────────────────────────────────────────────
                           CLINICAL SCREENING
───────────────────────────────────────────────────────────────────────────────
Kidney Disease:     ${payload.screening.kidneyDisease || "not answered"}
Heart Condition:    ${payload.screening.heartCondition || "not answered"}
Pregnant/BF:        ${payload.screening.pregnantOrBreastfeeding ? "YES" : "No"}
Allergies:          ${payload.screening.allergies || "None reported"}
Current Meds:       ${payload.screening.currentMedications || "None reported"}

Notes:
${payload.screening.additionalNotes || "None"}

───────────────────────────────────────────────────────────────────────────────
                           IDENTITY & PAYMENT
───────────────────────────────────────────────────────────────────────────────
${formatPaymentSummary(payload.payment, payload.consents)}

${payload.injectionConsents ? formatInjectionConsentsSummary(payload.injectionConsents) : ""}

═══════════════════════════════════════════════════════════════════════════════
CLINICIAN ACTION:
1. Review screening and approve/deny via telehealth platform
2. Issue patient-specific eRx routed to Clear Choice Pharmacy (Novi, MI)
3. Pharmacy compounds IV → RN dispatch after preparation complete
═══════════════════════════════════════════════════════════════════════════════
`
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const required = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "serviceAddress",
      "serviceCity",
      "serviceState",
      "serviceZip",
      "preferredTimeWindow",
      "selectedPackage",
    ] as const

    for (const field of required) {
      if (!data[field]?.toString().trim()) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    if (!/^\S+@\S+\.\S+$/.test(data.email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    const paymentError = requireIntakePaymentSubmission(
      {
        authorizeHold: data.authorizeHold,
      },
      data.payment
    )
    if (paymentError) {
      return NextResponse.json({ error: paymentError }, { status: 400 })
    }

    if (!data.injectionConsents) {
      return NextResponse.json({ error: "Telemedicine consents are required before submission." }, { status: 400 })
    }

    const consentError = validateInjectionTelehealthConsents(data.injectionConsents as InjectionTelehealthConsentValues, {
      variant: "iv-rejuvenation",
    })
    if (!consentError.valid) {
      return NextResponse.json({ error: consentError.message }, { status: 400 })
    }

    const stripeCheck = await verifyPaymentHoldReady(data.payment?.stripePaymentIntentId || "")
    if (!stripeCheck.ok) {
      return NextResponse.json({ error: stripeCheck.error || "Payment not authorized" }, { status: 400 })
    }

    if (data.pregnantOrBreastfeeding) {
      return NextResponse.json(
        {
          error: "IV therapy requires in-person medical evaluation during pregnancy or breastfeeding.",
          hardStop: true,
        },
        { status: 422 }
      )
    }

    const submissionId = `CCR-IV-${Date.now().toString(36).toUpperCase()}`
    const partner = getActiveTelehealthPartner()
    const boosters: string[] = Array.isArray(data.selectedBoosters) ? data.selectedBoosters : []

    const intakePayload: IvIntakePayload = {
      serviceType: "iv_rejuvenation",
      submissionId,
      submittedAt: new Date().toISOString(),
      pharmacy: {
        name: CLEAR_CHOICE_PHARMACY.name,
        ncpdpId: getPharmacyNcpdpId(),
        address: `${CLEAR_CHOICE_PHARMACY.streetAddress}, ${CLEAR_CHOICE_PHARMACY.city}, ${CLEAR_CHOICE_PHARMACY.state} ${CLEAR_CHOICE_PHARMACY.zip}`,
      },
      patient: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
      },
      dispatch: {
        serviceAddress: data.serviceAddress,
        serviceCity: data.serviceCity,
        serviceState: data.serviceState,
        serviceZip: data.serviceZip,
        preferredDate: data.preferredDate || null,
        preferredTimeWindow: data.preferredTimeWindow,
      },
      treatment: {
        selectedPackage: data.selectedPackage,
        selectedPackageTitle: data.selectedPackageTitle || null,
        selectedBoosters: boosters,
        estimatedTotal: data.estimatedTotal ?? null,
      },
      screening: {
        kidneyDisease: data.kidneyDisease || null,
        heartCondition: data.heartCondition || null,
        pregnantOrBreastfeeding: data.pregnantOrBreastfeeding || false,
        allergies: data.allergies || null,
        currentMedications: data.currentMedications || null,
        additionalNotes: data.additionalNotes || null,
      },
      consents: {
        agreeToTerms: data.injectionConsents?.termsAndConditions ?? false,
        agreeToTelehealth: data.injectionConsents?.telehealthConsent ?? false,
        agreeToPrivacy: data.injectionConsents?.agreeToPrivacy ?? false,
        authorizeHold: data.authorizeHold ?? false,
      },
      injectionConsents: data.injectionConsents,
      payment: data.payment,
    }

    const partnerLabel = partnerDisplayName(partner)
    const clinicalSummary = formatClinicianSummary(intakePayload, partnerLabel)

    const partnerResult = await submitClinicalIntakeToPartner({
      serviceType: "iv_rejuvenation",
      submissionId,
      patient: intakePayload.patient,
      clinicalSummary,
      ivPayload: intakePayload,
    })

    if (!partnerResult.success) {
      return NextResponse.json(
        { error: partnerResult.error || "Failed to submit to telehealth partner" },
        { status: 502 }
      )
    }

    try {
      await sql(
        `INSERT INTO iv_booking_requests (
          id, first_name, last_name, email, phone,
          service_address, service_city, service_state, service_zip,
          preferred_date, preferred_time_window,
          selected_package, selected_package_title, selected_boosters, estimated_total,
          allergies, current_medications, pregnant_or_breastfeeding,
          kidney_disease, heart_condition, additional_notes,
          status, partner_name, partner_case_id, partner_status, intake_payload,
          stripe_payment_intent_id, id_front_key, id_back_key
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::jsonb, $15,
          $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26::jsonb,
          $27, $28, $29
        )`,
        [
          submissionId,
          data.firstName,
          data.lastName,
          data.email,
          data.phone,
          data.serviceAddress,
          data.serviceCity,
          data.serviceState,
          data.serviceZip,
          data.preferredDate || null,
          data.preferredTimeWindow,
          data.selectedPackage,
          data.selectedPackageTitle || null,
          JSON.stringify(boosters),
          data.estimatedTotal ?? null,
          data.allergies || null,
          data.currentMedications || null,
          data.pregnantOrBreastfeeding || false,
          data.kidneyDisease || null,
          data.heartCondition || null,
          data.additionalNotes || null,
          STANDARD_INTAKE_STATUS.pending,
          partnerResult.mode === "api" ? partner : partnerResult.partnerName,
          partnerResult.partnerCaseId || null,
          partnerResult.partnerStatus || STANDARD_INTAKE_STATUS.pending,
          JSON.stringify(intakePayload),
          data.payment?.stripePaymentIntentId || null,
          data.payment?.idFrontKey || null,
          data.payment?.idBackKey || null,
        ]
      )
    } catch (dbError) {
      console.error("Failed to save IV booking:", dbError)
      return NextResponse.json({ error: "Failed to save your submission. Please try again." }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message:
        "Your intake has been securely submitted. A licensed telehealth provider will review your request. If approved, your prescription will be sent to Clear Choice Pharmacy for preparation before RN dispatch.",
      submissionId,
      status: STANDARD_INTAKE_STATUS.pending,
      estimatedReviewTime: "2-4 business hours",
      fulfillmentPharmacy: CLEAR_CHOICE_PHARMACY.name,
    })
  } catch (error) {
    console.error("IV booking error:", error)
    return NextResponse.json({ error: "Failed to process submission. Please try again." }, { status: 500 })
  }
}
