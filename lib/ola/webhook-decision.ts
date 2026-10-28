export type OlaClinicianDecision = "denied" | "completed" | "prescription_submitted" | "no_show" | "other"

export function olaDecisionFromEvent(eventType: string): {
  decision: OlaClinicianDecision
  status: string | null
} {
  switch (eventType) {
    case "case_denied_by_clinician":
      return { decision: "denied", status: "provider_denied" }
    case "case_completed":
      return { decision: "completed", status: "completed" }
    case "prescription_submitted":
      return { decision: "prescription_submitted", status: "rx_at_pharmacy" }
    case "case_no_show":
      return { decision: "no_show", status: null }
    default:
      return { decision: "other", status: null }
  }
}

export function olaDecisionNotice(decision: string | null | undefined): { title: string; body: string } | null {
  switch (decision) {
    case "denied":
      return {
        title: "Clinician denied this visit",
        body: "Refund the Zelle payment. The clinician did not approve treatment.",
      }
    case "completed":
      return {
        title: "Clinician completed this visit",
        body: "Do not refund. The visit was completed.",
      }
    case "prescription_submitted":
      return {
        title: "Prescription submitted",
        body: "Do not refund. A prescription was submitted for this visit.",
      }
    case "no_show":
      return {
        title: "Patient did not attend",
        body: "Do not refund yet. Confirm this no-show before returning the Zelle payment.",
      }
    case "other":
      return {
        title: "Clinician update received",
        body: "A status update arrived. It is not an approval or a denial.",
      }
    default:
      return null
  }
}
