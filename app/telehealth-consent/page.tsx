import type { Metadata } from "next"
import { LegalPageShell } from "@/components/legal-page-shell"
import { PRIMARY_PHYSICIAN } from "@/lib/clinical-provider"

export const metadata: Metadata = {
  title: "Telehealth Consent | Clear Choice Pharmacy",
  description: "Informed consent for asynchronous telehealth services at Clear Choice Pharmacy.",
}

export default function TelehealthConsentPage() {
  return (
    <LegalPageShell title="Telehealth Consent">
      <p>Last updated: June 2026</p>
      <p>
        By consenting to telehealth, you agree to receive clinical evaluation through asynchronous (store-and-forward)
        telemedicine with {PRIMARY_PHYSICIAN.name}, {PRIMARY_PHYSICIAN.credentials}, and affiliated Michigan providers
        when appropriate, synchronous communication.
      </p>
      <h2 className="text-xl font-semibold text-foreground pt-4">Nature of telehealth</h2>
      <p>
        Telehealth allows providers to review your intake remotely. You may not have an in-person physical examination.
        You must provide accurate information and report changes in your health promptly.
      </p>
      <h2 className="text-xl font-semibold text-foreground pt-4">Pharmacy fulfillment</h2>
      <p>
        If a prescription is issued, it will be routed to Clear Choice Pharmacy for compounding and delivery unless you
        choose another pharmacy where permitted by law.
      </p>
      <h2 className="text-xl font-semibold text-foreground pt-4">Risks and alternatives</h2>
      <p>
        You may seek in-person care at any time. Telehealth may not be appropriate for emergencies—call 911 for
        life-threatening conditions.
      </p>
      <h2 className="text-xl font-semibold text-foreground pt-4">Consent to treat</h2>
      <p>
        Your electronic agreement during intake constitutes informed consent to telehealth evaluation and treatment when
        clinically appropriate.
      </p>
    </LegalPageShell>
  )
}
