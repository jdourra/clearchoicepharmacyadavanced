import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import {
  formatPaymentSummary,
  requireIntakePaymentSubmission,
  type IntakeConsents,
  type IntakePaymentMetadata,
} from "@/lib/intake-payment"
import { verifyPaymentHoldReady } from "@/lib/stripe-server"
import { submitClinicalIntakeToPartner } from "@/lib/telehealth/submit-clinical-intake"
import { STANDARD_INTAKE_STATUS } from "@/lib/telehealth/intake-status"
import {
  formatInjectionConsentsSummary,
  validateInjectionTelehealthConsents,
  type InjectionTelehealthConsentValues,
} from "@/lib/injection-telehealth-consents"

type WeightLossIntakePayload = {
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
    heightInches: number
    weightLbs: number
    bmi: number
    goalWeightLbs: number
    systolicBP: string
    diastolicBP: string
  }
  contraindications: {
    pregnantOrBreastfeeding: boolean
    mtcOrMen2History: boolean
    pancreatitisHistory: boolean
    type1Diabetes: boolean
    eatingDisorder: boolean
    onOtherGlp: boolean
  }
  medicalHistory: {
    type2Diabetes: string
    hypertension: string
    gallbladderDisease: string
    diabeticRetinopathy: string
    bariatricSurgery: string
    sleepApnea: string
    cardiovascularDisease: string
    currentMedications: string
    allergies: string
  }
  treatmentInfo: {
    selectedProgram: string
    selectedBillingPlan: string
    priorGlpExperience: string
    weightLossGoals: string[]
    comorbidities: string[]
    additionalConcerns: string
  }
  identity: IntakePaymentMetadata & {
    shippingAddress: string
    shippingCity: string
    shippingState: string
    shippingZip: string
  }
  consents?: IntakeConsents & {
    injection?: InjectionTelehealthConsentValues
  }
}

