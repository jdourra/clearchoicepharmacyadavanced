import type { Metadata } from "next"
import { MedicationQuoteBuilder } from "@/components/medication-quote-builder"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://clearchoicepharmacy.com"

export const metadata: Metadata = {
  title: "See How Much Your Medications Cost | Clear Choice Pharmacy",
  description:
    "Build your medication list and see a running total. Search prescriptions, compare cash-pay prices, and order online. Drug cost + 15% + $5 per line—no insurance required.",
  alternates: {
    canonical: `${SITE_URL}/medications`,
  },
  openGraph: {
    title: "See How Much Your Medications Cost",
    description:
      "Add medications to your list and see transparent pricing instantly at Clear Choice Pharmacy.",
    url: `${SITE_URL}/medications`,
    type: "website",
  },
}

export default function MedicationsQuotePage() {
  return <MedicationQuoteBuilder />
}
