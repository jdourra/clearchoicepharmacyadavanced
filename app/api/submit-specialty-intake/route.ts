import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sql } from "@/lib/db"
import { getUserIdFromRequest } from "@/lib/server-session"
import { SPECIALTY_INTAKE_STATUS } from "@/lib/specialty-pharmacy-catalog"

type SpecialtyIntakePayload = {
  patient: {
    firstName: string
    lastName: string
    email: string
    phone: string
    dateOfBirth: string
    state: string
    address: string
    city: string
    zipCode: string
    password?: string
  }
  medication: {
    selectedMedication: string
    medicationOther: string
    requestType: string
  }
  insurance: {
    planName: string
    memberId: string
    groupNumber: string
    bin: string
    pcn: string
    cardholderName: string
  }
  prescription: {
    method: string
    transferRxNumbers: string
    transferPharmacyName: string
    transferPharmacyPhone: string
    doctorName: string
    doctorPhone: string
    prescriptionFileKey: string
  }
  clinical: {
    diagnosis: string
    currentlyOnMedication: string
    priorAuthStatus: string
    prescriberName: string
    prescriberPhone: string
    allergies: string
    additionalNotes: string
    fulfillmentPreference: string
  }
}

function formatStaffSummary(data: SpecialtyIntakePayload, submissionId: string): string {
  const medLabel =
    data.medication.selectedMedication === "other"
      ? data.medication.medicationOther
      : data.medication.selectedMedication

  return `
═══════════════════════════════════════════════════════════════════════════════
           SPECIALTY MEDICINE TRANSFER INTAKE — CLEAR CHOICE PHARMACY
═══════════════════════════════════════════════════════════════════════════════
Submission ID: ${submissionId}
Submitted:     ${new Date().toISOString()}
Status:        PENDING PHARMACY REVIEW

───────────────────────────────────────────────────────────────────────────────
                              PATIENT CONTACT
───────────────────────────────────────────────────────────────────────────────
Name:    ${data.patient.firstName} ${data.patient.lastName}
DOB:     ${data.patient.dateOfBirth}
Email:   ${data.patient.email}
Phone:   ${data.patient.phone}
Address: ${data.patient.address}, ${data.patient.city}, ${data.patient.state} ${data.patient.zipCode}

───────────────────────────────────────────────────────────────────────────────
                              MEDICATION REQUEST
───────────────────────────────────────────────────────────────────────────────
Medication:   ${medLabel || "Not specified"}
Request type: ${data.medication.requestType}

───────────────────────────────────────────────────────────────────────────────
                              INSURANCE
───────────────────────────────────────────────────────────────────────────────
Plan:       ${data.insurance.planName}
Member ID:  ${data.insurance.memberId}
Group:      ${data.insurance.groupNumber || "—"}
BIN:        ${data.insurance.bin || "—"}
PCN:        ${data.insurance.pcn || "—"}
Cardholder: ${data.insurance.cardholderName || "—"}

───────────────────────────────────────────────────────────────────────────────
                           PRESCRIPTION SOURCE
───────────────────────────────────────────────────────────────────────────────
Method: ${data.prescription.method}
${
  data.prescription.method === "transfer"
    ? `Rx numbers: ${data.prescription.transferRxNumbers}
Current pharmacy: ${data.prescription.transferPharmacyName}
Pharmacy phone: ${data.prescription.transferPharmacyPhone}`
    : data.prescription.method === "eprescribe"
      ? `Doctor: ${data.prescription.doctorName}
Doctor phone: ${data.prescription.doctorPhone}`
      : data.prescription.method === "upload"
        ? `Uploaded file key: ${data.prescription.prescriptionFileKey || "—"}`
        : ""
}

───────────────────────────────────────────────────────────────────────────────
                           CLINICAL DETAILS
───────────────────────────────────────────────────────────────────────────────
Diagnosis:           ${data.clinical.diagnosis || "—"}
Currently on med:    ${data.clinical.currentlyOnMedication || "—"}
Prior auth status:   ${data.clinical.priorAuthStatus || "—"}
Prescriber:          ${data.clinical.prescriberName || "—"}
Prescriber phone:    ${data.clinical.prescriberPhone || "—"}
Allergies:           ${data.clinical.allergies || "None reported"}
Fulfillment:         ${data.clinical.fulfillmentPreference || "—"}

Additional notes:
${data.clinical.additionalNotes || "None"}

═══════════════════════════════════════════════════════════════════════════════
`
}

