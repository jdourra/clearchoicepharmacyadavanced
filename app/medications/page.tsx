import type { Metadata } from "next"
import { MedicationQuoteBuilder } from "@/components/medication-quote-builder"
import { SITE_URL } from "@/lib/site-config"

export const metadata: Metadata = {
  title: "Medication Prices | Low Cost Prescription Drug Lookup",
  description:
    "Search medications and see transparent cash-pay prices. Build your list and order online. Clear Choice Pharmacy, Westland, MI.",
  alternates: {
    canonical: `${SITE_URL}/medications`,
  },
  openGraph: {
    title: "Medication Prices | Clear Choice Pharmacy",
    description:
      "Add medications to your list and see transparent cash-pay pricing at Clear Choice Pharmacy.",
    url: `${SITE_URL}/medications`,
    type: "website",
  },
}

export default function MedicationsQuotePage() {
  return <MedicationQuoteBuilder />
}
