import type { Metadata } from "next"
import { LegalPageShell } from "@/components/legal-page-shell"

export const metadata: Metadata = {
  title: "Terms and Conditions | Clear Choice Pharmacy",
  description: "Terms and conditions for Clear Choice Pharmacy telehealth and pharmacy services.",
}

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms and Conditions">
      <p>Last updated: June 2026</p>
      <p>
        These Terms and Conditions govern your use of Clear Choice Pharmacy&apos;s website, telehealth consultations,
        and compounded medication services. By submitting an intake or placing an order, you agree to these terms.
      </p>
      <h2 className="text-xl font-semibold text-foreground pt-4">Services</h2>
      <p>
        Clear Choice Pharmacy provides pharmacy compounding and fulfillment pursuant to patient-specific prescriptions
        issued by licensed healthcare providers following telehealth evaluation. We do not replace your primary care
        physician.
      </p>
      <h2 className="text-xl font-semibold text-foreground pt-4">Eligibility</h2>
      <p>
        You must be 18 years or older, located in a state where our services are available, and provide accurate medical
        information. We reserve the right to decline treatment when clinically inappropriate.
      </p>
      <h2 className="text-xl font-semibold text-foreground pt-4">Payment</h2>
      <p>
        Cash-pay pricing is displayed before checkout. Card authorization holds may be placed at intake and captured only
        upon provider approval. See our Refund Policy for cancellation terms.
      </p>
      <h2 className="text-xl font-semibold text-foreground pt-4">Contact</h2>
      <p>
        Clear Choice Pharmacy · 40890 Grand River Ave, Novi, MI 48375 ·{" "}
        <a href="tel:+12489876182" className="text-primary hover:underline">(248) 987-6182</a> ·{" "}
        <a href="mailto:info@clearchoicepharmacy.com" className="text-primary hover:underline">
          info@clearchoicepharmacy.com
        </a>
      </p>
    </LegalPageShell>
  )
}
