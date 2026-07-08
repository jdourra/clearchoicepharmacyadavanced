import type { Order } from "@/lib/auth-types"
import type { OrderPrescriptionDetails } from "@/lib/order-prescription"
import { isOrderPaid } from "@/lib/order-payment"

export type ProcessingBlocker =
  | "unpaid"
  | "missing_upload"
  | "missing_transfer"
  | "missing_eprescribe_contact"
  | "telemedicine_not_approved"
  | "telemedicine_intake_incomplete"
  | "prescription_source_unknown"

const TELEMEDICINE_APPROVED_STATUSES = new Set([
  "rx_at_pharmacy",
  "preparing",
  "ready_for_dispatch",
  "dispatched",
  "shipped",
  "completed",
  "ready",
])

export function isTelemedicineApprovedIntakeStatus(status: string | null | undefined): boolean {
  if (!status) return false
  return TELEMEDICINE_APPROVED_STATUSES.has(status)
}

export function isTelemedicineIntakeIncompleteStatus(status: string | null | undefined): boolean {
  return !status || status === "pending_intake"
}

/** Intake submitted but not yet approved by the telehealth provider. */
export function isTelemedicineAwaitingApprovalStatus(status: string | null | undefined): boolean {
  if (!status) return false
  if (status === "pending_intake") return false
  return !isTelemedicineApprovedIntakeStatus(status)
}

/** Statuses that require payment + prescription readiness before assignment. */
export const FULFILLMENT_ORDER_STATUSES = new Set([
  "processing",
  "ready",
  "shipped",
])

export function getProcessingBlockers(
  order: Order,
  prescription: OrderPrescriptionDetails | null
): ProcessingBlocker[] {
  const blockers: ProcessingBlocker[] = []

  if (!isOrderPaid(order)) {
    blockers.push("unpaid")
  }

  if (!prescription) {
    blockers.push("prescription_source_unknown")
    return blockers
  }

  switch (prescription.method) {
    case "upload":
      if (prescription.uploads.length === 0) {
        blockers.push("missing_upload")
      }
      break
    case "transfer":
      if (
        !prescription.transferPharmacyName?.trim() ||
        !prescription.transferPharmacyPhone?.trim() ||
        prescription.transferRxNumbers.length === 0
      ) {
        blockers.push("missing_transfer")
      }
      break
    case "eprescribe":
      if (!prescription.doctorName?.trim() || !prescription.doctorPhone?.trim()) {
        blockers.push("missing_eprescribe_contact")
      }
      break
    case "telemedicine": {
      const intakeStatus = prescription.telemedicineIntake?.status
      if (!intakeStatus || intakeStatus === "pending_intake") {
        blockers.push("telemedicine_intake_incomplete")
      } else if (!TELEMEDICINE_APPROVED_STATUSES.has(intakeStatus)) {
        blockers.push("telemedicine_not_approved")
      }
      break
    }
    case "unknown":
      blockers.push("prescription_source_unknown")
      break
  }

  return blockers
}

export function canAdvanceBeyondPending(
  order: Order,
  prescription: OrderPrescriptionDetails | null
): boolean {
  return getProcessingBlockers(order, prescription).length === 0
}

export function isFulfillmentStatus(status: string): boolean {
  return FULFILLMENT_ORDER_STATUSES.has(status)
}

export function validateStatusTransition(
  order: Order,
  prescription: OrderPrescriptionDetails | null,
  newStatus: string
): { allowed: boolean; error?: string } {
  if (newStatus === "cancelled" || newStatus === "pending" || newStatus === "delivered") {
    return { allowed: true }
  }

  if (isFulfillmentStatus(newStatus) && !canAdvanceBeyondPending(order, prescription)) {
    const labels = getProcessingBlockers(order, prescription).map(blockerLabel)
    return {
      allowed: false,
      error: `Order must stay pending until resolved: ${labels.join("; ")}`,
    }
  }

  return { allowed: true }
}

export function blockerLabel(blocker: ProcessingBlocker): string {
  switch (blocker) {
    case "unpaid":
      return "Payment not received"
    case "missing_upload":
      return "Prescription upload missing"
    case "missing_transfer":
      return "Pharmacy transfer information incomplete"
    case "missing_eprescribe_contact":
      return "Doctor e-prescribe contact information missing"
    case "telemedicine_not_approved":
      return "Telemedicine prescription not approved yet"
    case "telemedicine_intake_incomplete":
      return "Telemedicine intake not completed"
    case "prescription_source_unknown":
      return "Prescription source not confirmed"
    default:
      return blocker
  }
}

export function hasPrescriptionInfoBlockers(blockers: ProcessingBlocker[]): boolean {
  return blockers.some((b) => b !== "unpaid")
}

export function hasUnpaidBlocker(blockers: ProcessingBlocker[]): boolean {
  return blockers.includes("unpaid")
}
