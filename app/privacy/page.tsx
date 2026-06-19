import type { Metadata } from "next"
import { LegalPageShell } from "@/components/legal-page-shell"

export const metadata: Metadata = {
  title: "Privacy Policy | Clear Choice Pharmacy",
  description: "HIPAA-aligned privacy practices for Clear Choice Pharmacy.",
}

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy">
      <p>Last updated: June 2026</p>
      <p>
        Clear Choice Pharmacy respects your privacy and protects health information in accordance with HIPAA and
        applicable state law.
      </p>
      <h2 className="text-xl font-semibold text-foreground pt-4">Information we collect</h2>
      <p>
        We collect information you provide during intake (demographics, medical history, identity documents), payment
        authorization metadata, and order fulfillment details.
      </p>
      <h2 className="text-xl font-semibold text-foreground pt-4">How we use information</h2>
      <p>
        Information is used for telehealth evaluation, prescription fulfillment, payment processing, and required
        regulatory compliance. We do not sell your personal health information.
      </p>
      <h2 className="text-xl font-semibold text-foreground pt-4">Security</h2>
      <p>
        Identity documents are stored in encrypted storage. Payment card data is processed by Stripe—we do not store
        full card numbers on our servers.
      </p>
      <h2 className="text-xl font-semibold text-foreground pt-4">Contact</h2>
      <p>
        Privacy inquiries:{" "}
        <a href="mailto:info@clearchoicepharmacy.com" className="text-primary hover:underline">
          info@clearchoicepharmacy.com
        </a>
      </p>
    </LegalPageShell>
  )
}
