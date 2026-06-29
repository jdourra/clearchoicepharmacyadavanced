"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, CreditCard, Loader2, Package } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { authFetch } from "@/lib/session"
import type { Order } from "@/lib/auth-types"
import type { OrderPrescriptionDetails } from "@/lib/order-prescription"
import { prescriptionMethodLabel } from "@/lib/order-prescription"
import { OrderPrescriptionForm } from "@/components/order-prescription-form"
import { getOrderPayPath, isOrderPaid } from "@/lib/order-payment"
import { formatPortalStatus, portalStatusVariant } from "@/lib/patient-portal-types"

export function PatientOrderDetail({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [prescription, setPrescription] = useState<OrderPrescriptionDetails | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const res = await authFetch(`/api/orders/${orderId}/prescription`)
      if (res.status === 401) {
        router.push(`/auth/login?redirect=/account/orders/${orderId}`)
        return
      }
      const data = await res.json()
      if (!res.ok || !data.order) {
        router.push("/account?tab=orders")
        return
      }
      setOrder(data.order)
      setPrescription(data.prescription)
    } catch {
      router.push("/account?tab=orders")
    } finally {
      setLoading(false)
    }
  }, [orderId, router])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    )
  }

  if (!order || !prescription) return null

  const needsPrescription =
    prescription.method === "unknown" ||
    (prescription.method === "upload" && prescription.uploads.length === 0)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 py-8 md:py-12 bg-muted/30">
        <div className="container max-w-3xl mx-auto px-4">
          <Button asChild variant="ghost" className="mb-4 -ml-2">
            <Link href="/account?tab=orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to orders
            </Link>
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-1">Order</p>
              <h1 className="text-2xl md:text-3xl font-bold">#{order.order_number}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Placed {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={portalStatusVariant(order.status)}>{formatPortalStatus(order.status)}</Badge>
              <Badge variant="outline">{formatPortalStatus(order.payment_status)}</Badge>
            </div>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>
                    {item.drug_name} × {item.quantity}
                  </span>
                  <span className="font-medium">${(item.price || 0).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold border-t pt-3">
                <span>Total</span>
                <span className="text-primary">${(order.total_amount || 0).toFixed(2)}</span>
              </div>
              {!isOrderPaid(order) && (
                <Button asChild className="w-full mt-2">
                  <Link href={getOrderPayPath(order.id)}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Choose payment option
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prescription information</CardTitle>
              <CardDescription>
                {needsPrescription
                  ? "Our pharmacy still needs your prescription details. Choose how you will provide them below."
                  : `On file: ${prescriptionMethodLabel(prescription.method)}. You can update or re-submit anytime.`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrderPrescriptionForm orderId={order.id} prescription={prescription} onUpdated={load} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
