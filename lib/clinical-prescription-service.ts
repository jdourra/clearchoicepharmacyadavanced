import "server-only"
import { randomUUID } from "crypto"
import { sql } from "@/lib/db"
import { SITE_URL } from "@/lib/site-config"
import { PRIMARY_PHYSICIAN } from "@/lib/clinical-provider"
import { notifyAdminAlert } from "@/lib/staff-notify"
import {
  buildPrescriptionPdf,
  getPrescriberLicense,
  getPrescriberNpi,
  mapPrescriptionRow,
  patientAddressLine,
  type ClinicalPrescriptionRecord,
  type ClinicalRxPayload,
} from "@/lib/clinical-prescription"
import { storePrescriptionPdf } from "@/lib/clinical-prescription-storage"
import {
  isDropboxSignConfigured,
  sendPrescriptionForSignature,
  downloadSignedPrescriptionPdf,
} from "@/lib/dropbox-sign"
import type { AdminIntakeServiceType } from "@/lib/telehealth/intake-registry"

export function shouldGeneratePrescription(serviceType: AdminIntakeServiceType | string): boolean {
  return (
    serviceType === "weight_loss" ||
    serviceType === "trt" ||
    serviceType === "rejuvenation_vial" ||
    serviceType === "mens_health" ||
    serviceType === "prescription_telemedicine"
  )
}

export async function getLatestPrescriptionForIntake(
  serviceType: string,
  intakeId: string
): Promise<ClinicalPrescriptionRecord | null> {
  const rows = await sql(
    `SELECT * FROM clinical_prescriptions
     WHERE service_type = $1 AND intake_id = $2
     ORDER BY created_at DESC
     LIMIT 1`,
    [serviceType, intakeId]
  ).catch(() => [])
  if (!rows.length) return null
  return mapPrescriptionRow(rows[0] as Record<string, unknown>)
}

export async function getPrescriptionById(
  id: string
): Promise<ClinicalPrescriptionRecord | null> {
  const rows = await sql(`SELECT * FROM clinical_prescriptions WHERE id = $1`, [id]).catch(
    () => []
  )
  if (!rows.length) return null
  return mapPrescriptionRow(rows[0] as Record<string, unknown>)
}

export async function getPrescriptionByDropboxRequestId(
  signatureRequestId: string
): Promise<ClinicalPrescriptionRecord | null> {
  const rows = await sql(
    `SELECT * FROM clinical_prescriptions WHERE dropbox_signature_request_id = $1 LIMIT 1`,
    [signatureRequestId]
  ).catch(() => [])
  if (!rows.length) return null
  return mapPrescriptionRow(rows[0] as Record<string, unknown>)
}

function normalizeRx(rx: ClinicalRxPayload): ClinicalRxPayload {
  const refills = Number.isFinite(rx.refills) ? Math.max(0, Math.floor(rx.refills)) : 0
  return {
    medicationName: rx.medicationName.trim() || "Compounded medication",
    strength: (rx.strength || "").trim(),
    directions: rx.directions.trim() || "Use as directed by prescribing physician.",
    quantity: rx.quantity.trim() || "1",
    refills,
    clinicianEsignName: rx.clinicianEsignName?.trim() || undefined,
  }
}

