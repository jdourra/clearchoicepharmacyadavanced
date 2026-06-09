import { redirect } from "next/navigation"
import { staffAuth } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Package, TrendingUp } from "lucide-react"
import { StaffNav } from "@/components/staff-nav"
import { Badge } from "@/components/ui/badge"

export default async function StaffDashboardPage() {
  const staff = await staffAuth.getCurrentStaff()
  if (!staff) redirect("/staff/login")

  const totalResult = await sql("SELECT count(*) as c FROM orders", [])
  const pendingResult = await sql("SELECT count(*) as c FROM orders WHERE status = 'pending'", [])
  const processingResult = await sql("SELECT count(*) as c FROM orders WHERE status = 'processing'", [])
  const readyResult = await sql("SELECT count(*) as c FROM orders WHERE status = 'ready'", [])

  const recentOrders = await sql(
    "SELECT o.*, p.first_name, p.last_name FROM orders o LEFT JOIN patients p ON p.id = o.patient_id ORDER BY o.created_at DESC LIMIT 10",
    []
  )

  const stats = {
    totalOrders: Number(totalResult[0]?.c || 0),
    pendingRx: Number(pendingResult[0]?.c || 0),
    processingOrders: Number(processingResult[0]?.c || 0),
    readyOrders: Number(readyResult[0]?.c || 0),
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "processing": return "bg-blue-100 text-blue-800"
      case "ready": return "bg-green-100 text-green-800"
      case "completed": return "bg-gray-100 text-gray-800"
      case "cancelled": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <StaffNav />
      <main className="flex-1 py-8 md:py-12 bg-muted/30">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Orders Dashboard</h1>
            <p className="text-muted-foreground mt-1">Monitor and manage cash-pay orders</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <FileText className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingRx}</div>
                <p className="text-xs text-muted-foreground mt-1">Waiting for processing</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Processing</CardTitle>
                <Package className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.processingOrders}</div>
                <p className="text-xs text-muted-foreground mt-1">Being prepared</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Ready</CardTitle>
                <Package className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.readyOrders}</div>
                <p className="text-xs text-muted-foreground mt-1">{"Ready for pickup/delivery"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="text-center py-12"><p className="text-muted-foreground">No orders yet</p></div>
              ) : (
                <div className="flex flex-col gap-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="font-semibold">#{order.order_number}</div>
                          <Badge variant="outline" className={getStatusColor(order.status)}>{order.status}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">{order.first_name} {order.last_name}</div>
                        <div className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">${Number(order.total_amount).toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">Cash pay</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
