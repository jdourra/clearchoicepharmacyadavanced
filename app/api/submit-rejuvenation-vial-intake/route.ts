import { NextRequest, NextResponse } from "next/server"
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"
import { sql } from "@/lib/db"
import { CLEAR_CHOICE_PHARMACY } from "@/lib/telehealth/types"

const sesClient = new SESClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
})

async function sendEmailViaSES(to: string, subject: string, body: string, from: string) {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.log("AWS SES not configured - logging vial intake email:")
    console.log(`To: ${to}\nSubject: ${subject}\n${body}`)
    return { success: true }
  }
  if (!to) {
    console.log("No clinician email configured - logging vial intake:")
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

    try {
      await sql(
        `INSERT INTO rejuvenation_vial_intakes (
          id, first_name, last_name, email, phone,
          shipping_address, shipping_city, shipping_state, shipping_zip,
          selected_vial, selected_vial_title, kit_price,
          allergies, current_medications, pregnant_or_breastfeeding,
          kidney_disease, heart_condition, additional_notes, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
          $13, $14, $15, $16, $17, $18, $19
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
          "pending_provider_review",
        ]
      )
    } catch (dbError) {
      console.error("Failed to save vial intake:", dbError)
      return NextResponse.json({ error: "Failed to save your submission. Please try again." }, { status: 500 })
    }

    const clinicianEmail =
      process.env.TELEHEALTH_CLINICIAN_EMAIL ||
      process.env.DR_DOURRA_EMAIL ||
      process.env.ADMIN_EMAIL ||
      ""
    const senderEmail = process.env.SES_SENDER_EMAIL || "intake@clearchoicepharmacy.com"

    await sendEmailViaSES(
      clinicianEmail,
      `[VIAL INTAKE ${submissionId}] ${data.firstName} ${data.lastName} - Pending Provider Review`,
      formatClinicianSummary(data, submissionId),
      senderEmail
    )

    return NextResponse.json({
      success: true,
      message:
        "Your intake has been securely submitted. A licensed telehealth provider will review your request. If approved, your home injection kit will be compounded and shipped from Clear Choice Pharmacy.",
      submissionId,
      status: "pending_provider_review",
      estimatedReviewTime: "2-4 business hours",
      fulfillmentPharmacy: CLEAR_CHOICE_PHARMACY.name,
    })
  } catch (error) {
    console.error("Vial intake error:", error)
    return NextResponse.json({ error: "Failed to process submission. Please try again." }, { status: 500 })
  }
}
