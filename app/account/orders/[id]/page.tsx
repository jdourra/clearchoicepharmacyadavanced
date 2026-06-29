import { Suspense } from "react"
import type { Metadata } from "next"
import { PatientOrderDetail } from "@/components/patient-order-detail"
import { SiteHeader } from "@/components/site-header"

export const metadata: Metadata = {
  title: "Order Details",
  robots: { index: false, follow: false },
}

function OrderFallback() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 py-12 flex items-center justify-center">
        <p>Loading order...</p>
      </main>
    </div>
  )
}

export default async function PatientOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <Suspense fallback={<OrderFallback />}>
      <PatientOrderDetail orderId={id} />
    </Suspense>
  )
}
