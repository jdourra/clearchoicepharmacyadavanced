import type { ClinicalServiceType, IvIntakePayload, PartnerSubmitResult } from "@/lib/telehealth/types"
import { getActiveTelehealthPartner } from "@/lib/telehealth/types"
import { submitIvIntakeToPartner } from "@/lib/telehealth/partner-client"
import { notifyClinicianQueue } from "@/lib/telehealth/manual-queue"
import { partnerDisplayName } from "@/lib/telehealth/partner-client"

export type GenericClinicalIntakePayload = {
  serviceType: ClinicalServiceType
  submissionId: string
  patient: {
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
  clinicalSummary: string
  ivPayload?: IvIntakePayload
}

/**
 * Routes any clinical intake to the configured telehealth partner.
 * IV uses the live partner API; other lines queue for manual review until partner mapping is signed.
 */
export async function submitClinicalIntakeToPartner(
  payload: GenericClinicalIntakePayload
): Promise<PartnerSubmitResult & { partnerName: string }> {
  const partner = getActiveTelehealthPartner()
  const partnerName = partnerDisplayName(partner)

  if (payload.serviceType === "iv_rejuvenation" && payload.ivPayload) {
    const result = await submitIvIntakeToPartner(payload.ivPayload)
    if (result.success && result.mode === "manual") {
      await notifyClinicianQueue({
        submissionId: payload.submissionId,
        subject: `[IV ${payload.submissionId}] ${payload.patient.firstName} ${payload.patient.lastName}`,
        body: payload.clinicalSummary,
      })
    }
    return { ...result, partnerName }
  }

  // Manual queue + optional future partner adapters per service line
  await notifyClinicianQueue({
    submissionId: payload.submissionId,
    subject: `[${payload.serviceType.toUpperCase()} ${payload.submissionId}] ${payload.patient.firstName} ${payload.patient.lastName}`,
    body: payload.clinicalSummary,
  })

  return {
    success: true,
    mode: "manual",
    partnerStatus: "queued_for_manual_review",
    partnerName,
  }
}
