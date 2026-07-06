import type { PrescriptionMethod } from "@/lib/order-prescription"
import { TELEMEDICINE_VISIT_FEE } from "@/lib/prescription-telemedicine"

export type PrescriptionNotesInput = {
  doctorName?: string
  doctorPhone?: string
  transferRxNumbers?: string
  transferPharmacyName?: string
  transferPharmacyPhone?: string
  deliveryMethod?: string
}

export function buildPrescriptionNotes(
  prescriptionMethod: PrescriptionMethod | string,
  options: PrescriptionNotesInput
): string {
  const deliveryMethod = options.deliveryMethod || "pickup"
  const doctorName = options.doctorName?.trim() || ""
  const doctorPhone = options.doctorPhone?.trim() || ""
  const transferPharmacyName = options.transferPharmacyName?.trim() || ""
  const transferPharmacyPhone = options.transferPharmacyPhone?.trim() || ""
  const transferRxNumbers = options.transferRxNumbers?.trim() || ""

  if (prescriptionMethod === "eprescribe") {
    return `Delivery: ${deliveryMethod}, Prescription: E-Prescribe, Doctor: ${doctorName}, Doctor Phone: ${doctorPhone}`
  }

  if (prescriptionMethod === "transfer") {
    const rxNumbers = transferRxNumbers
      .split(/[\n,]+/)
      .map((n) => n.trim())
      .filter(Boolean)
      .join(", ")
    return `Delivery: ${deliveryMethod}, Prescription: Transfer, RX Numbers: ${rxNumbers}, Pharmacy: ${transferPharmacyName}, Pharmacy Phone: ${transferPharmacyPhone}`
  }

  if (prescriptionMethod === "telemedicine") {
    return `Delivery: ${deliveryMethod}, Prescription: Telemedicine ($${TELEMEDICINE_VISIT_FEE} visit fee)`
  }

  return `Delivery: ${deliveryMethod}, Prescription: Upload`
}
