import type { Order } from "@/lib/auth-types"

export type ClinicalProgramType =
  | "mens_health"
  | "trt"
  | "weight_loss"
  | "iv_rejuvenation"
  | "rejuvenation_vial"
  | "specialty_pharmacy"

export interface ClinicalProgramSubmission {
  type: ClinicalProgramType
  id: string
  status: string
  title: string
  subtitle?: string
  submittedAt: string
  href: string
}

export interface PortalPrescription {
  id: string
  medication_name: string
  strength?: string
  dosage_form?: string
  status: string
  quantity_prescribed?: number
  refills_remaining?: number
  prescriber_name?: string
  created_at: string
}

export interface PatientPortalData {
  orders: Order[]
  prescriptions: PortalPrescription[]
  clinicalPrograms: ClinicalProgramSubmission[]
}

export function formatPortalStatus(status: string): string {
  const labels: Record<string, string> = {
    pending_provider_review: "Pending provider review",
    pending_review: "Pending pharmacy review",
    coordinating_transfer: "Coordinating transfer",
    prior_auth_in_progress: "Prior authorization in progress",
    copay_assistance: "Copay assistance in progress",
    ready_for_fulfillment: "Ready for fulfillment",
    rx_at_pharmacy: "Prescription at pharmacy",
    preparing: "Pharmacy preparing",
    shipped: "Shipped",
    ready_for_dispatch: "Ready for RN dispatch",
    dispatched: "RN dispatched",
    completed: "Completed",
    provider_denied: "Not approved",
    provider_follow_up: "Follow-up required",
    cancelled: "Cancelled",
  }
  return labels[status] || status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export function portalStatusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  const s = status.toLowerCase()
  if (s.includes("approved") || s.includes("completed") || s.includes("filled") || s === "active") {
    return "default"
  }
  if (s.includes("denied") || s.includes("cancelled") || s.includes("expired")) {
    return "destructive"
  }
  if (s.includes("pending") || s.includes("review")) {
    return "secondary"
  }
  return "outline"
}
