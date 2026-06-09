import type { Metadata } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://clearchoicepharmacy.com"

export const metadata: Metadata = {
  title: "Browse Cheap Prescription Medications | Affordable Generic Drugs Online",
  description:
    "Browse 1,600+ cheap prescription medications with transparent pricing. Buy affordable generic drugs online at true cost. Compare discount prescription drug prices instantly. No insurance needed at Clear Choice Pharmacy.",
  alternates: {
    canonical: `${SITE_URL}/medications`,
  },
  openGraph: {
    title: "Cheap Prescription Medications - Browse 1,600+ Affordable Drugs",
    description:
      "Find cheap generic drugs and discounted prescription medications at Clear Choice Pharmacy. Compare prices instantly and save up to 80% without insurance.",
    url: `${SITE_URL}/medications`,
    type: "website",
  },
}

export default function MedicationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