export async function createPrescriptionOnApprove(params: {
  serviceType: AdminIntakeServiceType
  serviceLabel: string
  intakeId: string
  detail: Record<string, unknown>
  rx: ClinicalRxPayload
}): Promise<{
  prescriptionId: string
  status: string
  dropboxSent: boolean
  dropboxError?: string
}> {
  const rx = normalizeRx(params.rx)
  const addr = patientAddressLine(params.detail)
  const patientName =
    `${params.detail.first_name ?? ""} ${params.detail.last_name ?? ""}`.trim() || "Patient"
  const prescriptionId = `rx_${randomUUID()}`

  const unsignedPdf = await buildPrescriptionPdf({
    intakeId: params.intakeId,
    serviceLabel: params.serviceLabel,
    rx,
    detail: params.detail,
  })

  const storedUnsigned = await storePrescriptionPdf({
    pdf: unsignedPdf,
    intakeId: params.intakeId,
    kind: "unsigned",
  })

  const useDropbox = isDropboxSignConfigured()
  let status = useDropbox ? "awaiting_signature" : "signed_local"
  let dropboxId: string | null = null
  let dropboxSent = false
  let dropboxError: string | undefined
  let signedPdfKey: string | null = null
  let clinicianEsignName: string | null = rx.clinicianEsignName || null
  let signedAt: string | null = null

  if (useDropbox) {
    try {
      const sent = await sendPrescriptionForSignature({
        pdfBytes: unsignedPdf,
        fileName: `${prescriptionId}.pdf`,
        title: `Rx — ${patientName}`,
        subject: `Sign prescription: ${rx.medicationName}`,
        message: `Please review and sign this prescription for ${patientName} (${params.serviceLabel}).`,
        metadata: {
          prescription_id: prescriptionId,
          intake_id: params.intakeId,
          service_type: params.serviceType,
        },
      })
      dropboxId = sent.signatureRequestId
      dropboxSent = true
    } catch (error) {
      dropboxError = error instanceof Error ? error.message : "Dropbox Sign send failed"
      console.error("[clinical-rx] Dropbox Sign send failed:", dropboxError)
      if (!clinicianEsignName) {
        throw new Error(
          `Dropbox Sign failed (${dropboxError}). Enter a typed e-signature name to approve without Dropbox, then retry.`
        )
      }
      status = "signed_local"
    }
  }

  if (status === "signed_local" && clinicianEsignName) {
    signedAt = new Date().toISOString()
    const signedPdf = await buildPrescriptionPdf({
      intakeId: params.intakeId,
      serviceLabel: params.serviceLabel,
      rx,
      detail: params.detail,
      signedName: clinicianEsignName,
      signedAt,
    })
    const storedSigned = await storePrescriptionPdf({
      pdf: signedPdf,
      intakeId: params.intakeId,
      kind: "signed",
    })
    signedPdfKey = storedSigned.storageKey
  }

  await sql(
    `INSERT INTO clinical_prescriptions (
      id, service_type, intake_id,
      medication_name, strength, directions, quantity, refills,
      patient_name, patient_dob, patient_address, patient_city, patient_state, patient_zip,
      patient_phone, patient_email,
      prescriber_name, prescriber_credentials, prescriber_license, prescriber_npi,
      pharmacy_name, pharmacy_address,
      status, dropbox_signature_request_id, unsigned_pdf_key, signed_pdf_key,
      clinician_esign_name, signed_at
    ) VALUES (
      $1,$2,$3,
      $4,$5,$6,$7,$8,
      $9,$10,$11,$12,$13,$14,
      $15,$16,
      $17,$18,$19,$20,
      $21,$22,
      $23,$24,$25,$26,
      $27,$28
    )`,
    [
      prescriptionId,
      params.serviceType,
      params.intakeId,
      rx.medicationName,
      rx.strength,
      rx.directions,
      rx.quantity,
      rx.refills,
      patientName,
      String(params.detail.date_of_birth ?? ""),
      addr.address,
      addr.city,
      addr.state,
      addr.zip,
      String(params.detail.phone ?? ""),
      String(params.detail.email ?? ""),
      PRIMARY_PHYSICIAN.name,
      PRIMARY_PHYSICIAN.credentials,
      getPrescriberLicense(),
      getPrescriberNpi(),
      "Clear Choice Pharmacy",
      "Novi, MI",
      status,
      dropboxId,
      storedUnsigned.storageKey,
      signedPdfKey,
      clinicianEsignName,
      signedAt,
    ]
  )

  if (status === "signed_local") {
    await notifyAdminRxReady({
      prescriptionId,
      patientName,
      medicationName: rx.medicationName,
      intakeId: params.intakeId,
      serviceType: params.serviceType,
      mode: "local",
    })
  } else if (dropboxSent) {
    void notifyAdminAlert({
      subject: `Rx sent for e-signature — ${patientName}`,
      body: [
        "A clinical prescription was generated and sent to Dropbox Sign.",
        "",
        `Patient: ${patientName}`,
        `Medication: ${rx.medicationName}`,
        `Prescription ID: ${prescriptionId}`,
        `Intake: ${params.intakeId}`,
        "",
        `Print (after signed): ${SITE_URL}/api/admin/prescriptions/${prescriptionId}/pdf`,
        `Review intake: ${SITE_URL}/admin/intakes/${params.serviceType}/${params.intakeId}`,
      ].join("\n"),
    }).catch((err) => console.error("[clinical-rx] admin alert failed:", err))
  }

  return { prescriptionId, status, dropboxSent, dropboxError }
}

export async function finalizeSignedPrescriptionFromDropbox(
  signatureRequestId: string
): Promise<{ ok: boolean; prescriptionId?: string; error?: string }> {
  const existing = await getPrescriptionByDropboxRequestId(signatureRequestId)
  if (!existing) {
    return { ok: false, error: "No prescription for signature request" }
  }
  if (existing.status === "signed" && existing.signedPdfKey) {
    return { ok: true, prescriptionId: existing.id }
  }

  try {
    const pdf = await downloadSignedPrescriptionPdf(signatureRequestId)
    const stored = await storePrescriptionPdf({
      pdf,
      intakeId: existing.intakeId,
      kind: "signed",
    })
    const signedAt = new Date().toISOString()
    await sql(
      `UPDATE clinical_prescriptions
       SET status = 'signed',
           signed_pdf_key = $1,
           signed_at = $2,
           updated_at = NOW()
       WHERE id = $3`,
      [stored.storageKey, signedAt, existing.id]
    )

    await notifyAdminRxReady({
      prescriptionId: existing.id,
      patientName: existing.patientName,
      medicationName: existing.medicationName,
      intakeId: existing.intakeId,
      serviceType: existing.serviceType,
      mode: "dropbox",
    })

    return { ok: true, prescriptionId: existing.id }
  } catch (error) {
    const message = error instanceof Error ? error.message : "finalize failed"
    console.error("[clinical-rx] finalize signed PDF failed:", message)
    return { ok: false, error: message }
  }
}

async function notifyAdminRxReady(params: {
  prescriptionId: string
  patientName: string
  medicationName: string
  intakeId: string
  serviceType: string
  mode: "local" | "dropbox"
}): Promise<void> {
  await notifyAdminAlert({
    subject: `Rx ready to print — ${params.patientName}`,
    body: [
      "A signed clinical prescription is ready for the pharmacy to print and fill.",
      "",
      `Patient: ${params.patientName}`,
      `Medication: ${params.medicationName}`,
      `Prescription ID: ${params.prescriptionId}`,
      `Signature: ${params.mode === "dropbox" ? "Dropbox Sign" : "Typed clinician e-sign"}`,
      "",
      `Download / print PDF: ${SITE_URL}/api/admin/prescriptions/${params.prescriptionId}/pdf`,
      `Intake: ${SITE_URL}/admin/intakes/${params.serviceType}/${params.intakeId}`,
    ].join("\n"),
  })
}
