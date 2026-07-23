import "server-only"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import { PRIMARY_PHYSICIAN } from "@/lib/clinical-provider"
import { getWeightLossDose } from "@/lib/weight-loss-catalog"
import type { AdminIntakeServiceType } from "@/lib/telehealth/intake-registry"
import type { ClinicalRxPayload } from "@/lib/clinical-prescription-types"
import { formatPhoneDisplay } from "@/lib/phone"

export type { ClinicalRxPayload } from "@/lib/clinical-prescription-types"

export type ClinicalPrescriptionRecord = {
  id: string
  serviceType: string
  intakeId: string
  medicationName: string
  strength: string
  directions: string
  quantity: string
  refills: number
  patientName: string
  patientDob: string
  patientAddress: string
  patientCity: string
  patientState: string
  patientZip: string
  patientPhone: string
  patientEmail: string
  prescriberName: string
  prescriberCredentials: string
  prescriberLicense: string
  prescriberNpi: string
  pharmacyName: string
  pharmacyAddress: string
  status: string
  dropboxSignatureRequestId: string | null
  unsignedPdfKey: string | null
  signedPdfKey: string | null
  clinicianEsignName: string | null
  signedAt: string | null
  createdAt: string
}

export function getPrescriberLicense(): string {
  return process.env.PRESCRIBER_LICENSE?.trim() || process.env.DR_DOURRA_LICENSE?.trim() || ""
}

export function getPrescriberNpi(): string {
  return process.env.PRESCRIBER_NPI?.trim() || process.env.DR_DOURRA_NPI?.trim() || ""
}

export function suggestPrescriptionFromIntake(
  serviceType: AdminIntakeServiceType | string,
  detail: Record<string, unknown>
): ClinicalRxPayload {
  const billing = String(detail.selected_billing_plan ?? "monthly")
  const defaultRefills = billing === "quarterly" ? 2 : 0

  if (serviceType === "weight_loss") {
    const programId = String(detail.selected_program ?? "")
    const doseId = String(detail.selected_dose_tier ?? "")
    const dose = getWeightLossDose(programId, doseId)
    const drug =
      programId === "tirzepatide"
        ? "Compounded Tirzepatide injection"
        : "Compounded Semaglutide injection"
    const strength = dose
      ? `${dose.weeklyMg} mg weekly (${dose.vialMg} mg / 30-day vial)`
      : doseId || "per protocol"
    return {
      medicationName: drug,
      strength,
      directions:
        "Inject subcutaneously once weekly as directed by prescribing physician. Use each vial as a 30-day supply (4 weekly injections).",
      quantity: billing === "quarterly" ? "3 kits (90-day supply)" : "1 kit (30-day supply)",
      refills: defaultRefills,
    }
  }

  if (serviceType === "trt") {
    return {
      medicationName: String(detail.selected_program ?? "Testosterone therapy"),
      strength: "per protocol",
      directions: "Use as directed by prescribing physician.",
      quantity: "1 supply cycle",
      refills: defaultRefills,
    }
  }

  if (serviceType === "rejuvenation_vial") {
    return {
      medicationName: String(detail.selected_vial_title ?? detail.selected_vial ?? "Compounded vial"),
      strength: "per protocol",
      directions: "Inject as directed by prescribing physician.",
      quantity: "1 kit",
      refills: 0,
    }
  }

  if (serviceType === "mens_health") {
    return {
      medicationName: String(detail.selected_product ?? "ED therapy"),
      strength: "per protocol",
      directions: "Use as directed by prescribing physician.",
      quantity: "1 supply",
      refills: defaultRefills,
    }
  }

  return {
    medicationName: "Compounded medication",
    strength: "per protocol",
    directions: "Use as directed by prescribing physician.",
    quantity: "1",
    refills: 0,
  }
}

export function patientAddressLine(detail: Record<string, unknown>): {
  address: string
  city: string
  state: string
  zip: string
} {
  return {
    address: String(detail.shipping_address ?? detail.address ?? ""),
    city: String(detail.shipping_city ?? detail.city ?? ""),
    state: String(detail.shipping_state ?? detail.state ?? "Michigan"),
    zip: String(detail.shipping_zip ?? detail.zip_code ?? ""),
  }
}

