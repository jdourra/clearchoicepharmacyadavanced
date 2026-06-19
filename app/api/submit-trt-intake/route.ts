import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getTrtProgram } from "@/lib/trt-catalog"
import { formatPaymentSummary, requireIntakePaymentSubmission, type IntakeConsents, type IntakePaymentMetadata } from "@/lib/intake-payment"
import { verifyPaymentHoldReady } from "@/lib/stripe-server"
import { submitClinicalIntakeToPartner } from "@/lib/telehealth/submit-clinical-intake"
import { STANDARD_INTAKE_STATUS } from "@/lib/telehealth/intake-status"
import {
  formatInjectionConsentsSummary,
  validateInjectionTelehealthConsents,
  type InjectionTelehealthConsentValues,
} from "@/lib/injection-telehealth-consents"

type TrtIntakePayload = {
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
  }
  contraindications: {
    prostateCancer: boolean
    breastCancer: boolean
    polycythemia: boolean
    severeSleepApnea: boolean
    uncontrolledHeartFailure: boolean
    fertilityPriority: boolean
  }
  medicalHistory: {
    hypertension: string
    sleepApnea: string
    cardiovascularDisease: string
    diabetes: string
    liverDisease: string
    kidneyDisease: string
    currentMedications: string
    allergies: string
  }
  treatmentInfo: {
    selectedProgram: string
    selectedBillingPlan: string
    symptoms: string[]
    treatmentGoals: string[]
    priorTrtExperience: string
    hasRecentLabs: string
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

function formatClinicalSummary(data: TrtIntakePayload, submissionId: string): string {
  const program = getTrtProgram(data.treatmentInfo.selectedProgram)
  return `
TRT INTAKE - CLEAR CHOICE PHARMACY
Submission ID: ${submissionId}
Submitted: ${new Date().toISOString()}

PATIENT: ${data.patientInfo.firstName} ${data.patientInfo.lastName}
Email: ${data.patientInfo.email}
Phone: ${data.patientInfo.phone}
DOB: ${data.patientInfo.dateOfBirth}
State: ${data.patientInfo.state}

PROGRAM: ${program?.name || data.treatmentInfo.selectedProgram}
Billing: ${data.treatmentInfo.selectedBillingPlan}

VITALS: BP ${data.vitals.systolicBP}/${data.vitals.diastolicBP}, HR ${data.vitals.heartRate}

SYMPTOMS: ${data.treatmentInfo.symptoms.join(", ") || "None"}
GOALS: ${data.treatmentInfo.treatmentGoals.join(", ") || "None"}
Prior TRT: ${data.treatmentInfo.priorTrtExperience}
Recent labs: ${data.treatmentInfo.hasRecentLabs}

CONTRAINDICATIONS:
Prostate cancer: ${data.contraindications.prostateCancer}
Breast cancer: ${data.contraindications.breastCancer}
Polycythemia: ${data.contraindications.polycythemia}
Severe sleep apnea: ${data.contraindications.severeSleepApnea}
Heart failure: ${data.contraindications.uncontrolledHeartFailure}
Fertility priority: ${data.contraindications.fertilityPriority}

MEDICAL HISTORY:
Hypertension: ${data.medicalHistory.hypertension}
Sleep apnea: ${data.medicalHistory.sleepApnea}
Cardiovascular: ${data.medicalHistory.cardiovascularDisease}
Diabetes: ${data.medicalHistory.diabetes}
Liver: ${data.medicalHistory.liverDisease}
Kidney: ${data.medicalHistory.kidneyDisease}
Meds: ${data.medicalHistory.currentMedications || "None"}
Allergies: ${data.medicalHistory.allergies || "None"}

SHIP TO: ${data.identity.shippingAddress}, ${data.identity.shippingCity}, ${data.identity.shippingState} ${data.identity.shippingZip}

${formatPaymentSummary(data.identity, data.consents)}
${data.consents?.injection ? `\n\nTELEMEDICINE CONSENTS:\n${formatInjectionConsentsSummary(data.consents.injection)}` : ""}
`.trim()
}

function checkEligibility(data: TrtIntakePayload): { hardStop: boolean; error?: string } {
  const c = data.contraindications
  if (c.prostateCancer || c.breastCancer || c.polycythemia || c.severeSleepApnea || c.uncontrolledHeartFailure) {
    return {
      hardStop: true,
      error:
        "Based on your responses, TRT is not appropriate through this online program. Please consult an in-person specialist.",
    }
  }
  return { hardStop: false }
}

export async function POST(request: NextRequest) {
  try {
    const data = (await request.json()) as TrtIntakePayload

    if (!data.patientInfo?.firstName || !data.patientInfo?.lastName || !data.patientInfo?.email) {
      return NextResponse.json({ error: "Missing required patient information" }, { status: 400 })
    }

    if (!data.treatmentInfo?.selectedProgram) {
      return NextResponse.json({ error: "Please select a TRT program" }, { status: 400 })
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
      variant: "trt",
      programId: data.treatmentInfo.selectedProgram,
    })
    if (!consentError.valid) {
      return NextResponse.json({ error: consentError.message }, { status: 400 })
    }

    const eligibility = checkEligibility(data)
    if (eligibility.hardStop) {
      return NextResponse.json({ error: eligibility.error, hardStop: true }, { status: 422 })
    }

    const submissionId = `CCR-TRT-${Date.now().toString(36).toUpperCase()}`
    const clinicalSummary = formatClinicalSummary(data, submissionId)

    const partnerResult = await submitClinicalIntakeToPartner({
      serviceType: "trt",
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
        `INSERT INTO trt_intake (
          id, first_name, last_name, email, phone, date_of_birth, state, address, city, zip_code,
          systolic_bp, diastolic_bp, heart_rate,
          symptoms, treatment_goals, prior_trt_experience, has_recent_labs,
          prostate_cancer, breast_cancer, polycythemia, severe_sleep_apnea, uncontrolled_heart_failure, fertility_priority,
          hypertension, sleep_apnea, cardiovascular_disease, diabetes, liver_disease, kidney_disease,
          current_medications, allergies, additional_concerns,
          selected_program, selected_billing_plan,
          shipping_address, shipping_city, shipping_state, shipping_zip,
          status, stripe_payment_intent_id, id_front_key, id_back_key, partner_name, partner_status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13,
          $14::jsonb, $15::jsonb, $16, $17,
          $18, $19, $20, $21, $22, $23,
          $24, $25, $26, $27, $28, $29,
          $30, $31, $32,
          $33, $34,
          $35, $36, $37, $38, $39, $40, $41, $42, $43, $44
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
          JSON.stringify(data.treatmentInfo.symptoms || []),
          JSON.stringify(data.treatmentInfo.treatmentGoals || []),
          data.treatmentInfo.priorTrtExperience,
          data.treatmentInfo.hasRecentLabs,
          data.contraindications.prostateCancer,
          data.contraindications.breastCancer,
          data.contraindications.polycythemia,
          data.contraindications.severeSleepApnea,
          data.contraindications.uncontrolledHeartFailure,
          data.contraindications.fertilityPriority,
          data.medicalHistory.hypertension,
          data.medicalHistory.sleepApnea,
          data.medicalHistory.cardiovascularDisease,
          data.medicalHistory.diabetes,
          data.medicalHistory.liverDisease,
          data.medicalHistory.kidneyDisease,
          data.medicalHistory.currentMedications,
          data.medicalHistory.allergies,
          data.treatmentInfo.additionalConcerns,
          data.treatmentInfo.selectedProgram,
          data.treatmentInfo.selectedBillingPlan,
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
      console.error("[trt-intake] Database error:", dbError)
      return NextResponse.json({ error: "Failed to save your submission. Please try again." }, { status: 500 })
    }

    return NextResponse.json({ success: true, submissionId })
  } catch (error) {
    console.error("[trt-intake] Error:", error)
    return NextResponse.json({ error: "Failed to submit TRT intake" }, { status: 500 })
  }
}
