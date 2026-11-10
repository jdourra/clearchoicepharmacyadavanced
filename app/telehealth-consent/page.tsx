import type { Metadata } from "next"
import { LegalPageShell } from "@/components/legal-page-shell"
import { FULFILLMENT_PHARMACY, TELEHEALTH_PROVIDER } from "@/lib/site-config"

export const metadata: Metadata = {
  title: "Telehealth Consent | Clear Choice Pharmacy",
  description: "Informed consent for telehealth visits reviewed by Ola Health.",
}

export default function TelehealthConsentPage() {
  return (
    <LegalPageShell title="Telehealth Consent">
      <p>Last updated: November 2026</p>
      <p>
        By consenting to telehealth, you agree to a remote clinical evaluation. Weight loss, hormone therapy, and ED
        intakes are reviewed by {TELEHEALTH_PROVIDER} through a clinician licensed in your state. A few states require a
        live video visit. Clear Choice Pharmacy does not perform that clinical evaluation.
      </p>
      <h2 className="text-xl font-semibold text-foreground pt-4">Nature of telehealth</h2>
      <p>
        Telehealth allows a clinician to review your intake remotely. You may not have an in-person physical examination.
        You must provide accurate information, including the medication and dose you are already taking, and report
        changes in your health promptly. The clinician decides whether treatment is appropriate and, if it is, which
        medication and dose to prescribe.
      </p>
      <h2 className="text-xl font-semibold text-foreground pt-4">Pharmacy fulfillment</h2>
      <p>
        If a clinician approves a compounded medication, the prescription is sent to {FULFILLMENT_PHARMACY} to fulfill
        and ship. Clear Choice Pharmacy does not compound or dispense those medications. Non-compounded prescriptions
        that Clear Choice Pharmacy dispenses itself are limited to Michigan patients.
      </p>
      <h2 className="text-xl font-semibold text-foreground pt-4">Risks and alternatives</h2>
      <p>
        You may seek in-person care at any time. Telehealth may not be appropriate for emergencies. Call 911 for a
        life-threatening condition.
      </p>
      <h2 className="text-xl font-semibold text-foreground pt-4">Consent to treat</h2>
      <p>
        Your electronic agreement during intake is informed consent to telehealth evaluation and, when clinically
        appropriate, treatment.
      </p>
    </LegalPageShell>
  )
}
