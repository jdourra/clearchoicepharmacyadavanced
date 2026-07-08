"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { Order } from "@/lib/auth-types"
import { staffAuthFetch } from "@/lib/staff-session"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AdminHeader } from "@/components/admin-header"
import { AdminDashboardStatCard } from "@/components/admin-dashboard-stat-card"
import {
  Pill,
  Package,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  Truck,
  MessageSquare,
  FileText,
  ArrowRight,
  XCircle,
  PackageCheck,
} from "lucide-react"
import { isActiveOrderStatus, isCompletedOrderStatus } from "@/lib/admin-order-buckets"
import { isTelemedicineAwaitingApprovalStatus } from "@/lib/admin-order-processing-rules"

type DashboardCounts = {
  pendingIntakes: number
  messageCount: number
  followupEligible: number
  customerCount: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [allOrders, setAllOrders] = useState<Order[]>([])
  const [counts, setCounts] = useState<DashboardCounts>({
    pendingIntakes: 0,
    messageCount: 0,
    followupEligible: 0,
    customerCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [router])

  const loadData = async () => {
    try {
      const meRes = await staffAuthFetch("/api/admin/me")
      if (!meRes.ok) {
        router.push("/admin/login")
        return
      }

      const [ordersRes, intakesRes, messagesRes, customersRes, followupRes] = await Promise.all([
        staffAuthFetch("/api/admin/orders"),
        staffAuthFetch("/api/admin/intakes?status=pending"),
        staffAuthFetch("/api/admin/messages"),
        staffAuthFetch("/api/admin/customers"),
        staffAuthFetch("/api/admin/customers/signup-followup"),
      ])

      if (ordersRes.ok) {
        const data = await ordersRes.json()
        const orderList: Order[] = data.orders || []
        setAllOrders(orderList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
      }

      setCounts({
        pendingIntakes: intakesRes.ok ? (await intakesRes.json()).intakes?.length || 0 : 0,
        messageCount: messagesRes.ok ? (await messagesRes.json()).messages?.length || 0 : 0,
        customerCount: customersRes.ok ? (await customersRes.json()).users?.length || 0 : 0,
        followupEligible: followupRes.ok ? (await followupRes.json()).eligibleCount || 0 : 0,
      })
    } catch {
      // Keep dashboard visible if secondary loads fail.
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      ready: "bg-green-100 text-green-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    }
    return statusStyles[status] || "bg-gray-100 text-gray-800"
  }

  const pendingOrders = allOrders.filter((o) => o.status === "pending").length
  const processingOrders = allOrders.filter((o) => o.status === "processing").length
  const shippedOrders = allOrders.filter((o) => o.status === "shipped").length
  const awaitingTelehealthOrders = allOrders.filter(
    (o) =>
      isActiveOrderStatus(o.status) &&
      o.prescription_method === "telemedicine" &&
      isTelemedicineAwaitingApprovalStatus(o.telemedicine_intake_status)
  ).length
  const completedOrders = allOrders.filter((o) => isCompletedOrderStatus(o.status)).length
  const cancelledOrders = allOrders.filter((o) => o.status === "cancelled").length
  const activeOrders = allOrders.filter((o) => {
    if (!isActiveOrderStatus(o.status)) return false
    if (o.prescription_method !== "telemedicine") return true
    return !isTelemedicineAwaitingApprovalStatus(o.telemedicine_intake_status)
  }).length

  const stats = {
    totalOrders: pendingOrders + processingOrders + completedOrders + cancelledOrders,
    activeOrders,
    pendingOrders,
    processingOrders,
    awaitingTelehealthOrders,
    shippedOrders,
    completedOrders,
    cancelledOrders,
    totalRevenue: allOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
  }

  const recentActiveOrders = allOrders.filter((o) => {
    if (!isActiveOrderStatus(o.status)) return false
    if (o.prescription_method !== "telemedicine") return true
    return !isTelemedicineAwaitingApprovalStatus(o.telemedicine_intake_status)
  })

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <AdminHeader />

      <main className="flex-1 py-8">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage orders, prescriptions, and customer communications</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 mb-8">
            <AdminDashboardStatCard
              href="/admin/orders"
              title="Active Queue"
              value={stats.activeOrders}
              icon={Package}
              subtitle={`${stats.pendingOrders} pending · ${stats.processingOrders} processing`}
            />
            <AdminDashboardStatCard
              href="/admin/orders?status=awaiting_telehealth"
              title="Awaiting Telehealth"
              value={stats.awaitingTelehealthOrders}
              icon={Clock}
              valueClassName="text-amber-700"
              subtitle="Pending provider approval →"
            />
            <AdminDashboardStatCard
              href="/admin/orders?status=pending"
              title="Pending"
              value={stats.pendingOrders}
              icon={Clock}
              valueClassName="text-yellow-600"
              subtitle="Process pending →"
            />
            <AdminDashboardStatCard
              href="/admin/orders?status=processing"
              title="Processing"
              value={stats.processingOrders}
              icon={Truck}
              valueClassName="text-blue-600"
              subtitle="View in progress →"
            />
            <AdminDashboardStatCard
              href="/admin/orders?status=shipped"
              title="Shipped"
              value={stats.shippedOrders}
              icon={PackageCheck}
              valueClassName="text-purple-600"
              subtitle="View shipped orders →"
            />
            <AdminDashboardStatCard
              href="/admin/orders?status=completed"
              title="Completed"
              value={stats.completedOrders}
              icon={CheckCircle}
              valueClassName="text-green-600"
              subtitle="Ready, shipped & delivered →"
            />
            <AdminDashboardStatCard
              href="/admin/orders?status=cancelled"
              title="Cancelled"
              value={stats.cancelledOrders}
              icon={XCircle}
              valueClassName="text-red-600"
              subtitle="View cancelled →"
            />
            <AdminDashboardStatCard
              href="/admin/orders?status=all"
              title="Revenue"
              value={`$${stats.totalRevenue.toFixed(2)}`}
              icon={DollarSign}
              valueClassName="text-primary"
              subtitle={`${stats.totalOrders} total orders →`}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
            <Link href="/admin/orders" className="block h-full group">
              <Card className="hover:border-primary cursor-pointer transition-colors h-full">
                <CardContent className="flex flex-col items-center justify-center py-6 text-center">
                  <Package className="h-8 w-8 text-primary mb-2" />
                  <p className="font-medium">Active Order Queue</p>
                  <p className="text-xs text-muted-foreground mt-1">{stats.activeOrders} to process</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/customers" className="block h-full group">
              <Card className="hover:border-primary cursor-pointer transition-colors h-full">
                <CardContent className="flex flex-col items-center justify-center py-6 text-center">
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <p className="font-medium">Manage Customers</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {counts.customerCount} registered
                    {counts.followupEligible > 0 ? ` · ${counts.followupEligible} check-in due` : ""}
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/messages" className="block h-full group">
              <Card className="hover:border-primary cursor-pointer transition-colors h-full">
                <CardContent className="flex flex-col items-center justify-center py-6 text-center">
                  <MessageSquare className="h-8 w-8 text-primary mb-2" />
                  <p className="font-medium">Send Messages</p>
                  <p className="text-xs text-muted-foreground mt-1">{counts.messageCount} in inbox</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/intakes" className="block h-full group">
              <Card className="hover:border-primary cursor-pointer transition-colors h-full">
                <CardContent className="flex flex-col items-center justify-center py-6 text-center">
                  <FileText className="h-8 w-8 text-primary mb-2" />
                  <p className="font-medium">Clinical Intakes</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {counts.pendingIntakes} awaiting review
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/medications" className="block h-full group">
              <Card className="hover:border-primary cursor-pointer transition-colors h-full">
                <CardContent className="flex flex-col items-center justify-center py-6 text-center">
                  <Pill className="h-8 w-8 text-primary mb-2" />
                  <p className="font-medium">Medication Catalog</p>
                  <p className="text-xs text-muted-foreground mt-1">Add, edit, or deactivate drugs</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {stats.pendingOrders > 0 ? (
            <Card className="mb-6 border-yellow-200 bg-yellow-50/50">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
                <div>
                  <p className="font-medium text-yellow-900">
                    {stats.pendingOrders} order{stats.pendingOrders === 1 ? "" : "s"} need attention
                  </p>
                  <p className="text-sm text-yellow-800/80">Review pending orders and prescription details.</p>
                </div>
                <Button asChild size="sm" variant="outline" className="bg-background">
                  <Link href="/admin/orders?status=pending">
                    Open pending queue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {counts.pendingIntakes > 0 ? (
            <Card className="mb-6 border-sky-200 bg-sky-50/50">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
                <div>
                  <p className="font-medium text-sky-900">
                    {counts.pendingIntakes} clinical intake{counts.pendingIntakes === 1 ? "" : "s"} awaiting review
                  </p>
                  <p className="text-sm text-sky-800/80">Approve, deny, or request follow-up from the intake queue.</p>
                </div>
                <Button asChild size="sm" variant="outline" className="bg-background">
                  <Link href="/admin/intakes">
                    Review intakes
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Active Orders</CardTitle>
              <Link href="/admin/orders">
                <Button variant="outline" size="sm">
                  Open queue
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentActiveOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No active orders — check Completed or Shipped</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActiveOrders.slice(0, 10).map((order) => (
                    <Link key={order.id} href={`/admin/orders/${order.id}`}>
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 hover:border-primary/40 transition-colors cursor-pointer">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold">#{order.order_number || order.id}</span>
                            <Badge className={getStatusBadge(order.status)}>{order.status}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">{order.items.length} item(s)</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">
                            ${(order.total_amount || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </Link>
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
