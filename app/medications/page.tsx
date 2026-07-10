import type { Metadata } from "next"
import { MedicationQuoteBuilder } from "@/components/medication-quote-builder"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://clearchoicepharmacy.com"

export const metadata: Metadata = {
  title: "Medication Prices for Michigan Patients | Clear Choice Pharmacy",
  description:
    "Build your medication list and see cash-pay totals for Michigan patients. Search prescriptions, compare transparent prices, and order for pickup in Novi or Michigan delivery.",
  alternates: {
    canonical: `${SITE_URL}/medications`,
  },
  openGraph: {
    title: "Medication Prices | Michigan | Clear Choice Pharmacy",
    description:
      "Add medications to your list and see transparent cash-pay pricing for Michigan patients at Clear Choice Pharmacy in Novi.",
    url: `${SITE_URL}/medications`,
    type: "website",
  },
}

export default function MedicationsQuotePage() {
  return <MedicationQuoteBuilder />
}
