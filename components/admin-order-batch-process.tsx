"use client"

import Link from "next/link"
import type { Order, PatientProfileSummary, User } from "@/lib/auth-types"
import type { OrderPrescriptionDetails } from "@/lib/order-prescription"
import { AdminOrderPrescriptionPanel } from "@/components/admin-order-prescription"
import { AdminOrderPatientPanel } from "@/components/admin-order-patient"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getOrderStatusBadgeClass } from "@/lib/admin-order-status"
import { staffAuthFetch } from "@/lib/staff-session"
import { Printer, ExternalLink, DollarSign } from "lucide-react"

export type BatchOrderEntry = {
  order: Order
  prescription: OrderPrescriptionDetails
}

type AdminOrderBatchProcessProps = {
  customerId: string
  user: User
  patient: PatientProfileSummary | null
  entries: BatchOrderEntry[]
  onOrderUpdate: (orderId: string, order: Order) => void
  onRefresh: () => void
}

async function openPrescriptionPrint(orderId: string, uploadId: string) {
  const res = await staffAuthFetch(
    `/api/admin/orders/${orderId}/prescription-file?uploadId=${uploadId}`
  )
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    alert(data.error || "Could not load prescription file")
    return false
  }
  const blob = await res.blob()
  const objectUrl = URL.createObjectURL(blob)
  const win = window.open(objectUrl, "_blank")
  if (!win) {
    URL.revokeObjectURL(objectUrl)
    alert("Pop-up blocked. Allow pop-ups to print prescriptions.")
    return false
  }
  setTimeout(() => win.print(), 600)
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000)
  return true
}

export function AdminOrderBatchProcess({
  customerId,
  user,
  patient,
  entries,
  onOrderUpdate,
  onRefresh,
}: AdminOrderBatchProcessProps) {
  const unpaidTotal = entries
    .filter((e) => e.order.payment_status !== "paid")
    .reduce((sum, e) => sum + (e.order.total_amount || 0), 0)

  const uploadTargets = entries.flatMap((e) =>
    e.prescription.method === "upload"
      ? e.prescription.uploads.map((u) => ({
          orderId: e.order.id,
          orderNumber: e.order.order_number || e.order.id,
          uploadId: u.id,
          fileName: u.file_name || "Prescription",
        }))
      : []
  )

  const handlePrintAllUploads = async () => {
    if (uploadTargets.length === 0) {
      alert("No uploaded prescription files in the selected orders.")
      return
    }
    for (let i = 0; i < uploadTargets.length; i++) {
      const target = uploadTargets[i]
      await openPrescriptionPrint(target.orderId, target.uploadId)
      if (i < uploadTargets.length - 1) {
        await new Promise((r) => setTimeout(r, 800))
      }
    }
  }

  const handleStatusChange = async (orderId: string, order: Order, newStatus: string) => {
    await staffAuthFetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    onOrderUpdate(orderId, { ...order, status: newStatus })
  }

  return (
    <div className="space-y-6">
      <AdminOrderPatientPanel patient={patient} patientId={customerId} />

      <Card>
        <CardHeader>
          <CardTitle>Batch summary</CardTitle>
          <CardDescription>
            Processing {entries.length} order{entries.length === 1 ? "" : "s"} for {user.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <p className="text-muted-foreground">Orders selected</p>
              <p className="text-2xl font-bold">{entries.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Unpaid balance</p>
              <p className="text-2xl font-bold text-primary flex items-center gap-1">
                <DollarSign className="h-5 w-5" />
                {unpaidTotal.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Upload files</p>
              <p className="text-2xl font-bold">{uploadTargets.length}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {uploadTargets.length > 0 ? (
              <Button variant="default" onClick={() => void handlePrintAllUploads()}>
                <Printer className="h-4 w-4 mr-2" />
                Print all uploads ({uploadTargets.length})
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {entries.map(({ order, prescription }) => (
        <Card key={order.id} className="overflow-hidden">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl">
                  Order #{order.order_number || order.id}
                </CardTitle>
                <CardDescription className="mt-1">
                  {new Date(order.created_at).toLocaleString()} ·{" "}
                  <Badge className={getOrderStatusBadgeClass(order.status)}>{order.status}</Badge>
                  {" · "}
                  <Badge variant="outline" className="capitalize">
                    {order.payment_status || "unpaid"}
                  </Badge>
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/orders/${order.id}`}>View order</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href={`/admin/orders/${order.id}/process?item=0`}>
                    Process individually
                    <ExternalLink className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="font-bold text-primary text-lg">
                  ${(order.total_amount || 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Items</p>
                <p className="font-medium">{order.items.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Prescription</p>
                <p className="font-medium capitalize">
                  {prescription.method === "unknown" ? "—" : prescription.method}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Update status</p>
                <select
                  className="mt-1 w-full rounded-md border bg-background px-2 py-1.5 text-sm"
                  value={order.status}
                  onChange={(e) => void handleStatusChange(order.id, order, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="ready">Ready</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="rounded-lg border p-4 space-y-2">
              <p className="text-sm font-semibold">Line items</p>
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between text-sm py-2 border-b last:border-0"
                >
                  <span>
                    {item.drug_name} <span className="text-muted-foreground">×{item.quantity}</span>
                  </span>
                  <span className="font-medium">${(item.price || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <AdminOrderPrescriptionPanel
              orderId={order.id}
              prescription={prescription}
              onRefresh={onRefresh}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
