import type { Metadata } from "next"

// Page-level metadata in page.tsx overrides this for /medications.
export const metadata: Metadata = {
  title: "Medications for Michigan Patients | Clear Choice Pharmacy",
  description:
    "Search prescription medications and see transparent cash-pay pricing for Michigan patients at Clear Choice Pharmacy in Novi, MI.",
}

export default function MedicationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