function formatClinicalSummary(data: WeightLossIntakePayload, submissionId: string): string {
  const programMap: Record<string, string> = {
    semaglutide: "Semaglutide GLP-1 Program",
    tirzepatide: "Tirzepatide GLP-1/GIP Program",
  }

  const riskFlags: string[] = []
  if (data.medicalHistory.type2Diabetes === "yes") riskFlags.push("Type 2 Diabetes")
  if (data.medicalHistory.hypertension === "yes") riskFlags.push("Hypertension")
  if (data.medicalHistory.gallbladderDisease === "yes") riskFlags.push("Gallbladder Disease")
  if (data.medicalHistory.diabeticRetinopathy === "yes") riskFlags.push("Diabetic Retinopathy")
  if (data.medicalHistory.bariatricSurgery === "yes") riskFlags.push("Bariatric Surgery History")
  if (data.medicalHistory.sleepApnea === "yes") riskFlags.push("Sleep Apnea")
  if (data.medicalHistory.cardiovascularDisease === "yes") riskFlags.push("Cardiovascular Disease")

  return `
═══════════════════════════════════════════════════════════════════════════════
              GLP WEIGHT LOSS INTAKE - CLEAR CHOICE PHARMACY
═══════════════════════════════════════════════════════════════════════════════
Submission ID: ${submissionId}
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
                              ANTHROPOMETRICS & VITALS
───────────────────────────────────────────────────────────────────────────────
Height:         ${data.vitals.heightInches} in
Weight:         ${data.vitals.weightLbs} lbs
BMI:            ${data.vitals.bmi.toFixed(1)}
Goal Weight:    ${data.vitals.goalWeightLbs} lbs
Blood Pressure: ${data.vitals.systolicBP}/${data.vitals.diastolicBP} mmHg
Comorbidities:  ${data.treatmentInfo.comorbidities.join(", ") || "None reported"}

───────────────────────────────────────────────────────────────────────────────
                    CONTRAINDICATION SCREENING (All must be NO)
───────────────────────────────────────────────────────────────────────────────
Pregnant/Breastfeeding: ${data.contraindications.pregnantOrBreastfeeding ? "⚠️ YES - HARD STOP" : "✓ No"}
MTC/MEN2 History:       ${data.contraindications.mtcOrMen2History ? "⚠️ YES - HARD STOP" : "✓ No"}
Pancreatitis History:   ${data.contraindications.pancreatitisHistory ? "⚠️ YES - HARD STOP" : "✓ No"}
Type 1 Diabetes:        ${data.contraindications.type1Diabetes ? "⚠️ YES - HARD STOP" : "✓ No"}
Eating Disorder:        ${data.contraindications.eatingDisorder ? "⚠️ YES - HARD STOP" : "✓ No"}
Other GLP Active:       ${data.contraindications.onOtherGlp ? "⚠️ YES - Review Required" : "✓ No"}

───────────────────────────────────────────────────────────────────────────────
                          MEDICAL HISTORY (Soft Flags)
───────────────────────────────────────────────────────────────────────────────
${riskFlags.length > 0 ? `⚠️ FLAGS PRESENT: ${riskFlags.join(", ")}` : "✓ No significant flags"}

Type 2 Diabetes:        ${data.medicalHistory.type2Diabetes}
Hypertension:           ${data.medicalHistory.hypertension}
Gallbladder Disease:    ${data.medicalHistory.gallbladderDisease}
Diabetic Retinopathy:   ${data.medicalHistory.diabeticRetinopathy}
Bariatric Surgery:      ${data.medicalHistory.bariatricSurgery}
Sleep Apnea:            ${data.medicalHistory.sleepApnea}
Cardiovascular Disease: ${data.medicalHistory.cardiovascularDisease}

Current Medications:
${data.medicalHistory.currentMedications || "None reported"}

Known Allergies:
${data.medicalHistory.allergies || "None reported"}

───────────────────────────────────────────────────────────────────────────────
                           TREATMENT INFORMATION
───────────────────────────────────────────────────────────────────────────────
Selected Program:       ${programMap[data.treatmentInfo.selectedProgram] || data.treatmentInfo.selectedProgram}
Billing Plan:           ${data.treatmentInfo.selectedBillingPlan}
Prior GLP Experience:   ${data.treatmentInfo.priorGlpExperience}
Weight Loss Goals:      ${data.treatmentInfo.weightLossGoals.join(", ") || "Not specified"}

Additional Concerns:
${data.treatmentInfo.additionalConcerns || "None"}

───────────────────────────────────────────────────────────────────────────────
                              SHIPPING ADDRESS
───────────────────────────────────────────────────────────────────────────────
${data.identity.shippingAddress}, ${data.identity.shippingCity}, ${data.identity.shippingState} ${data.identity.shippingZip}

───────────────────────────────────────────────────────────────────────────────
                           IDENTITY & PAYMENT
───────────────────────────────────────────────────────────────────────────────
${formatPaymentSummary(data.identity, data.consents)}

───────────────────────────────────────────────────────────────────────────────
                        TELEMEDICINE CONSENTS
───────────────────────────────────────────────────────────────────────────────
${data.consents?.injection ? formatInjectionConsentsSummary(data.consents.injection) : "Not provided"}

═══════════════════════════════════════════════════════════════════════════════
`
}

