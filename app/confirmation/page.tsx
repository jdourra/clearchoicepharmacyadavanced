"use client"

import { useSearchParams } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Clock, Upload, MapPin } from "lucide-react"
import Link from "next/link"
import { Suspense, useEffect, useState } from "react"
import Loading from "./loading"

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const [order, setOrder] = useState<any>(null)

  useEffect(() => {
    if (orderId) {
      fetch(`/api/patient-orders/${orderId}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.order) setOrder(d.order)
        })
        .catch(() => {})
    }
  }, [orderId])

  const orderNumber = order?.order_number || orderId || `CCP-${Date.now().toString().slice(-8)}`

  return (
    <Card className="p-8 md:p-12 text-center">
      <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
      <h1 className="text-3xl md:text-4xl font-bold mb-2">Order Confirmed!</h1>
      <p className="text-lg text-muted-foreground mb-8">Thank you for choosing Clear Choice Pharmacy</p>

      <div className="bg-muted/50 rounded-lg p-6 mb-8">
        <p className="text-sm text-muted-foreground mb-2">Order Number</p>
        <p className="text-2xl font-bold font-mono">{orderNumber}</p>
        {order && (
          <p className="text-sm text-muted-foreground mt-2">
            Total: <span className="font-semibold text-foreground">${Number(order.total_amount || 0).toFixed(2)}</span>
          </p>
        )}
      </div>

      {order?.items && order.items.length > 0 && (
        <div className="bg-muted/30 rounded-lg p-4 mb-8 text-left">
          <p className="text-sm font-semibold mb-3">Order Items</p>
          <ul className="flex flex-col gap-2">
            {order.items.map((item: any, idx: number) => (
              <li key={idx} className="flex justify-between text-sm">
                <span>{item.drug_name} (x{item.quantity})</span>
                <span className="font-medium">${Number(item.price || 0).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-6 text-left mb-8">
        <h3 className="font-semibold text-lg text-center mb-4">What Happens Next</h3>

        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Prescription Review</h4>
            <p className="text-sm text-muted-foreground">
              Our pharmacist will review your prescription and contact you if needed
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Processing (24-48 hours)</h4>
            <p className="text-sm text-muted-foreground">
              We'll prepare your medication and send you a notification when it's ready
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Pickup or Delivery</h4>
            <p className="text-sm text-muted-foreground">You'll receive a text/email when your order is ready</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild variant="outline">
          <Link href="/">Continue Shopping</Link>
        </Button>
        <Button asChild>
          <Link href="/account">View My Orders</Link>
        </Button>
      </div>
    </Card>
  )
}

export default function ConfirmationPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 py-12">
        <div className="container max-w-3xl mx-auto px-4">
          <Suspense fallback={<Loading />}>
            <ConfirmationContent />
          </Suspense>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>Questions? Contact us at (555) 123-4567 or help@clearchoicepharmacy.com</p>
          </div>
        </div>
      </main>
    </div>
  )
}
