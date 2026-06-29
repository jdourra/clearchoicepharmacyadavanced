import { Suspense } from "react"
import type { Metadata } from "next"
import { OrderPaymentChoice } from "@/components/order-payment-choice"
import { SiteHeader } from "@/components/site-header"

export const metadata: Metadata = {
  title: "Pay for Order",
  robots: { index: false, follow: false },
}

function PayFallback() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 py-12 flex items-center justify-center">
        <p>Loading payment options...</p>
      </main>
    </div>
  )
}

export default async function OrderPayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <Suspense fallback={<PayFallback />}>
      <OrderPaymentChoice orderId={id} />
    </Suspense>
  )
}
