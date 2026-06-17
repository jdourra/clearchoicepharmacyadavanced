import type { Metadata } from "next"

// Page-level metadata in page.tsx overrides this for /medications.
export const metadata: Metadata = {
  title: "Medications | Clear Choice Pharmacy",
  description:
    "Search prescription medications and see transparent cash-pay pricing at Clear Choice Pharmacy.",
}

export default function MedicationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