function parsePayload(raw: Record<string, unknown>): SpecialtyIntakePayload {
  const patient = (raw.patient || {}) as Record<string, string>
  const medication = (raw.medication || {}) as Record<string, string>
  const insurance = (raw.insurance || {}) as Record<string, string>
  const prescription = (raw.prescription || {}) as Record<string, string>
  const clinical = (raw.clinical || {}) as Record<string, string>

  return {
    patient: {
      firstName: patient.firstName || "",
      lastName: patient.lastName || "",
      email: patient.email || "",
      phone: patient.phone || "",
      dateOfBirth: patient.dateOfBirth || "",
      state: patient.state || "",
      address: patient.address || "",
      city: patient.city || "",
      zipCode: patient.zipCode || "",
      password: patient.password || undefined,
    },
    medication: {
      selectedMedication: medication.selectedMedication || "",
      medicationOther: medication.medicationOther || "",
      requestType: medication.requestType || "",
    },
    insurance: {
      planName: insurance.planName || "",
      memberId: insurance.memberId || "",
      groupNumber: insurance.groupNumber || "",
      bin: insurance.bin || "",
      pcn: insurance.pcn || "",
      cardholderName: insurance.cardholderName || "",
    },
    prescription: {
      method: prescription.method || "",
      transferRxNumbers: prescription.transferRxNumbers || "",
      transferPharmacyName: prescription.transferPharmacyName || "",
      transferPharmacyPhone: prescription.transferPharmacyPhone || "",
      doctorName: prescription.doctorName || "",
      doctorPhone: prescription.doctorPhone || "",
      prescriptionFileKey: prescription.prescriptionFileKey || "",
    },
    clinical: {
      diagnosis: clinical.diagnosis || "",
      currentlyOnMedication: clinical.currentlyOnMedication || "",
      priorAuthStatus: clinical.priorAuthStatus || "",
      prescriberName: clinical.prescriberName || "",
      prescriberPhone: clinical.prescriberPhone || "",
      allergies: clinical.allergies || "",
      additionalNotes: clinical.additionalNotes || "",
      fulfillmentPreference: clinical.fulfillmentPreference || "",
    },
  }
}

