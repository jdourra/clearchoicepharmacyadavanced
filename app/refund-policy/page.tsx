import type { Metadata } from "next"
import { LegalPageShell } from "@/components/legal-page-shell"
import {
  LEGAL_BUSINESS_NAME,
  MICHIGAN_PHARMACY_LICENSE,
  PHARMACIST_IN_CHARGE,
  PHARMACY_DBA,
} from "@/lib/site-config"

export const metadata: Metadata = {
  title: "Refund Policy | Clear Choice Pharmacy",
  description: "Refund and cancellation policy for Clear Choice Pharmacy and partner-pharmacy medications.",
}

export default function RefundPolicyPage() {
  return (
    <LegalPageShell title="Refund Policy">
      <p>Last updated: October 2026</p>
      <p>
        {LEGAL_BUSINESS_NAME}, doing business as {PHARMACY_DBA}, 8278 N Merriman Rd, Westland, MI 48185. Michigan
        pharmacy license {MICHIGAN_PHARMACY_LICENSE}. Pharmacist-in-charge: {PHARMACIST_IN_CHARGE}.
      </p>
      <h2 className="text-xl font-semibold text-foreground pt-4">Semaglutide and tirzepatide</h2>
      <p>
        You pay Clear Choice Pharmacy on this website before the intake is sent to a doctor. If the card form is not on
        the page, call{" "}
        <a href="tel:+12489876182" className="text-primary hover:underline">
          (248) 987-6182
        </a>{" "}
        to pay. If a doctor does not approve treatment, the medication payment is refunded. If treatment is approved, a
        licensed partner pharmacy compounds and ships the medication. Clear Choice Pharmacy does not compound or ship
        these vials. Once that pharmacy has started preparing the prescription, the medication charge is not refundable.
        A dispensed compounded prescription cannot be returned.
      </p>
      <h2 className="text-xl font-semibold text-foreground pt-4">Medications Clear Choice Pharmacy dispenses</h2>
      <p>
        Men&apos;s health and other prescriptions filled at our Westland pharmacy are
        for Michigan patients. If a prescription is not approved, you are not charged for medication that was not
        dispensed. Once compounding or dispensing has started, that order is not refundable. A dispensed compounded
        prescription cannot be returned.
      </p>
      <h2 className="text-xl font-semibold text-foreground pt-4">Shipping problems</h2>
      <p>
        Contact us within 48 hours of delivery for a shipping error or damaged product. We review those claims one by
        one.
      </p>
      <h2 className="text-xl font-semibold text-foreground pt-4">Contact</h2>
      <p>
        <a href="mailto:info@clearchoicepharmacy.com" className="text-primary hover:underline">
          info@clearchoicepharmacy.com
        </a>{" "}
        ·{" "}
        <a href="tel:+12489876182" className="text-primary hover:underline">
          (248) 987-6182
        </a>
      </p>
    </LegalPageShell>
  )
}
