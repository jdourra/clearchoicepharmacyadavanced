export type PrescriptionMethod = "upload" | "eprescribe" | "transfer" | "telemedicine" | "unknown"

export interface OrderPrescriptionUpload {
  id: string
  file_name: string | null
  file_url: string
  status: string
  upload_date: string
}

export interface OrderTelemedicineIntake {
  id: string
  status: string
  created_at: string
}

export interface OrderPrescriptionDetails {
  method: PrescriptionMethod
  deliveryMethod: string | null
  doctorName: string | null
  doctorPhone: string | null
  transferRxNumbers: string[]
  transferPharmacyName: string | null
  transferPharmacyPhone: string | null
  uploads: OrderPrescriptionUpload[]
  telemedicineIntake: OrderTelemedicineIntake | null
  rawNotes: string | null
}

function extractField(notes: string, label: string): string | null {
  const pattern = new RegExp(`${label}:\\s*([^,]+(?:,\\s*[^,]+)*?)(?=,\\s*(?:Delivery|Prescription|Doctor|RX Numbers|Pharmacy|Pharmacy Phone)|$)`, "i")
  const match = notes.match(pattern)
  return match?.[1]?.trim() || null
}

export function detectPrescriptionMethodFromNotes(notes: string): PrescriptionMethod {
  const lower = notes.toLowerCase()
  if (lower.includes("prescription: telemedicine") || lower.includes("prescription:telemedicine")) {
    return "telemedicine"
  }
  if (lower.includes("prescription: e-prescribe") || lower.includes("prescription: eprescribe")) {
    return "eprescribe"
  }
  if (lower.includes("prescription: transfer")) {
    return "transfer"
  }
  if (lower.includes("prescription: upload")) {
    return "upload"
  }
  return "unknown"
}

export function parseOrderPrescription(
  notes?: string | null,
  prescriptionMethod?: string | null
): OrderPrescriptionDetails {
  const rawNotes = notes?.trim() || null
  const method =
    (prescriptionMethod as PrescriptionMethod | null) ||
    (rawNotes ? detectPrescriptionMethodFromNotes(rawNotes) : "unknown")

  const deliveryMatch = rawNotes?.match(/Delivery:\s*(\w+)/i)
  const deliveryMethod = deliveryMatch?.[1]?.toLowerCase() || null

  const doctorName = rawNotes ? extractField(rawNotes, "Doctor") : null
  const doctorPhone = rawNotes ? extractField(rawNotes, "Doctor Phone") : null

  const rxRaw = rawNotes ? extractField(rawNotes, "RX Numbers") : null
  const transferRxNumbers = rxRaw
    ? rxRaw
        .split(/[\n,]+/)
        .map((n) => n.trim())
        .filter(Boolean)
    : []

  const transferPharmacyName = rawNotes ? extractField(rawNotes, "Pharmacy") : null
  const transferPharmacyPhone = rawNotes ? extractField(rawNotes, "Pharmacy Phone") : null

  return {
    method,
    deliveryMethod,
    doctorName,
    doctorPhone,
    transferRxNumbers,
    transferPharmacyName,
    transferPharmacyPhone,
    uploads: [],
    telemedicineIntake: null,
    rawNotes,
  }
}

export function prescriptionMethodLabel(method: PrescriptionMethod): string {
  switch (method) {
    case "upload":
      return "Uploaded prescription"
    case "eprescribe":
      return "Doctor e-prescribe"
    case "transfer":
      return "Pharmacy transfer"
    case "telemedicine":
      return "Telemedicine visit"
    default:
      return "Prescription source unknown"
  }
}
