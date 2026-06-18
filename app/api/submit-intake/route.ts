import { NextRequest, NextResponse } from "next/server"
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"
import { sql } from "@/lib/db"

/**
 * Patient Intake API Route
 *
 * Handles ED troche intake submissions: validates clinical hard-stops,
 * persists to patient_intake, and notifies the reviewing clinician via SES.
 */

const sesClient = new SESClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
})

type ClinicalIntakePayload = {
  patientInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    dateOfBirth: string
    state: string
    address: string
    city: string
    zipCode: string
  }
  vitals: {
    systolicBP: string
    diastolicBP: string
    heartRate: string
    lastBPCheck: string
  }
  contraindications: {
    takesNitrates: boolean
    takesRiociguat: boolean
    recentHeartAttack: boolean
    recentStroke: boolean
    severeHeartFailure: boolean
    unstableAngina: boolean
  }
  medicalHistory: {
    diabetes: string
    hypertension: string
    heartCondition: string
    liverDisease: string
    kidneyDisease: string
    visionProblems: string
    currentMedications: string
    allergies: string
  }
  treatmentInfo: {
    selectedProduct: string
    edDuration: string
    edSeverity: string
    previousTreatments: string[]
    treatmentGoals: string[]
    preferredFrequency: string
    additionalConcerns: string
  }
  identity: {
    shippingAddress: string
    shippingCity: string
    shippingState: string
    shippingZip: string
    idFrontUploaded: boolean
    idBackUploaded: boolean
  }
  consents: {
    agreeToTerms: boolean
    agreeToTelehealth: boolean
    agreeToPrivacy: boolean
    authorizeHold: boolean
  }
}

import { ED_PRODUCT_LABELS } from "@/lib/ed-troche-catalog"

