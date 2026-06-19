import type { Metadata } from "next"
import { LegalPageShell } from "@/components/legal-page-shell"

export const metadata: Metadata = {
  title: "Refund Policy | Clear Choice Pharmacy",
  description: "Refund and cancellation policy for Clear Choice Pharmacy compounded therapies.",
}

export default function RefundPolicyPage() {
  return (
    <LegalPageShell title="Refund Policy">
      <p>Last updated: June 2026</p>
      <p>
        Compounded medications are prepared pursuant to a patient-specific prescription. Because of federal and state
        regulations, <strong className="text-foreground">compounded prescription products cannot be returned</strong> once
        dispensed.
      </p>
      <h2 className="text-xl font-semibold text-foreground pt-4">Before approval</h2>
      <p>
        If your telehealth provider does not approve treatment, any card authorization hold will be released and you will
        not be charged for medication.
      </p>
      <h2 className="text-xl font-semibold text-foreground pt-4">After approval</h2>
      <p>
        Once a prescription is approved and compounding has begun or completed, orders are non-refundable. Shipping errors
        or damaged product claims will be reviewed on a case-by-case basis—contact us within 48 hours of delivery.
      </p>
      <h2 className="text-xl font-semibold text-foreground pt-4">Contact</h2>
      <p>
        <a href="mailto:info@clearchoicepharmacy.com" className="text-primary hover:underline">
          info@clearchoicepharmacy.com
        </a>{" "}
        · <a href="tel:+12489876182" className="text-primary hover:underline">1-248-987-6182</a>
      </p>
    </LegalPageShell>
  )
}
