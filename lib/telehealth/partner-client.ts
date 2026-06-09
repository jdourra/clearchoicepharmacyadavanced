import type { IvIntakePayload, PartnerSubmitResult, TelehealthPartnerId } from "@/lib/telehealth/types"
import { getActiveTelehealthPartner } from "@/lib/telehealth/types"

/**
 * Routes IV intake to the configured telehealth partner.
 *
 * manual  → returns success; caller sends clinician email + stores pending_provider_review
 * beluga  → POST BELUGA_API_URL/v1/intake (requires BELUGA_API_KEY + signed BAA)
 * openloop / wheel → stubbed; wire when contract is signed
 */
export async function submitIvIntakeToPartner(payload: IvIntakePayload): Promise<PartnerSubmitResult> {
  const partner = getActiveTelehealthPartner()

  switch (partner) {
    case "beluga":
      return submitToBeluga(payload)
    case "openloop":
      return submitToOpenLoop(payload)
    case "wheel":
      return submitToWheel(payload)
    default:
      return { success: true, mode: "manual", partnerStatus: "queued_for_manual_review" }
  }
}

async function submitToBeluga(payload: IvIntakePayload): Promise<PartnerSubmitResult> {
  const apiUrl = process.env.BELUGA_API_URL
  const apiKey = process.env.BELUGA_API_KEY

  if (!apiUrl || !apiKey) {
    console.warn("[telehealth] BELUGA_API_URL or BELUGA_API_KEY not set — falling back to manual queue")
    return { success: true, mode: "manual", partnerStatus: "beluga_not_configured" }
  }

  try {
    /*
     * Replace path/body mapping with Beluga's finalized API spec when contract is signed.
     * Ensure pharmacy routing includes Clear Choice NCPDP for Michigan fulfillment.
     */
    const response = await fetch(`${apiUrl.replace(/\/$/, "")}/v1/intake`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        externalId: payload.submissionId,
        serviceLine: "iv_therapy",
        patient: payload.patient,
        clinical: payload.screening,
        treatment: payload.treatment,
        fulfillmentPharmacy: payload.pharmacy,
        dispatch: payload.dispatch,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error("[telehealth] Beluga API error:", response.status, text)
      return { success: false, mode: "api", error: "Telehealth partner rejected intake" }
    }

    const result = (await response.json()) as { caseId?: string; status?: string }
    return {
      success: true,
      mode: "api",
      partnerCaseId: result.caseId,
      partnerStatus: result.status || "submitted",
    }
  } catch (error) {
    console.error("[telehealth] Beluga submission failed:", error)
    return { success: false, mode: "api", error: "Failed to reach telehealth partner" }
  }
}

async function submitToOpenLoop(payload: IvIntakePayload): Promise<PartnerSubmitResult> {
  if (!process.env.OPENLOOP_API_URL || !process.env.OPENLOOP_API_KEY) {
    console.warn("[telehealth] OpenLoop not configured — manual queue")
    return { success: true, mode: "manual", partnerStatus: "openloop_not_configured" }
  }
  // Wire OpenLoop API when partner contract is active
  console.log("[telehealth] OpenLoop stub — intake queued:", payload.submissionId)
  return { success: true, mode: "manual", partnerStatus: "openloop_pending_implementation" }
}

async function submitToWheel(payload: IvIntakePayload): Promise<PartnerSubmitResult> {
  if (!process.env.WHEEL_API_URL || !process.env.WHEEL_API_KEY) {
    console.warn("[telehealth] Wheel not configured — manual queue")
    return { success: true, mode: "manual", partnerStatus: "wheel_not_configured" }
  }
  console.log("[telehealth] Wheel stub — intake queued:", payload.submissionId)
  return { success: true, mode: "manual", partnerStatus: "wheel_pending_implementation" }
}

export function partnerDisplayName(partner: TelehealthPartnerId): string {
  const names: Record<TelehealthPartnerId, string> = {
    manual: "Manual clinician review",
    beluga: "Beluga Health",
    openloop: "OpenLoop",
    wheel: "Wheel",
  }
  return names[partner]
}