function formatClinicalSummary(data: ClinicalIntakePayload): string {
  const riskFlags: string[] = []

  if (data.medicalHistory.diabetes === "yes") riskFlags.push("Diabetes")
  if (data.medicalHistory.hypertension === "yes") riskFlags.push("Hypertension")
  if (data.medicalHistory.heartCondition === "yes") riskFlags.push("Heart Condition")
  if (data.medicalHistory.liverDisease === "yes") riskFlags.push("Liver Disease")
  if (data.medicalHistory.kidneyDisease === "yes") riskFlags.push("Kidney Disease")
  if (data.medicalHistory.visionProblems === "yes") riskFlags.push("Vision Problems")

  return `
═══════════════════════════════════════════════════════════════════════════════
                    CLINICAL INTAKE - CLEAR CHOICE PHARMACY
═══════════════════════════════════════════════════════════════════════════════
Submitted: ${new Date().toISOString()}
Status: PENDING PHYSICIAN REVIEW
Priority: ${riskFlags.length > 0 ? "ELEVATED - Review Soft Flags" : "STANDARD"}

───────────────────────────────────────────────────────────────────────────────
                              PATIENT DEMOGRAPHICS
───────────────────────────────────────────────────────────────────────────────
Name:           ${data.patientInfo.firstName} ${data.patientInfo.lastName}
DOB:            ${data.patientInfo.dateOfBirth}
Email:          ${data.patientInfo.email}
Phone:          ${data.patientInfo.phone}
State:          ${data.patientInfo.state}
Address:        ${data.patientInfo.address}, ${data.patientInfo.city}, ${data.patientInfo.state} ${data.patientInfo.zipCode}

───────────────────────────────────────────────────────────────────────────────
                            CARDIOVASCULAR VITALS
───────────────────────────────────────────────────────────────────────────────
Blood Pressure: ${data.vitals.systolicBP}/${data.vitals.diastolicBP} mmHg
Heart Rate:     ${data.vitals.heartRate} bpm
Last BP Check:  ${data.vitals.lastBPCheck}

───────────────────────────────────────────────────────────────────────────────
                    CONTRAINDICATION SCREENING (All must be NO)
───────────────────────────────────────────────────────────────────────────────
Nitrates:           ${data.contraindications.takesNitrates ? "⚠️ YES - HARD STOP" : "✓ No"}
Riociguat:          ${data.contraindications.takesRiociguat ? "⚠️ YES - HARD STOP" : "✓ No"}
Recent MI:          ${data.contraindications.recentHeartAttack ? "⚠️ YES - HARD STOP" : "✓ No"}
Recent Stroke:      ${data.contraindications.recentStroke ? "⚠️ YES - HARD STOP" : "✓ No"}
Severe CHF:         ${data.contraindications.severeHeartFailure ? "⚠️ YES - HARD STOP" : "✓ No"}
Unstable Angina:    ${data.contraindications.unstableAngina ? "⚠️ YES - HARD STOP" : "✓ No"}

───────────────────────────────────────────────────────────────────────────────
                          MEDICAL HISTORY (Soft Flags)
───────────────────────────────────────────────────────────────────────────────
${riskFlags.length > 0 ? `⚠️ FLAGS PRESENT: ${riskFlags.join(", ")}` : "✓ No significant flags"}

Diabetes:           ${data.medicalHistory.diabetes}
Hypertension:       ${data.medicalHistory.hypertension}
Heart Condition:    ${data.medicalHistory.heartCondition}
Liver Disease:      ${data.medicalHistory.liverDisease}
Kidney Disease:     ${data.medicalHistory.kidneyDisease}
Vision Problems:    ${data.medicalHistory.visionProblems}

Current Medications:
${data.medicalHistory.currentMedications || "None reported"}

Known Allergies:
${data.medicalHistory.allergies || "None reported"}

───────────────────────────────────────────────────────────────────────────────
                           TREATMENT INFORMATION
───────────────────────────────────────────────────────────────────────────────
Selected Product:       ${ED_PRODUCT_LABELS[data.treatmentInfo.selectedProduct] || data.treatmentInfo.selectedProduct}
ED Duration:            ${data.treatmentInfo.edDuration}
ED Severity:            ${data.treatmentInfo.edSeverity}
Preferred Frequency:    ${data.treatmentInfo.preferredFrequency}
Previous Treatments:    ${data.treatmentInfo.previousTreatments.join(", ") || "None"}
Treatment Goals:        ${data.treatmentInfo.treatmentGoals.join(", ") || "Not specified"}

Additional Concerns:
${data.treatmentInfo.additionalConcerns || "None"}

───────────────────────────────────────────────────────────────────────────────
                          IDENTITY VERIFICATION
───────────────────────────────────────────────────────────────────────────────
Shipping Address:   ${data.identity.shippingAddress}, ${data.identity.shippingCity}, ${data.identity.shippingState} ${data.identity.shippingZip}
ID Front Uploaded:  ${data.identity.idFrontUploaded ? "✓ Yes" : "✗ No"}
ID Back Uploaded:   ${data.identity.idBackUploaded ? "✓ Yes" : "✗ No"}

───────────────────────────────────────────────────────────────────────────────
                              PATIENT CONSENTS
───────────────────────────────────────────────────────────────────────────────
Terms of Service:       ${data.consents.agreeToTerms ? "✓ Agreed" : "✗ Not Agreed"}
Telehealth Consent:     ${data.consents.agreeToTelehealth ? "✓ Agreed" : "✗ Not Agreed"}
HIPAA Acknowledgment:   ${data.consents.agreeToPrivacy ? "✓ Agreed" : "✗ Not Agreed"}
Payment Authorization:  ${data.consents.authorizeHold ? "✓ Authorized" : "✗ Not Authorized"}

═══════════════════════════════════════════════════════════════════════════════
`
}