function validatePayload(data: SpecialtyIntakePayload): string | null {
  if (!data.patient.firstName || !data.patient.lastName || !data.patient.email) {
    return "First name, last name, and email are required"
  }
  if (!/^\S+@\S+\.\S+$/.test(data.patient.email)) {
    return "Invalid email format"
  }
  if (!data.patient.phone || !data.patient.dateOfBirth) {
    return "Phone and date of birth are required"
  }
  if (!data.medication.requestType) {
    return "Please select a request type"
  }
  if (!data.medication.selectedMedication) {
    return "Please select a medication"
  }
  if (data.medication.selectedMedication === "other" && !data.medication.medicationOther.trim()) {
    return "Please enter your medication name"
  }
  if (!data.insurance.planName || !data.insurance.memberId) {
    return "Insurance plan name and member ID are required"
  }
  if (!data.prescription.method) {
    return "Please select how we will receive your prescription"
  }
  if (data.prescription.method === "transfer") {
    if (!data.prescription.transferRxNumbers.trim()) return "Prescription numbers are required for transfers"
    if (!data.prescription.transferPharmacyName.trim()) return "Current pharmacy name is required"
    if (!data.prescription.transferPharmacyPhone.trim()) return "Current pharmacy phone is required"
  }
  if (data.prescription.method === "eprescribe") {
    if (!data.prescription.doctorName.trim()) return "Doctor name is required"
    if (!data.prescription.doctorPhone.trim()) return "Doctor phone is required"
  }
  if (data.prescription.method === "upload" && !data.prescription.prescriptionFileKey) {
    return "Please upload your prescription"
  }
  if (!data.clinical.fulfillmentPreference) {
    return "Please select pickup or delivery"
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json()
    const data = parsePayload(raw)

    const validationError = validatePayload(data)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    let patientId = await getUserIdFromRequest(request)
    let sessionId: string | undefined

    if (!patientId && data.patient.password) {
      try {
        const signup = await auth.signUp(
          data.patient.email,
          data.patient.password,
          data.patient.firstName,
          data.patient.lastName,
          data.patient.phone,
          data.patient.dateOfBirth,
          data.patient.address,
          data.patient.city,
          data.patient.state,
          data.patient.zipCode
        )
        patientId = signup.user.id
        sessionId = signup.sessionId
      } catch (err) {
        const message = err instanceof Error ? err.message : "Account creation failed"
        if (message.includes("already registered")) {
          return NextResponse.json(
            { error: "An account with this email already exists. Please sign in and try again." },
            { status: 409 }
          )
        }
        return NextResponse.json({ error: message }, { status: 400 })
      }
    }

    const submissionId = `CCR-SP-${Date.now().toString(36).toUpperCase()}`
    const staffSummary = formatStaffSummary(data, submissionId)
    console.info("[specialty-intake] New submission:\n", staffSummary)

    const medValue =
      data.medication.selectedMedication === "other"
        ? data.medication.medicationOther.trim()
        : data.medication.selectedMedication

    try {
      await sql(
        `INSERT INTO specialty_intake (
          id, patient_id, first_name, last_name, email, phone, date_of_birth, state, address, city, zip_code,
          selected_medication, medication_other, request_type,
          insurance_plan_name, insurance_member_id, insurance_group_number, insurance_bin, insurance_pcn, insurance_cardholder_name,
          prescription_method, transfer_rx_numbers, transfer_pharmacy_name, transfer_pharmacy_phone,
          doctor_name, doctor_phone, prescription_file_key,
          diagnosis, currently_on_medication, prior_auth_status, prescriber_name, prescriber_phone,
          allergies, additional_notes, fulfillment_preference, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
          $12, $13, $14,
          $15, $16, $17, $18, $19, $20,
          $21, $22, $23, $24,
          $25, $26, $27,
          $28, $29, $30, $31, $32,
          $33, $34, $35, $36
        )`,
        [
          submissionId,
          patientId || null,
          data.patient.firstName,
          data.patient.lastName,
          data.patient.email.toLowerCase(),
          data.patient.phone,
          data.patient.dateOfBirth,
          data.patient.state,
          data.patient.address,
          data.patient.city,
          data.patient.zipCode,
          medValue,
          data.medication.medicationOther || null,
          data.medication.requestType,
          data.insurance.planName,
          data.insurance.memberId,
          data.insurance.groupNumber || null,
          data.insurance.bin || null,
          data.insurance.pcn || null,
          data.insurance.cardholderName || null,
          data.prescription.method,
          data.prescription.transferRxNumbers || null,
          data.prescription.transferPharmacyName || null,
          data.prescription.transferPharmacyPhone || null,
          data.prescription.doctorName || null,
          data.prescription.doctorPhone || null,
          data.prescription.prescriptionFileKey || null,
          data.clinical.diagnosis || null,
          data.clinical.currentlyOnMedication || null,
          data.clinical.priorAuthStatus || null,
          data.clinical.prescriberName || null,
          data.clinical.prescriberPhone || null,
          data.clinical.allergies || null,
          data.clinical.additionalNotes || null,
          data.clinical.fulfillmentPreference,
          SPECIALTY_INTAKE_STATUS.pending,
        ]
      )
    } catch (dbError) {
      console.error("[specialty-intake] DB insert failed:", dbError)
      return NextResponse.json(
        { error: "Failed to save your submission. Please try again or call (248) 987-6182." },
        { status: 500 }
      )
    }

    const response = NextResponse.json({
      success: true,
      message:
        "Your specialty transfer request has been submitted. Our team will contact you within 1 business day.",
      submissionId,
      estimatedReviewTime: "1 business day",
    })

    if (sessionId) {
      response.headers.append("Set-Cookie", auth.buildCookieHeader(sessionId))
    }

    return response
  } catch (error) {
    console.error("[specialty-intake] Error:", error)
    return NextResponse.json({ error: "Failed to process your submission. Please try again." }, { status: 500 })
  }
}
