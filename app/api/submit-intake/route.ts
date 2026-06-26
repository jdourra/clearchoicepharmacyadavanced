import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { ED_PRODUCT_LABELS, calculateEdOrderPricing, type EdBillingPlan } from "@/lib/ed-troche-catalog"
import { formatEdAddOnsWithPricing, parseEdAddOns, type EdFormulationAddOn } from "@/lib/ed-add-ons"
import { requireIntakePaymentSubmission, type IntakePaymentMetadata } from "@/lib/intake-payment"
import { verifyPaymentHoldReady } from "@/lib/stripe-server"
import { submitClinicalIntakeToPartner } from "@/lib/telehealth/submit-clinical-intake"
import { STANDARD_INTAKE_STATUS } from "@/lib/telehealth/intake-status"
import { PRIMARY_PHYSICIAN } from "@/lib/clinical-provider"

/**
 * Patient Intake API Route
 *
 * Handles ED troche intake submissions: validates clinical hard-stops,
 * persists to patient_intake, and queues for telehealth partner review.
 */

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
    selectedBillingPlan: EdBillingPlan
    selectedAddOns?: EdFormulationAddOn[]
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
    paymentOnFile?: boolean
    stripePaymentIntentId?: string | null
    idFrontKey?: string | null
    idBackKey?: string | null
  }
  consents: {
    agreeToTerms: boolean
    agreeToTelehealth: boolean
    agreeToPrivacy: boolean
    authorizeHold: boolean
  }
}

function formatClinicalSummary(data: ClinicalIntakePayload): string {
  const riskFlags: string[] = []

  if (data.medicalHistory.diabetes === "yes") riskFlags.push("Diabetes")
  if (data.medicalHistory.hypertension === "yes") riskFlags.push("Hypertension")
  if (data.medicalHistory.heartCondition === "yes") riskFlags.push("Heart Condition")
  if (data.medicalHistory.liverDisease === "yes") riskFlags.push("Liver Disease")
  if (data.medicalHistory.kidneyDisease === "yes") riskFlags.push("Kidney Disease")
  if (data.medicalHistory.visionProblems === "yes") riskFlags.push("Vision Problems")

  const billingPlan = data.treatmentInfo.selectedBillingPlan || "quarterly"
  const orderPricing = calculateEdOrderPricing(
    data.treatmentInfo.selectedProduct,
    billingPlan,
    data.treatmentInfo.selectedAddOns || []
  )

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
Billing Plan:           ${billingPlan}
Optional Add-Ons:       ${formatEdAddOnsWithPricing(data.treatmentInfo.selectedAddOns || [], billingPlan)}
Effective Monthly:      $${orderPricing.pricePerMonth}/mo
Total Authorized:       $${orderPricing.totalBilled}
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
        selectedBillingPlan: (rawData.treatment?.selectedBillingPlan || "quarterly") as EdBillingPlan,
        selectedAddOns: parseEdAddOns(
          Array.isArray(rawData.treatment?.selectedAddOns)
            ? (rawData.treatment.selectedAddOns as string[]).join(",")
            : typeof rawData.treatment?.selectedAddOns === "string"
              ? rawData.treatment.selectedAddOns
              : undefined
        ),
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
        paymentOnFile: rawData.identity?.paymentOnFile || false,
        stripePaymentIntentId: rawData.identity?.stripePaymentIntentId || null,
        idFrontKey: rawData.identity?.idFrontKey || null,
        idBackKey: rawData.identity?.idBackKey || null,
      },
      consents: {
        agreeToTerms: rawData.consents?.agreeToTerms || false,
        agreeToTelehealth: rawData.consents?.agreeToTelehealth || false,
        agreeToPrivacy: rawData.consents?.agreeToPrivacy || false,
        authorizeHold: rawData.consents?.authorizeHold || false,
      },
    }

    if (!data.patientInfo.firstName || !data.patientInfo.lastName || !data.patientInfo.email) {
      return NextResponse.json({ error: "Missing required patient information" }, { status: 400 })
    }

    const emailRegex = /^\S+@\S+\.\S+$/
    if (!emailRegex.test(data.patientInfo.email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    const paymentError = requireIntakePaymentSubmission(data.consents, data.identity as IntakePaymentMetadata)
    if (paymentError) {
      return NextResponse.json({ error: paymentError }, { status: 400 })
    }

    const stripeCheck = await verifyPaymentHoldReady(data.identity.stripePaymentIntentId || "")
    if (!stripeCheck.ok) {
      return NextResponse.json({ error: stripeCheck.error || "Payment not authorized" }, { status: 400 })
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

    const partnerResult = await submitClinicalIntakeToPartner({
      serviceType: "mens_health",
      submissionId,
      patient: {
        firstName: data.patientInfo.firstName,
        lastName: data.patientInfo.lastName,
        email: data.patientInfo.email,
        phone: data.patientInfo.phone,
      },
      clinicalSummary,
    })

    if (!partnerResult.success) {
      return NextResponse.json({ error: partnerResult.error || "Failed to queue intake" }, { status: 502 })
    }

    try {
      await sql(
        `INSERT INTO patient_intake (
          id, first_name, last_name, email, phone, date_of_birth, state, address, city, zip_code,
          systolic_bp, diastolic_bp, heart_rate, last_bp_check,
          diabetes, hypertension, heart_condition, liver_disease, kidney_disease, vision_problems,
          current_medications, allergies,
          selected_product, selected_billing_plan, ed_duration, ed_severity,
          previous_treatments, treatment_goals,
          shipping_address, shipping_city, shipping_state, shipping_zip,
          status, stripe_payment_intent_id, id_front_key, id_back_key, partner_name, partner_status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14,
          $15, $16, $17, $18, $19, $20,
          $21, $22,
          $23, $24, $25, $26,
          $27::jsonb, $28::jsonb,
          $29, $30, $31, $32, $33, $34, $35, $36, $37, $38
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
          STANDARD_INTAKE_STATUS.pending,
          data.identity.stripePaymentIntentId,
          data.identity.idFrontKey,
          data.identity.idBackKey,
          partnerResult.partnerName,
          partnerResult.partnerStatus || "queued_for_manual_review",
        ]
      )
    } catch (dbError) {
      console.error("Failed to persist intake to database:", dbError)
      return NextResponse.json(
        { error: "Failed to save your submission. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: `Intake protocol securely transmitted. ${PRIMARY_PHYSICIAN.name} is reviewing your medical history.`,
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