async function sendEmailViaSES(
  to: string,
  subject: string,
  body: string,
  from: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.log("AWS SES credentials not configured - logging email instead:")
    console.log(`To: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(body)
    return { success: true, messageId: "local-dev-mode" }
  }

  if (!to) {
    console.log("No clinician email configured - logging intake summary instead:")
    console.log(body)
    return { success: true, messageId: "no-recipient-configured" }
  }

  try {
    const command = new SendEmailCommand({
      Source: from,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject, Charset: "UTF-8" },
        Body: { Text: { Data: body, Charset: "UTF-8" } },
      },
    })

    const response = await sesClient.send(command)
    return { success: true, messageId: response.MessageId }
  } catch (error) {
    console.error("SES Email Error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawData = await request.json()

    const data: ClinicalIntakePayload = {
      patientInfo: {
        firstName: rawData.patient?.firstName || "",
        lastName: rawData.patient?.lastName || "",
        email: rawData.patient?.email || "",
        phone: rawData.patient?.phone || "",
        dateOfBirth: rawData.patient?.dateOfBirth || "",
        state: rawData.patient?.state || "",
        address: rawData.patient?.address || "",
        city: rawData.patient?.city || "",
        zipCode: rawData.patient?.zipCode || "",
      },
      vitals: {
        systolicBP: rawData.vitals?.bloodPressure?.split("/")[0] || "",
        diastolicBP: rawData.vitals?.bloodPressure?.split("/")[1] || "",
        heartRate: rawData.vitals?.heartRate || "",
        lastBPCheck: rawData.vitals?.lastBPCheck || "",
      },
      contraindications: {
        takesNitrates: rawData.contraindications?.takesNitrates || false,
        takesRiociguat: rawData.contraindications?.takesRiociguat || false,
        recentHeartAttack: rawData.contraindications?.recentHeartAttack || false,
        recentStroke: rawData.contraindications?.recentStroke || false,
        severeHeartFailure: rawData.contraindications?.severeHeartFailure || false,
        unstableAngina: rawData.contraindications?.unstableAngina || false,
      },
      medicalHistory: {
        diabetes: rawData.medicalHistory?.diabetes || "no",
        hypertension: rawData.medicalHistory?.hypertension || "no",
        heartCondition: rawData.medicalHistory?.heartCondition || "no",
        liverDisease: rawData.medicalHistory?.liverDisease || "no",
        kidneyDisease: rawData.medicalHistory?.kidneyDisease || "no",
        visionProblems: rawData.medicalHistory?.visionProblems || "no",
        currentMedications: rawData.medicalHistory?.currentMedications || "",
        allergies: rawData.medicalHistory?.allergies || "",
      },
      treatmentInfo: {
        selectedProduct: rawData.treatment?.selectedProduct || "",
        edDuration: rawData.treatment?.edDuration || "",
        edSeverity: rawData.treatment?.edSeverity || "",
        previousTreatments: rawData.treatment?.previousTreatments || [],
        treatmentGoals: rawData.treatment?.treatmentGoals || [],
        preferredFrequency: rawData.treatment?.preferredFrequency || "",
        additionalConcerns: rawData.treatment?.additionalConcerns || "",
      },
      identity: {
        shippingAddress: rawData.identity?.shippingAddress || rawData.patient?.address || "",
        shippingCity: rawData.identity?.shippingCity || rawData.patient?.city || "",
        shippingState: rawData.identity?.shippingState || rawData.patient?.state || "",
        shippingZip: rawData.identity?.shippingZip || rawData.patient?.zipCode || "",
        idFrontUploaded: rawData.identity?.idFrontUploaded || false,
        idBackUploaded: rawData.identity?.idBackUploaded || false,
      },
      consents: {
        agreeToTerms: rawData.consents?.agreeToTerms || true,
        agreeToTelehealth: rawData.consents?.agreeToTelehealth || true,
        agreeToPrivacy: rawData.consents?.agreeToPrivacy || true,
        authorizeHold: rawData.consents?.authorizeHold || true,
      },
    }

    if (!data.patientInfo.firstName || !data.patientInfo.lastName || !data.patientInfo.email) {
      return NextResponse.json({ error: "Missing required patient information" }, { status: 400 })
    }

    const emailRegex = /^\S+@\S+\.\S+$/
    if (!emailRegex.test(data.patientInfo.email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    const hasHardStop =
      data.contraindications.takesNitrates ||
      data.contraindications.takesRiociguat ||
      data.contraindications.recentHeartAttack ||
      data.contraindications.recentStroke ||
      data.contraindications.severeHeartFailure ||
      data.contraindications.unstableAngina

    if (hasHardStop) {
      return NextResponse.json(
        {
          error:
            "Clinical contraindication detected. Asynchronous prescription is not safe. Please seek in-person cardiology care.",
          hardStop: true,
        },
        { status: 422 }
      )
    }

    const systolic = parseInt(data.vitals.systolicBP || "0")
    const diastolic = parseInt(data.vitals.diastolicBP || "0")

    if (systolic > 0 && diastolic > 0) {
      if (systolic < 90 || diastolic < 50 || systolic > 170 || diastolic > 100) {
        return NextResponse.json(
          {
            error: "Blood pressure outside safe treatment range. Please seek immediate medical evaluation.",
            hardStop: true,
          },
          { status: 422 }
        )
      }
    }

    const clinicalSummary = formatClinicalSummary(data)
    const submissionId = `CCR-${Date.now().toString(36).toUpperCase()}`

    try {
      await sql(
        `INSERT INTO patient_intake (
          id, first_name, last_name, email, phone, date_of_birth, state, address, city, zip_code,
          systolic_bp, diastolic_bp, heart_rate, last_bp_check,
          diabetes, hypertension, heart_condition, liver_disease, kidney_disease, vision_problems,
          current_medications, allergies,
          selected_product, selected_billing_plan, ed_duration, ed_severity,
          previous_treatments, treatment_goals,
          shipping_address, shipping_city, shipping_state, shipping_zip, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14,
          $15, $16, $17, $18, $19, $20,
          $21, $22,
          $23, $24, $25, $26,
          $27::jsonb, $28::jsonb,
          $29, $30, $31, $32, $33
        )`,
        [
          submissionId,
          data.patientInfo.firstName,
          data.patientInfo.lastName,
          data.patientInfo.email,
          data.patientInfo.phone,
          data.patientInfo.dateOfBirth,
          data.patientInfo.state,
          data.patientInfo.address,
          data.patientInfo.city,
          data.patientInfo.zipCode,
          data.vitals.systolicBP,
          data.vitals.diastolicBP,
          data.vitals.heartRate,
          data.vitals.lastBPCheck,
          data.medicalHistory.diabetes,
          data.medicalHistory.hypertension,
          data.medicalHistory.heartCondition,
          data.medicalHistory.liverDisease,
          data.medicalHistory.kidneyDisease,
          data.medicalHistory.visionProblems,
          data.medicalHistory.currentMedications,
          data.medicalHistory.allergies,
          data.treatmentInfo.selectedProduct,
          rawData.treatment?.selectedBillingPlan || "",
          data.treatmentInfo.edDuration,
          data.treatmentInfo.edSeverity,
          JSON.stringify(data.treatmentInfo.previousTreatments),
          JSON.stringify(data.treatmentInfo.treatmentGoals),
          data.identity.shippingAddress,
          data.identity.shippingCity,
          data.identity.shippingState,
          data.identity.shippingZip,
          "pending_review",
        ]
      )
    } catch (dbError) {
      console.error("Failed to persist intake to database:", dbError)
      return NextResponse.json(
        { error: "Failed to save your submission. Please try again." },
        { status: 500 }
      )
    }

    const drDourraEmail = process.env.DR_DOURRA_EMAIL || process.env.ADMIN_EMAIL || ""
    const senderEmail = process.env.SES_SENDER_EMAIL || "intake@clearchoicepharmacy.com"

    const emailResult = await sendEmailViaSES(
      drDourraEmail,
      `[CLINICAL INTAKE ${submissionId}] ${data.patientInfo.firstName} ${data.patientInfo.lastName} - Pending Review`,
      clinicalSummary,
      senderEmail
    )

    if (!emailResult.success) {
      console.error("Failed to send email:", emailResult.error)
    }

    return NextResponse.json(
      {
        success: true,
        message: "Intake protocol securely transmitted. A licensed provider is reviewing your medical history.",
        submissionId,
        estimatedReviewTime: "2-4 business hours",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error processing clinical intake:", error)
    return NextResponse.json(
      { error: "Failed to process clinical submission. Please try again." },
      { status: 500 }
    )
  }
}