function parsePayload(rawData: Record<string, unknown>): WeightLossIntakePayload {
  const patient = (rawData.patient || {}) as Record<string, string>
  const vitals = (rawData.vitals || {}) as Record<string, string | number>
  const contraindications = (rawData.contraindications || {}) as Record<string, boolean>
  const medicalHistory = (rawData.medicalHistory || {}) as Record<string, string>
  const treatment = (rawData.treatment || {}) as Record<string, unknown>
  const identity = (rawData.identity || {}) as Record<string, string | boolean | null>
  const consents = (rawData.consents || {}) as IntakeConsents & { injection?: InjectionTelehealthConsentValues }

  const heightInches = Number(vitals.heightInches) || 0
  const weightLbs = Number(vitals.weightLbs) || 0
  const bmi =
    heightInches > 0 && weightLbs > 0
      ? (weightLbs / (heightInches * heightInches)) * 703
      : Number(vitals.bmi) || 0

  return {
    patientInfo: {
      firstName: patient.firstName || "",
      lastName: patient.lastName || "",
      email: patient.email || "",
      phone: patient.phone || "",
      dateOfBirth: patient.dateOfBirth || "",
      state: patient.state || "",
      address: patient.address || "",
      city: patient.city || "",
      zipCode: patient.zipCode || "",
    },
    vitals: {
      heightInches,
      weightLbs,
      bmi,
      goalWeightLbs: Number(vitals.goalWeightLbs) || 0,
      systolicBP: String(vitals.systolicBP || ""),
      diastolicBP: String(vitals.diastolicBP || ""),
    },
    contraindications: {
      pregnantOrBreastfeeding: contraindications.pregnantOrBreastfeeding || false,
      mtcOrMen2History: contraindications.mtcOrMen2History || false,
      pancreatitisHistory: contraindications.pancreatitisHistory || false,
      type1Diabetes: contraindications.type1Diabetes || false,
      eatingDisorder: contraindications.eatingDisorder || false,
      onOtherGlp: contraindications.onOtherGlp || false,
    },
    medicalHistory: {
      type2Diabetes: medicalHistory.type2Diabetes || "no",
      hypertension: medicalHistory.hypertension || "no",
      gallbladderDisease: medicalHistory.gallbladderDisease || "no",
      diabeticRetinopathy: medicalHistory.diabeticRetinopathy || "no",
      bariatricSurgery: medicalHistory.bariatricSurgery || "no",
      sleepApnea: medicalHistory.sleepApnea || "no",
      cardiovascularDisease: medicalHistory.cardiovascularDisease || "no",
      currentMedications: medicalHistory.currentMedications || "",
      allergies: medicalHistory.allergies || "",
    },
    treatmentInfo: {
      selectedProgram: String(treatment.selectedProgram || ""),
      selectedBillingPlan: String(treatment.selectedBillingPlan || ""),
      priorGlpExperience: String(treatment.priorGlpExperience || ""),
      weightLossGoals: (treatment.weightLossGoals as string[]) || [],
      comorbidities: (treatment.comorbidities as string[]) || [],
      additionalConcerns: String(treatment.additionalConcerns || ""),
    },
    identity: {
      shippingAddress: String(identity.shippingAddress || patient.address || ""),
      shippingCity: String(identity.shippingCity || patient.city || ""),
      shippingState: String(identity.shippingState || patient.state || ""),
      shippingZip: String(identity.shippingZip || patient.zipCode || ""),
      idFrontUploaded: Boolean(identity.idFrontUploaded),
      idBackUploaded: Boolean(identity.idBackUploaded),
      paymentOnFile: Boolean(identity.paymentOnFile),
      idFrontKey: identity.idFrontKey ? String(identity.idFrontKey) : null,
      idBackKey: identity.idBackKey ? String(identity.idBackKey) : null,
      stripePaymentIntentId: identity.stripePaymentIntentId ? String(identity.stripePaymentIntentId) : null,
    },
    consents,
  }
}

function checkEligibility(data: WeightLossIntakePayload): { hardStop: boolean; error?: string } {
  const c = data.contraindications

  if (
    c.pregnantOrBreastfeeding ||
    c.mtcOrMen2History ||
    c.pancreatitisHistory ||
    c.type1Diabetes ||
    c.eatingDisorder
  ) {
    return {
      hardStop: true,
      error:
        "Based on your responses, GLP-1 therapy is not appropriate through this online program. Please consult an in-person provider.",
    }
  }

  const bmi = data.vitals.bmi
  const hasComorbidity = data.treatmentInfo.comorbidities.length > 0

  if (bmi > 0 && bmi < 27) {
    return {
      hardStop: true,
      error:
        "GLP-1 medical weight loss typically requires a BMI of 27+ with a related condition, or 30+. Please consult your primary care provider.",
    }
  }

  if (bmi >= 27 && bmi < 30 && !hasComorbidity) {
    return {
      hardStop: true,
      error:
        "With a BMI between 27 and 30, a qualifying medical condition is required for GLP-1 therapy. Please consult your primary care provider.",
    }
  }

  const systolic = parseInt(data.vitals.systolicBP || "0")
  const diastolic = parseInt(data.vitals.diastolicBP || "0")
  if (systolic > 0 && diastolic > 0 && (systolic > 180 || diastolic > 110)) {
    return {
      hardStop: true,
      error: "Blood pressure is outside a safe range for asynchronous review. Please seek in-person medical care.",
    }
  }

  return { hardStop: false }
}

