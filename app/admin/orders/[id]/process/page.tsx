"use client"

import { useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { AdminHeader } from "@/components/admin-header"
import { AdminOrderProcessPanel } from "@/components/admin-order-process-panel"
import { Button } from "@/components/ui/button"
import { useAdminOrder } from "../use-admin-order"
import { ArrowLeft } from "lucide-react"

export default function AdminOrderProcessPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const orderId = params.id as string
  const itemParam = searchParams.get("item")
  const fromParam = searchParams.get("from")
  const backHref = fromParam || "/admin/orders"
  const backLabel = fromParam ? "Back" : "Back to queue"
  const selectedItemIndex = itemParam != null ? Math.max(0, parseInt(itemParam, 10) || 0) : 0

  const { order, setOrder, patient, prescription, staffId, loading, loadData } =
    useAdminOrder(orderId)

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

  const clampedIndex =
    order.items.length > 0 ? Math.min(selectedItemIndex, order.items.length - 1) : 0

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <AdminHeader />

      <main className="flex-1 py-8">
        <div className="container">
          <Link
            href={backHref}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {backLabel}
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold">Process Order #{order.order_number || order.id}</h1>
            <p className="text-muted-foreground mt-1">
              Update status, manage prescription, and message the patient
            </p>
          </div>

          <AdminOrderProcessPanel
            order={order}
            patient={patient}
            prescription={prescription}
            staffId={staffId}
            selectedItemIndex={clampedIndex}
            onOrderUpdate={setOrder}
            onRefresh={loadData}
          />
        </div>
      </main>
    </div>
  )
}
