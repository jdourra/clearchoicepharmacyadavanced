import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import {
  formatPaymentSummary,
  requireIntakeIdentitySubmission,
  requireIntakePaymentSubmission,
  type IntakeConsents,
  type IntakePaymentMetadata,
} from "@/lib/intake-payment"
import { paymentStatusFromHold } from "@/lib/intake-payment-status"
import { verifyPaymentHoldReady } from "@/lib/stripe-server"
import { notifyClinicianQueue } from "@/lib/telehealth/manual-queue"
import { STANDARD_INTAKE_STATUS } from "@/lib/telehealth/intake-status"
import { PRIMARY_PHYSICIAN } from "@/lib/clinical-provider"
import { listOlaScheduleSlots, OlaApiError } from "@/lib/ola/client"
import { isOlaConfigured, isOlaHandoffEnabled } from "@/lib/ola/config"
import { handoffWeightLossToOla } from "@/lib/ola/weight-loss-handoff"
import { PHARMACY_PHONE_DISPLAY, toUsE164 } from "@/lib/phone"
import { parseUsState, requiresSyncVisit } from "@/lib/us-states"
import {
  formatWeightLossSupplyFromKitCount,
  getWeightLossDose,
  WEIGHT_LOSS_ONLINE_CARD_HOLD_ENABLED,
} from "@/lib/weight-loss-catalog"
import { snapshotBillingKitCountForNewIntake } from "@/lib/weight-loss-dose-review"
import {
  formatInjectionConsentsSummary,
  validateInjectionTelehealthConsents,
  type InjectionTelehealthConsentValues,
} from "@/lib/injection-telehealth-consents"
import {
  ensurePatientFromIntake,
} from "@/lib/ensure-patient-from-intake"

type WeightLossIntakePayload = {
  patientInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    dateOfBirth: string
    gender: "male" | "female" | "other" | ""
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
    selectedDoseTier: string
    priorGlpExperience: string
    weightLossGoals: string[]
    comorbidities: string[]
    additionalConcerns: string
  }
  visit?: {
    scheduleStart: string
    scheduleEnd: string
    providerGuid: string
  } | null
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
Sex:            ${data.patientInfo.gender || "Not provided"}
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
Vial Strength:          ${data.treatmentInfo.selectedDoseTier}
Pricing Model:          Vial-strength kit pricing (hold at selected mg; +$25 live visit on monthly if required, waived on 90-day / 3-kit supply)
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

