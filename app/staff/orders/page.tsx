import { redirect } from "next/navigation"
import { staffAuth } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { StaffHeader } from "@/components/staff-header"
import { Badge } from "@/components/ui/badge"
import { StaffOrderActions } from "@/components/staff-order-actions"

export default async function StaffOrdersPage() {
  const staff = await staffAuth.getCurrentStaff()
  if (!staff) redirect("/staff/login")

  const orders = await sql(
    `SELECT o.*, p.first_name, p.last_name, p.email as patient_email
     FROM orders o
     LEFT JOIN patients p ON p.id = o.patient_id
     ORDER BY o.created_at DESC`,
    [],
  )

  return (
    <div className="flex min-h-screen flex-col">
      <StaffHeader />
      <main className="flex-1 py-12 bg-muted/30">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Order Management</h1>
            <p className="text-muted-foreground mt-1">Track and manage patient orders</p>
          </div>
          {orders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No orders to display</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => {
                const notes: string = order.notes || ""
                const hasUpload = notes.includes("Prescription: Upload")
                const isEprescribe = notes.includes("Prescription: E-Prescribe")

                return (
                  <Card key={order.id}>
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold">Order #{order.order_number}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.first_name} {order.last_name || "Unknown Patient"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {order.patient_email}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            order.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : order.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.status === "processing"
                                  ? "bg-blue-100 text-blue-800"
                                  : order.status === "ready"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-red-100 text-red-800"
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-muted-foreground">Total Amount</div>
                          <div className="font-semibold">
                            ${Number(order.total_amount).toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-muted-foreground">Payment</div>
                          <div className="font-semibold">{order.payment_status}</div>
                        </div>
                        <div>
                          <div className="font-medium text-muted-foreground">Date</div>
                          <div>{new Date(order.created_at).toLocaleString()}</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs">
                        {hasUpload && (
                          <Badge variant="secondary" className="text-xs">
                            Prescription uploaded
                          </Badge>
                        )}
                        {isEprescribe && (
                          <Badge variant="secondary" className="text-xs">
                            Doctor will e-prescribe
                          </Badge>
                        )}
                        {!hasUpload && !isEprescribe && notes && (
                          <Badge variant="outline" className="text-xs">
                            {notes}
                          </Badge>
                        )}
                      </div>

                      <StaffOrderActions orderId={order.id} status={order.status} />
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
