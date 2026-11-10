import type { Metadata } from "next"
import { LegalPageShell } from "@/components/legal-page-shell"
import { LEGAL_BUSINESS_NAME, MICHIGAN_PHARMACY_LICENSE, PHARMACY_OWNER } from "@/lib/site-config"

export const metadata: Metadata = {
  title: "Terms and Conditions | Clear Choice Pharmacy",
  description: "Terms and conditions for Clear Choice Pharmacy telehealth and pharmacy services.",
}

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms and Conditions">
      <p>Last updated: November 2026</p>
      <p>
        These Terms and Conditions govern your use of the Clear Choice Pharmacy website, intakes, and pharmacy orders.
        Clear Choice Pharmacy is the name used by {LEGAL_BUSINESS_NAME}. The owner is {PHARMACY_OWNER}. By submitting an
        intake or placing an order, you agree to these terms.
      </p>
      <h2 className="text-xl font-semibold text-foreground pt-4">Services</h2>
      <p>
        {LEGAL_BUSINESS_NAME} is a Michigan pharmacy, license {MICHIGAN_PHARMACY_LICENSE}, at 40890 Grand River,
        Novi, MI 48375. Clear Choice Pharmacy is licensed in Michigan only and does not compound or dispense compounded
        medications. Non-compounded prescriptions we dispense ourselves are for Michigan patients. Weight loss, hormone
        therapy, and ED medication intakes are open to patients in every U.S. state and the District of Columbia. Ola
        Health reviews those intakes through a clinician licensed in the patient&apos;s state. If treatment is approved,
        RxAve fulfills and ships the compounded medication. Testosterone is a Schedule III controlled medication and is
        prescribed only when clinically appropriate. A few states require a live video visit. We do not replace your
        primary care physician.
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
        Clear Choice Pharmacy · 40890 Grand River, Novi, MI 48375 ·{" "}
        <a href="tel:+12489876182" className="text-primary hover:underline">(248) 987-6182</a> ·{" "}
        <a href="mailto:info@clearchoicepharmacy.com" className="text-primary hover:underline">
          info@clearchoicepharmacy.com
        </a>
      </p>
    </LegalPageShell>
  )
}