function parseVisit(value: unknown): WeightLossIntakePayload["visit"] {
  if (!value || typeof value !== "object") return null
  const visit = value as Record<string, unknown>
  const scheduleStart = String(visit.scheduleStart || "")
  const scheduleEnd = String(visit.scheduleEnd || "")
  const providerGuid = String(visit.providerGuid || "")
  if (!scheduleStart || !scheduleEnd || !providerGuid) return null
  return { scheduleStart, scheduleEnd, providerGuid }
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
      gender:
        patient.gender === "male" || patient.gender === "female" || patient.gender === "other"
          ? patient.gender
          : "",
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
      selectedDoseTier: String(treatment.selectedDoseTier || "starter"),
      priorGlpExperience: String(treatment.priorGlpExperience || ""),
      weightLossGoals: (treatment.weightLossGoals as string[]) || [],
      comorbidities: (treatment.comorbidities as string[]) || [],
      additionalConcerns: String(treatment.additionalConcerns || ""),
    },
    visit: parseVisit(rawData.visit),
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
        "GLP-1 provider-guided weight management typically requires a BMI of 27+ with a related condition, or 30+. Please consult your primary care provider.",
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

    const homeState = parseUsState(data.patientInfo.state)
    const shippingState = parseUsState(data.identity.shippingState)
    if (!homeState || !shippingState) {
      return NextResponse.json({ error: "Enter a U.S. state for your home address and shipping address." }, { status: 400 })
    }
    if (!data.patientInfo.gender) {
      return NextResponse.json({ error: "Sex is required." }, { status: 400 })
    }
    if (!toUsE164(data.patientInfo.phone)) {
      return NextResponse.json({ error: "Enter a 10-digit U.S. phone number." }, { status: 400 })
    }
    if (!data.patientInfo.address.trim() || !data.patientInfo.city.trim() || !data.patientInfo.zipCode.trim()) {
      return NextResponse.json({ error: "Street address, city, and ZIP code are required." }, { status: 400 })
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.patientInfo.dateOfBirth)) {
      return NextResponse.json({ error: "Enter a valid date of birth." }, { status: 400 })
    }

    if (requiresSyncVisit(homeState.code)) {
      if (!data.visit) {
        return NextResponse.json(
          { error: `${homeState.name} requires a live video visit. Choose an appointment time.` },
          { status: 400 }
        )
      }
      if (!isOlaConfigured()) {
        return NextResponse.json(
          { error: `Live video visits are not available yet. Call ${PHARMACY_PHONE_DISPLAY}.` },
          { status: 400 }
        )
      }
      try {
        const slots = await listOlaScheduleSlots(homeState.code)
        const matched = slots.some(
          (slot) =>
            slot.scheduleStart === data.visit?.scheduleStart &&
            slot.scheduleEnd === data.visit?.scheduleEnd &&
            slot.providerGuid === data.visit?.providerGuid
        )
        if (!matched) {
          return NextResponse.json(
            { error: "That video visit time is no longer available. Choose another time." },
            { status: 400 }
          )
        }
      } catch (error) {
        const message = error instanceof OlaApiError ? error.message : "Video visit times could not be confirmed."
        return NextResponse.json({ error: `${message} Call ${PHARMACY_PHONE_DISPLAY}.` }, { status: 502 })
      }
    }

    if (!data.treatmentInfo.selectedProgram) {
      return NextResponse.json({ error: "Please select a treatment program" }, { status: 400 })
    }

    const requireCardPayment = WEIGHT_LOSS_ONLINE_CARD_HOLD_ENABLED || isOlaHandoffEnabled()

    if (!requireCardPayment) {
      data.identity.stripePaymentIntentId = null
      data.identity.paymentOnFile = false
    }

    const paymentError = requireCardPayment
      ? requireIntakePaymentSubmission(data.consents, data.identity)
      : requireIntakeIdentitySubmission(data.consents, data.identity)
    if (paymentError) {
      return NextResponse.json({ error: paymentError }, { status: 400 })
    }

    let paymentReceived = false
    if (requireCardPayment) {
      const stripeCheck = await verifyPaymentHoldReady(data.identity.stripePaymentIntentId || "")
      if (!stripeCheck.ok) {
        return NextResponse.json({ error: stripeCheck.error || "Payment not authorized" }, { status: 400 })
      }
      paymentReceived = true
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
    const partnerName = "Clinician network"
    const partnerStatus = "ready_for_clinician_network"

    try {
      const resolved =
        getWeightLossDose(data.treatmentInfo.selectedProgram, data.treatmentInfo.selectedDoseTier) ||
        getWeightLossDose(data.treatmentInfo.selectedProgram, "starter")
      const doseTier = resolved?.id || "sema-1mg"
      const billingPlan =
        data.treatmentInfo.selectedBillingPlan === "quarterly" ? "quarterly" : "monthly"
      const billingKitCount = snapshotBillingKitCountForNewIntake(billingPlan)
      const billingSupplyLabel = formatWeightLossSupplyFromKitCount(billingKitCount)

      await sql(
        `ALTER TABLE weight_loss_intake ADD COLUMN IF NOT EXISTS selected_dose_tier TEXT`,
        []
      ).catch(() => [])
      await sql(
        `ALTER TABLE weight_loss_intake ADD COLUMN IF NOT EXISTS billing_kit_count INTEGER`,
        []
      ).catch(() => [])
      await sql(
        `ALTER TABLE weight_loss_intake ADD COLUMN IF NOT EXISTS billing_supply_label TEXT`,
        []
      ).catch(() => [])

      const { patientId } = await ensurePatientFromIntake({
        email: data.patientInfo.email,
        firstName: data.patientInfo.firstName,
        lastName: data.patientInfo.lastName,
        phone: data.patientInfo.phone,
        dateOfBirth: data.patientInfo.dateOfBirth,
        address: data.patientInfo.address,
        city: data.patientInfo.city,
        state: data.patientInfo.state,
        zip: data.patientInfo.zipCode,
      })
      const stripePaymentIntentId = paymentReceived ? data.identity.stripePaymentIntentId : null
      const paymentStatus = paymentReceived
        ? paymentStatusFromHold(stripePaymentIntentId)
        : "awaiting_pharmacy"

      const values = [
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
          doseTier,
          data.treatmentInfo.priorGlpExperience,
          JSON.stringify(data.treatmentInfo.weightLossGoals),
          JSON.stringify(data.treatmentInfo.comorbidities),
          data.treatmentInfo.additionalConcerns,
          data.identity.shippingAddress,
          data.identity.shippingCity,
          data.identity.shippingState,
          data.identity.shippingZip,
          STANDARD_INTAKE_STATUS.pending,
          stripePaymentIntentId,
          data.identity.idFrontKey,
          data.identity.idBackKey,
          partnerName,
          partnerStatus,
          patientId,
          paymentStatus,
          billingKitCount,
          billingSupplyLabel,
        ]

      try {
        await sql(
          `INSERT INTO weight_loss_intake (
            id, first_name, last_name, email, phone, date_of_birth, state, address, city, zip_code,
            height_inches, weight_lbs, bmi, goal_weight_lbs, systolic_bp, diastolic_bp,
            pregnant_or_breastfeeding, mtc_or_men2_history, pancreatitis_history, type1_diabetes,
            eating_disorder, on_other_glp,
            type2_diabetes, hypertension, gallbladder_disease, diabetic_retinopathy, bariatric_surgery,
            sleep_apnea, cardiovascular_disease, current_medications, allergies,
            selected_program, selected_billing_plan, selected_dose_tier, prior_glp_experience,
            weight_loss_goals, comorbidities, additional_concerns,
            shipping_address, shipping_city, shipping_state, shipping_zip,
            status, stripe_payment_intent_id, id_front_key, id_back_key, partner_name, partner_status,
            patient_id, payment_status, billing_kit_count, billing_supply_label
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16,
            $17, $18, $19, $20, $21, $22,
            $23, $24, $25, $26, $27, $28, $29, $30, $31,
            $32, $33, $34, $35, $36::jsonb, $37::jsonb, $38,
            $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51, $52
          )`,
          values
        )
      } catch (columnError) {
        console.warn(
          "weight_loss_intake insert with billing_kit_count failed; retrying without snapshot columns.",
          columnError
        )
        const fallbackConcerns =
          `[selected_dose_tier:${doseTier}] [billing_kit_count:${billingKitCount}] ${data.treatmentInfo.additionalConcerns}`.trim()
        await sql(
          `INSERT INTO weight_loss_intake (
            id, first_name, last_name, email, phone, date_of_birth, state, address, city, zip_code,
            height_inches, weight_lbs, bmi, goal_weight_lbs, systolic_bp, diastolic_bp,
            pregnant_or_breastfeeding, mtc_or_men2_history, pancreatitis_history, type1_diabetes,
            eating_disorder, on_other_glp,
            type2_diabetes, hypertension, gallbladder_disease, diabetic_retinopathy, bariatric_surgery,
            sleep_apnea, cardiovascular_disease, current_medications, allergies,
            selected_program, selected_billing_plan, selected_dose_tier, prior_glp_experience,
            weight_loss_goals, comorbidities, additional_concerns,
            shipping_address, shipping_city, shipping_state, shipping_zip,
            status, stripe_payment_intent_id, id_front_key, id_back_key, partner_name, partner_status,
            patient_id, payment_status
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16,
            $17, $18, $19, $20, $21, $22,
            $23, $24, $25, $26, $27, $28, $29, $30, $31,
            $32, $33, $34, $35, $36::jsonb, $37::jsonb, $38,
            $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50
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
            doseTier,
            data.treatmentInfo.priorGlpExperience,
            JSON.stringify(data.treatmentInfo.weightLossGoals),
            JSON.stringify(data.treatmentInfo.comorbidities),
            fallbackConcerns,
            data.identity.shippingAddress,
            data.identity.shippingCity,
            data.identity.shippingState,
            data.identity.shippingZip,
            STANDARD_INTAKE_STATUS.pending,
            stripePaymentIntentId,
            data.identity.idFrontKey,
            data.identity.idBackKey,
            partnerName,
            partnerStatus,
            patientId,
            paymentStatus,
          ]
        )
      }
    } catch (dbError) {
      console.error("Failed to persist weight loss intake:", dbError)
      return NextResponse.json(
        { error: "Failed to save your submission. Please try again." },
        { status: 500 }
      )
    }

    const billingPlanForHandoff =
      data.treatmentInfo.selectedBillingPlan === "quarterly" ? "quarterly" : "monthly"
    const doseForHandoff =
      getWeightLossDose(data.treatmentInfo.selectedProgram, data.treatmentInfo.selectedDoseTier) ||
      getWeightLossDose(data.treatmentInfo.selectedProgram, "starter")
    let handoffDetail = "Saved for staff review."
    try {
      const handoff = await handoffWeightLossToOla({
        submissionId,
        firstName: data.patientInfo.firstName,
        lastName: data.patientInfo.lastName,
        email: data.patientInfo.email,
        phone: data.patientInfo.phone,
        dateOfBirth: data.patientInfo.dateOfBirth,
        gender: data.patientInfo.gender || "other",
        address: data.patientInfo.address,
        city: data.patientInfo.city,
        state: homeState.name,
        zipCode: data.patientInfo.zipCode,
        program: data.treatmentInfo.selectedProgram,
        billingPlan: billingPlanForHandoff,
        doseLabel: doseForHandoff?.label || data.treatmentInfo.selectedDoseTier,
        allergies: data.medicalHistory.allergies,
        paymentOnFile: paymentReceived,
        questions: [
          { question: "Program", answer: data.treatmentInfo.selectedProgram },
          { question: "Billing plan", answer: billingPlanForHandoff },
          { question: "Height inches", answer: String(data.vitals.heightInches) },
          { question: "Weight lbs", answer: String(data.vitals.weightLbs) },
          { question: "BMI", answer: data.vitals.bmi.toFixed(1) },
          { question: "Blood pressure", answer: `${data.vitals.systolicBP}/${data.vitals.diastolicBP}` },
          { question: "Current medications", answer: data.medicalHistory.currentMedications || "None reported" },
          { question: "Allergies", answer: data.medicalHistory.allergies || "None reported" },
          { question: "Additional concerns", answer: data.treatmentInfo.additionalConcerns || "None" },
        ],
        schedule: data.visit ?? null,
        idFrontKey: data.identity.idFrontKey,
        idBackKey: data.identity.idBackKey,
      })
      handoffDetail = handoff.detail
      await sql(
        `ALTER TABLE weight_loss_intake ADD COLUMN IF NOT EXISTS partner_case_id TEXT`,
        []
      ).catch(() => [])
      await sql(
        `UPDATE weight_loss_intake
         SET partner_name = $2, partner_status = $3, partner_case_id = $4
         WHERE id = $1`,
        [submissionId, handoff.partnerName, handoff.partnerStatus, handoff.partnerCaseId]
      )
    } catch (handoffError) {
      console.error("Weight loss clinician handoff failed:", handoffError)
      handoffDetail = "Clinician network handoff failed after the intake was saved."
    }

    await notifyClinicianQueue({
      submissionId,
      subject: `[WEIGHT_LOSS ${submissionId}] Ready for the clinician network — ${data.patientInfo.firstName} ${data.patientInfo.lastName}`,
      body: `${clinicalSummary}\nClinician network: ${handoffDetail}\n`,
    })

    return NextResponse.json(
      {
        success: true,
        message: `Your intake has been securely submitted. A licensed clinician will review your information.`,
        submissionId,
        estimatedReviewTime: PRIMARY_PHYSICIAN.reviewSla,
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