export async function POST(request: NextRequest) {
  try {
    const rawData = await request.json()
    const data = parsePayload(rawData)

    if (!data.patientInfo.firstName || !data.patientInfo.lastName || !data.patientInfo.email) {
      return NextResponse.json({ error: "Missing required patient information" }, { status: 400 })
    }

    const emailRegex = /^\S+@\S+\.\S+$/
    if (!emailRegex.test(data.patientInfo.email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    if (!data.treatmentInfo.selectedProgram) {
      return NextResponse.json({ error: "Please select a treatment program" }, { status: 400 })
    }

    const paymentError = requireIntakePaymentSubmission(data.consents, data.identity)
    if (paymentError) {
      return NextResponse.json({ error: paymentError }, { status: 400 })
    }

    const stripeCheck = await verifyPaymentHoldReady(data.identity.stripePaymentIntentId || "")
    if (!stripeCheck.ok) {
      return NextResponse.json({ error: stripeCheck.error || "Payment not authorized" }, { status: 400 })
    }

    if (!data.consents?.injection) {
      return NextResponse.json({ error: "Telemedicine consents are required before submission." }, { status: 400 })
    }

    const consentError = validateInjectionTelehealthConsents(data.consents.injection, {
      variant: "weight-loss",
      programId: data.treatmentInfo.selectedProgram,
    })
    if (!consentError.valid) {
      return NextResponse.json({ error: consentError.message }, { status: 400 })
    }

    const eligibility = checkEligibility(data)
    if (eligibility.hardStop) {
      return NextResponse.json({ error: eligibility.error, hardStop: true }, { status: 422 })
    }

    const submissionId = `CCR-WL-${Date.now().toString(36).toUpperCase()}`
    const clinicalSummary = formatClinicalSummary(data, submissionId)

    const partnerResult = await submitClinicalIntakeToPartner({
      serviceType: "weight_loss",
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
        `INSERT INTO weight_loss_intake (
          id, first_name, last_name, email, phone, date_of_birth, state, address, city, zip_code,
          height_inches, weight_lbs, bmi, goal_weight_lbs, systolic_bp, diastolic_bp,
          pregnant_or_breastfeeding, mtc_or_men2_history, pancreatitis_history, type1_diabetes,
          eating_disorder, on_other_glp,
          type2_diabetes, hypertension, gallbladder_disease, diabetic_retinopathy, bariatric_surgery,
          sleep_apnea, cardiovascular_disease, current_medications, allergies,
          selected_program, selected_billing_plan, prior_glp_experience,
          weight_loss_goals, comorbidities, additional_concerns,
          shipping_address, shipping_city, shipping_state, shipping_zip,
          status, stripe_payment_intent_id, id_front_key, id_back_key, partner_name, partner_status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16,
          $17, $18, $19, $20, $21, $22,
          $23, $24, $25, $26, $27, $28, $29, $30, $31,
          $32, $33, $34, $35::jsonb, $36::jsonb, $37,
          $38, $39, $40, $41, $42, $43, $44, $45, $46, $47
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
          data.vitals.heightInches,
          data.vitals.weightLbs,
          data.vitals.bmi,
          data.vitals.goalWeightLbs,
          data.vitals.systolicBP,
          data.vitals.diastolicBP,
          data.contraindications.pregnantOrBreastfeeding,
          data.contraindications.mtcOrMen2History,
          data.contraindications.pancreatitisHistory,
          data.contraindications.type1Diabetes,
          data.contraindications.eatingDisorder,
          data.contraindications.onOtherGlp,
          data.medicalHistory.type2Diabetes,
          data.medicalHistory.hypertension,
          data.medicalHistory.gallbladderDisease,
          data.medicalHistory.diabeticRetinopathy,
          data.medicalHistory.bariatricSurgery,
          data.medicalHistory.sleepApnea,
          data.medicalHistory.cardiovascularDisease,
          data.medicalHistory.currentMedications,
          data.medicalHistory.allergies,
          data.treatmentInfo.selectedProgram,
          data.treatmentInfo.selectedBillingPlan,
          data.treatmentInfo.priorGlpExperience,
          JSON.stringify(data.treatmentInfo.weightLossGoals),
          JSON.stringify(data.treatmentInfo.comorbidities),
          data.treatmentInfo.additionalConcerns,
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
      console.error("Failed to persist weight loss intake:", dbError)
      return NextResponse.json(
        { error: "Failed to save your submission. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Your intake has been securely submitted. A licensed provider will review your information.",
        submissionId,
        estimatedReviewTime: "2-4 business hours",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error processing weight loss intake:", error)
    return NextResponse.json(
      { error: "Failed to process your submission. Please try again." },
      { status: 500 }
    )
  }
}
