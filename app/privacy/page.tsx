import type { Metadata } from "next"
import { LegalPageShell } from "@/components/legal-page-shell"
import {
  CONTACT_EMAIL,
  FULFILLMENT_PHARMACY,
  LEGAL_BUSINESS_NAME,
  MICHIGAN_PHARMACY_LICENSE,
  PHARMACY_ADDRESS_LINE,
  TELEHEALTH_PROVIDER,
  ZELLE_PAYMENT_EMAIL,
} from "@/lib/site-config"

export const metadata: Metadata = {
  title: "Privacy Policy | Clear Choice Pharmacy",
  description: "How Clear Choice Pharmacy uses and shares information for telehealth and pharmacy services.",
}

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy">
      <p>Last updated: November 2026</p>
      <p>
        {LEGAL_BUSINESS_NAME}, doing business as Clear Choice Pharmacy, protects health information in accordance with
        HIPAA and applicable state law. Michigan pharmacy license{" "}
        {MICHIGAN_PHARMACY_LICENSE}. The pharmacy is at {PHARMACY_ADDRESS_LINE}.
      </p>
      <h2 className="text-xl font-semibold text-foreground pt-4">Information we collect</h2>
      <p>
        We collect information you submit on an intake: your name, contact details, date of birth, address, medical
        history, medications, identity documents, and the treatment you are asking about. We also keep records of
        orders, shipping, and payment. Semaglutide and tirzepatide payments are made by Zelle to {ZELLE_PAYMENT_EMAIL}.
        The transfer shows as {LEGAL_BUSINESS_NAME}. We do not store full card numbers. If a card payment is used, the
        card data is processed by Stripe.
      </p>
      <h2 className="text-xl font-semibold text-foreground pt-4">How we use and share information</h2>
      <p>
        We use this information to operate the website, process payment, and coordinate care. Intake information for
        weight loss, hormone therapy, and ED medication is shared with {TELEHEALTH_PROVIDER} so a clinician licensed in
        your state can review it. If that clinician approves a compounded prescription, the prescription and the
        information needed to dispense it are shared with {FULFILLMENT_PHARMACY}. RxAve routes that prescription to a
        licensed compounding pharmacy, which dispenses and ships the medication. Clear Choice Pharmacy does not compound or dispense those medications. We may also share information
        when the law requires it. We do not sell your personal health information.
      </p>
      <h2 className="text-xl font-semibold text-foreground pt-4">Your rights</h2>
      <p>
        You may ask to see or receive a copy of your health information, ask for a correction, ask for a list of certain
        disclosures, ask us to limit how information is used or shared, and ask us to contact you in a particular way.
        You may also ask for a paper copy of this notice. Send the request to {CONTACT_EMAIL} or by mail to{" "}
        {PHARMACY_ADDRESS_LINE}.
      </p>
      <h2 className="text-xl font-semibold text-foreground pt-4">Complaints</h2>
      <p>
        You may complain to Clear Choice Pharmacy at {CONTACT_EMAIL} or (248) 987-6182. You may also file a complaint
        with the U.S. Department of Health and Human Services, Office for Civil Rights, at{" "}
        <a href="https://www.hhs.gov/hipaa/filing-a-complaint/index.html" className="text-primary hover:underline">
          hhs.gov/hipaa/filing-a-complaint
        </a>
        . We will not retaliate against you for filing a complaint.
      </p>
      <h2 className="text-xl font-semibold text-foreground pt-4">Security</h2>
      <p>
        Identity documents are stored in encrypted storage. Access to intake records is limited to people who need them
        to review, fulfill, or support an order.
      </p>
      <h2 className="text-xl font-semibold text-foreground pt-4">Contact</h2>
      <p>
        Privacy inquiries:{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
          {CONTACT_EMAIL}
        </a>
        {" · "}
        <a href="tel:+12489876182" className="text-primary hover:underline">
          (248) 987-6182
        </a>
        {" · "}
        {PHARMACY_ADDRESS_LINE}
      </p>
    </LegalPageShell>
  )
}
