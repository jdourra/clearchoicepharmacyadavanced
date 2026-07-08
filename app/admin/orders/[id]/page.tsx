"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { AdminHeader } from "@/components/admin-header"
import { AdminOrderPatientPanel } from "@/components/admin-order-patient"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getOrderStatusBadgeClass } from "@/lib/admin-order-status"
import { useAdminOrder } from "./use-admin-order"
import { ArrowLeft, ArrowRight, Package } from "lucide-react"

export default function AdminOrderDetailPage() {
  const params = useParams()
  const orderId = params.id as string
  const { order, patient, loading } = useAdminOrder(orderId)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/30">
        <AdminHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Order not found</p>
            <Button asChild>
              <Link href="/admin/orders">Back to Orders</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const processHref =
    order.items.length > 0
      ? `/admin/orders/${order.id}/process?item=0`
      : `/admin/orders/${order.id}/process`

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <AdminHeader />

      <main className="flex-1 py-8">
        <div className="container max-w-4xl">
          <Link
            href="/admin/orders"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to queue
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Order #{order.order_number || order.id}</h1>
              <p className="text-muted-foreground mt-1">
                {new Date(order.created_at).toLocaleString()}
              </p>
              <Badge className={`mt-2 ${getOrderStatusBadgeClass(order.status)}`}>
                {order.status}
              </Badge>
            </div>
            <Button asChild>
              <Link href={processHref}>Process order</Link>
            </Button>
          </div>

          <div className="space-y-6">
            <AdminOrderPatientPanel patient={patient} patientId={order.patient_id} />

            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Payment</p>
                  <p className="font-medium capitalize">{order.payment_status || "unpaid"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Items</p>
                  <p className="font-medium">{order.items.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total</p>
                  <p className="text-xl font-bold text-primary">
                    ${(order.total_amount || 0).toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Items
                </CardTitle>
                <CardDescription>Click an item to process this order</CardDescription>
              </CardHeader>
              <CardContent>
                {order.items.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No line items on this order</p>
                    <Button asChild variant="outline">
                      <Link href={processHref}>Open process view</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <Link
                        key={idx}
                        href={`/admin/orders/${order.id}/process?item=${idx}`}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 hover:border-primary/40 transition-colors cursor-pointer group"
                      >
                        <div>
                          <p className="font-semibold group-hover:text-primary">{item.drug_name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-primary">${(item.price || 0).toFixed(2)}</span>
                          <span className="text-sm text-muted-foreground group-hover:text-primary flex items-center gap-1">
                            Process
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
