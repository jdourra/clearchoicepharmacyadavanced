import { Suspense } from "react"
import { SiteHeader } from "@/components/site-header"
import { PatientPortalContent } from "@/components/patient-portal-content"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Patient Portal",
  robots: { index: false, follow: false },
}

function PortalFallback() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 py-12 flex items-center justify-center">
        <p>Loading your portal...</p>
      </main>
    </div>
  )
}

export default function AccountPage() {
  return (
    <Suspense fallback={<PortalFallback />}>
      <PatientPortalContent />
    </Suspense>
  )
}
