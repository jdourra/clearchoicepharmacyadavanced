import { NextRequest, NextResponse } from "next/server"
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"
import { sql } from "@/lib/db"
import { submitIvIntakeToPartner, partnerDisplayName } from "@/lib/telehealth/partner-client"
import {
  CLEAR_CHOICE_PHARMACY,
  getActiveTelehealthPartner,
  getPharmacyNcpdpId,
  type IvIntakePayload,
} from "@/lib/telehealth/types"

/**
 * IV Rejuvenation intake API
 *
 * Workflow:
 * 1. Patient submits booking + clinical screening on clearchoicepharmacy.com
 * 2. Intake routed to telehealth partner (or manual clinician queue)
 * 3. On provider approval, partner sends eRx to Clear Choice Pharmacy (Michigan)
 * 4. Pharmacy prepares IV bag → RN dispatch scheduled
 */

const sesClient = new SESClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
})

async function sendEmailViaSES(to: string, subject: string, body: string, from: string) {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.log("AWS SES not configured - logging IV intake email:")
    console.log(`To: ${to}\nSubject: ${subject}\n${body}`)
    return { success: true }
  }
  if (!to) {
    console.log("No clinician email configured - logging IV intake:")
    console.log(body)
    return { success: true }
  }
  try {
    await sesClient.send(
      new SendEmailCommand({
        Source: from,
        Destination: { ToAddresses: [to] },
        Message: {
          Subject: { Data: subject, Charset: "UTF-8" },
          Body: { Text: { Data: body, Charset: "UTF-8" } },
        },
      })
    )
    return { success: true }
  } catch (error) {
    console.error("SES error:", error)
    return { success: false }
  }
}

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
Estimated Total: $${payload.treatment.estimatedTotal ?? "—"}

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
        agreeToTerms: data.agreeToTerms ?? true,
        agreeToTelehealth: data.agreeToTelehealth ?? true,
      },
    }

    const partnerResult = await submitIvIntakeToPartner(intakePayload)
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
          status, partner_name, partner_case_id, partner_status, intake_payload
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::jsonb, $15,
          $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26::jsonb
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
          "pending_provider_review",
          partnerResult.mode === "api" ? partner : "manual",
          partnerResult.partnerCaseId || null,
          partnerResult.partnerStatus || "pending_provider_review",
          JSON.stringify(intakePayload),
        ]
      )
    } catch (dbError) {
      console.error("Failed to save IV booking:", dbError)
      return NextResponse.json({ error: "Failed to save your submission. Please try again." }, { status: 500 })
    }

    const clinicianEmail =
      process.env.TELEHEALTH_CLINICIAN_EMAIL ||
      process.env.DR_DOURRA_EMAIL ||
      process.env.ADMIN_EMAIL ||
      ""
    const senderEmail = process.env.SES_SENDER_EMAIL || "intake@clearchoicepharmacy.com"
    const partnerLabel = partnerDisplayName(partner)

    await sendEmailViaSES(
      clinicianEmail,
      `[IV INTAKE ${submissionId}] ${data.firstName} ${data.lastName} - Pending Provider Review`,
      formatClinicianSummary(intakePayload, partnerLabel),
      senderEmail
    )

    return NextResponse.json({
      success: true,
      message:
        "Your intake has been securely submitted. A licensed telehealth provider will review your request. If approved, your prescription will be sent to Clear Choice Pharmacy for preparation before RN dispatch.",
      submissionId,
      status: "pending_provider_review",
      estimatedReviewTime: "2-4 business hours",
      fulfillmentPharmacy: CLEAR_CHOICE_PHARMACY.name,
    })
  } catch (error) {
    console.error("IV booking error:", error)
    return NextResponse.json({ error: "Failed to process submission. Please try again." }, { status: 500 })
  }
}
