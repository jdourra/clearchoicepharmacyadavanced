"use client"

import Link from "next/link"
import type { Order } from "@/lib/auth-types"
import type { OrderPrescriptionDetails } from "@/lib/order-prescription"
import {
  canAdvanceBeyondPending,
  getProcessingBlockers,
  blockerLabel,
  hasPrescriptionInfoBlockers,
  hasUnpaidBlocker,
} from "@/lib/admin-order-processing-rules"
import { AdminOrderPatientPanel } from "@/components/admin-order-patient"
import type { PatientProfileSummary, User } from "@/lib/auth-types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getOrderStatusBadgeClass } from "@/lib/admin-order-status"
import { ArrowRight, Pill, AlertCircle, CheckCircle2 } from "lucide-react"

export type BatchOrderEntry = {
  order: Order
  prescription: OrderPrescriptionDetails
}

export type MedicationPickerRow = {
  orderId: string
  orderNumber: string
  itemIndex: number
  drugName: string
  quantity: number
  price: number
  orderStatus: string
  paymentStatus: string
  canProcess: boolean
  blockerLabels: string[]
}

export function flattenEntriesToMedicationRows(entries: BatchOrderEntry[]): MedicationPickerRow[] {
  const rows: MedicationPickerRow[] = []

  for (const { order, prescription } of entries) {
    const blockers = getProcessingBlockers(order, prescription)
    const canProcess = canAdvanceBeyondPending(order, prescription)
    const blockerLabels = blockers.map(blockerLabel)

    if (order.items.length === 0) {
      rows.push({
        orderId: order.id,
        orderNumber: order.order_number || order.id,
        itemIndex: 0,
        drugName: "(No line items)",
        quantity: 0,
        price: order.total_amount || 0,
        orderStatus: order.status,
        paymentStatus: order.payment_status || "unpaid",
        canProcess,
        blockerLabels,
      })
      continue
    }

    order.items.forEach((item, itemIndex) => {
      rows.push({
        orderId: order.id,
        orderNumber: order.order_number || order.id,
        itemIndex,
        drugName: item.drug_name,
        quantity: item.quantity,
        price: item.price || 0,
        orderStatus: order.status,
        paymentStatus: order.payment_status || "unpaid",
        canProcess,
        blockerLabels,
      })
    })
  }

  return rows
}

type AdminOrderMedicationPickerProps = {
  customerId: string
  user: User
  patient: PatientProfileSummary | null
  entries: BatchOrderEntry[]
}

export function AdminOrderMedicationPicker({
  customerId,
  user,
  patient,
  entries,
}: AdminOrderMedicationPickerProps) {
  const rows = flattenEntriesToMedicationRows(entries)
  const readyCount = rows.filter((r) => r.canProcess).length

  return (
    <div className="space-y-6">
      <AdminOrderPatientPanel patient={patient} patientId={customerId} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Medications to process
          </CardTitle>
          <CardDescription>
            {rows.length} medication{rows.length === 1 ? "" : "s"} from {entries.length} order
            {entries.length === 1 ? "" : "s"} for {user.name}. Click a row to open the process
            screen.
            {readyCount < rows.length
              ? ` ${rows.length - readyCount} still waiting on payment or prescription information.`
              : null}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {rows.map((row) => {
            const href = `/admin/orders/${row.orderId}/process?item=${row.itemIndex}&from=${encodeURIComponent(
              `/admin/customers/${customerId}/process?orders=${entries.map((e) => e.order.id).join(",")}`
            )}`

            return (
              <Link key={`${row.orderId}-${row.itemIndex}`} href={href}>
                <div className="flex items-start justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 hover:border-primary/40 transition-colors cursor-pointer group">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-semibold group-hover:text-primary">{row.drugName}</p>
                      {row.canProcess ? (
                        <Badge className="bg-green-100 text-green-800 gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Ready to process
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Pending
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Order #{row.orderNumber} · Qty {row.quantity} · $
                      {row.price.toFixed(2)}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge className={getOrderStatusBadgeClass(row.orderStatus)}>
                        {row.orderStatus}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {row.paymentStatus}
                      </Badge>
                    </div>
                    {row.blockerLabels.length > 0 ? (
                      <ul className="mt-2 text-xs text-amber-800 space-y-0.5">
                        {row.blockerLabels.map((label) => (
                          <li key={label}>• {label}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 text-sm text-muted-foreground group-hover:text-primary">
                    Process
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}

// Re-export helpers for process panel
export { hasPrescriptionInfoBlockers, hasUnpaidBlocker }