export async function buildPrescriptionPdf(params: {
  intakeId: string
  serviceLabel: string
  rx: ClinicalRxPayload
  detail: Record<string, unknown>
  signedName?: string | null
  signedAt?: string | null
}): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  const page = pdf.addPage([612, 792])
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const { width, height } = page.getSize()
  let y = height - 48

  const draw = (text: string, opts?: { size?: number; bold?: boolean; color?: ReturnType<typeof rgb> }) => {
    const size = opts?.size ?? 11
    page.drawText(text, {
      x: 48,
      y,
      size,
      font: opts?.bold ? bold : font,
      color: opts?.color ?? rgb(0.1, 0.1, 0.1),
      maxWidth: width - 96,
    })
    y -= size + 8
  }

  const addr = patientAddressLine(params.detail)
  const patientName = `${params.detail.first_name ?? ""} ${params.detail.last_name ?? ""}`.trim() || "Patient"

  draw("CLEAR CHOICE PHARMACY", { size: 16, bold: true })
  draw("Prescription / Medication Order", { size: 13, bold: true })
  draw(`Service: ${params.serviceLabel}`)
  draw(`Intake ID: ${params.intakeId}`)
  draw(`Date: ${new Date().toLocaleString("en-US", { timeZone: "America/Detroit" })}`)
  y -= 8

  draw("PATIENT", { size: 12, bold: true })
  draw(`Name: ${patientName}`)
  draw(`DOB: ${String(params.detail.date_of_birth ?? "—")}`)
  draw(`Phone: ${formatPhoneDisplay(String(params.detail.phone ?? "")) || "—"}`)
  draw(`Email: ${String(params.detail.email ?? "—")}`)
  draw(`Address: ${addr.address}`)
  draw(`${addr.city}, ${addr.state} ${addr.zip}`)
  y -= 8

  draw("MEDICATION", { size: 12, bold: true })
  draw(`Drug: ${params.rx.medicationName}`)
  draw(`Strength: ${params.rx.strength || "—"}`)
  draw(`Directions (SIG): ${params.rx.directions}`)
  draw(`Quantity: ${params.rx.quantity}`)
  draw(`Refills authorized: ${params.rx.refills}`)
  y -= 8

  draw("PRESCRIBER", { size: 12, bold: true })
  draw(`${PRIMARY_PHYSICIAN.name}, ${PRIMARY_PHYSICIAN.credentials}`)
  draw(`State: ${PRIMARY_PHYSICIAN.state}`)
  draw(`License #: ${getPrescriberLicense() || "(set PRESCRIBER_LICENSE)"}`)
  draw(`NPI: ${getPrescriberNpi() || "(set PRESCRIBER_NPI)"}`)
  y -= 8

  draw("DISPENSE TO", { size: 12, bold: true })
  draw("Clear Choice Pharmacy — Novi, MI")
  draw(`Phone: ${PRIMARY_PHYSICIAN.pharmacyPhone}`)
  y -= 16

  draw("ELECTRONIC SIGNATURE", { size: 12, bold: true })
  if (params.signedName) {
    draw(`Signed by: ${params.signedName}`)
    draw(`Signed at: ${params.signedAt || new Date().toISOString()}`)
    draw("I authorize this prescription for the patient named above.")
  } else {
    draw("Awaiting electronic signature via Dropbox Sign.")
    draw("Signature field appears on the following page / signature panel.")
  }

  y -= 24
  draw("This document was generated by Clear Choice Pharmacy clinical intake review.", {
    size: 8,
    color: rgb(0.4, 0.4, 0.4),
  })

  return pdf.save()
}

export function mapPrescriptionRow(row: Record<string, unknown>): ClinicalPrescriptionRecord {
  return {
    id: String(row.id),
    serviceType: String(row.service_type),
    intakeId: String(row.intake_id),
    medicationName: String(row.medication_name),
    strength: String(row.strength ?? ""),
    directions: String(row.directions ?? ""),
    quantity: String(row.quantity ?? ""),
    refills: Number(row.refills ?? 0),
    patientName: String(row.patient_name ?? ""),
    patientDob: String(row.patient_dob ?? ""),
    patientAddress: String(row.patient_address ?? ""),
    patientCity: String(row.patient_city ?? ""),
    patientState: String(row.patient_state ?? ""),
    patientZip: String(row.patient_zip ?? ""),
    patientPhone: String(row.patient_phone ?? ""),
    patientEmail: String(row.patient_email ?? ""),
    prescriberName: String(row.prescriber_name ?? ""),
    prescriberCredentials: String(row.prescriber_credentials ?? ""),
    prescriberLicense: String(row.prescriber_license ?? ""),
    prescriberNpi: String(row.prescriber_npi ?? ""),
    pharmacyName: String(row.pharmacy_name ?? "Clear Choice Pharmacy"),
    pharmacyAddress: String(row.pharmacy_address ?? "Novi, MI"),
    status: String(row.status ?? ""),
    dropboxSignatureRequestId: row.dropbox_signature_request_id
      ? String(row.dropbox_signature_request_id)
      : null,
    unsignedPdfKey: row.unsigned_pdf_key ? String(row.unsigned_pdf_key) : null,
    signedPdfKey: row.signed_pdf_key ? String(row.signed_pdf_key) : null,
    clinicianEsignName: row.clinician_esign_name ? String(row.clinician_esign_name) : null,
    signedAt: row.signed_at ? String(row.signed_at) : null,
    createdAt: String(row.created_at ?? ""),
  }
}
