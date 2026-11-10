import type { Metadata } from "next"
import { LegalPageShell } from "@/components/legal-page-shell"
import {
  FULFILLMENT_PHARMACY,
  LEGAL_BUSINESS_NAME,
  MICHIGAN_PHARMACY_LICENSE,
  PHARMACY_DBA,
  PHARMACY_OWNER,
  TELEHEALTH_PROVIDER,
  ZELLE_PAYMENT_EMAIL,
} from "@/lib/site-config"

export const metadata: Metadata = {
  title: "Refund Policy | Clear Choice Pharmacy",
  description: "Refund and cancellation policy for Clear Choice Pharmacy and partner-pharmacy medications.",
}

export default function RefundPolicyPage() {
  return (
    <LegalPageShell title="Refund Policy">
      <p>Last updated: November 2026</p>
      <p>
        {LEGAL_BUSINESS_NAME}, doing business as {PHARMACY_DBA}, 40890 Grand River, Novi, MI 48375. Owner{" "}
        {PHARMACY_OWNER}. Michigan pharmacy license {MICHIGAN_PHARMACY_LICENSE}.
      </p>
      <h2 className="text-xl font-semibold text-foreground pt-4">Semaglutide and tirzepatide</h2>
      <p>
        After you submit, pay by Zelle at {ZELLE_PAYMENT_EMAIL}. The payment shows as {LEGAL_BUSINESS_NAME}. Put your
        name in the memo. The intake is sent to {TELEHEALTH_PROVIDER} after the payment arrives. If treatment is not
        approved, the medication payment is refunded. If treatment is approved, {FULFILLMENT_PHARMACY} routes the
        prescription to a licensed compounding pharmacy, which dispenses and ships the medication. Clear Choice Pharmacy
        does not compound or dispense compounded medication. Once that pharmacy has started preparing the prescription,
        the medication charge is not refundable. A
        dispensed compounded prescription cannot be returned.
      </p>
      <h2 className="text-xl font-semibold text-foreground pt-4">Medications Clear Choice Pharmacy dispenses</h2>
      <p>
        Non-compounded prescriptions filled at our Novi pharmacy are for Michigan patients. ED medication and hormone
        therapy approved through this website are routed by {FULFILLMENT_PHARMACY} to a licensed compounding pharmacy
        after {TELEHEALTH_PROVIDER} reviews the intake. The intake page states when that payment is collected. If
        treatment is not approved, you are not charged for medication that was not dispensed. Once that pharmacy has
        started preparing an approved prescription, that order is not refundable. A dispensed compounded prescription cannot be returned.
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
