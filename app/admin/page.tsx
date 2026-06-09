"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { Order } from "@/lib/auth-types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Pill,
  Package,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  Truck,
  LogOut,
  MessageSquare,
  FileText,
} from "lucide-react"

export default function AdminDashboard() {
  const router = useRouter()
  const [allOrders, setAllOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [router])

  const loadData = async () => {
    try {
      const meRes = await fetch("/api/admin/me", { credentials: "include" })
      if (!meRes.ok) {
        router.push("/admin/login")
        return
      }
      const ordersRes = await fetch("/api/admin/orders", { credentials: "include" })
      if (ordersRes.ok) {
        const data = await ordersRes.json()
        const orderList: Order[] = data.orders || []
        setAllOrders(orderList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
      }
    } catch {
      router.push("/admin/login")
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await fetch("/api/auth/staff-signout", { method: "POST", credentials: "include" })
    router.push("/admin/login")
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

  const stats = {
    totalOrders: allOrders.length,
    pendingOrders: allOrders.filter((o) => o.status === "pending").length,
    processingOrders: allOrders.filter((o) => o.status === "processing").length,
    completedOrders: allOrders.filter((o) => o.status === "delivered" || o.status === "ready").length,
    totalRevenue: allOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Pill className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">Clear Choice Pharmacy - Admin</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/admin" className="text-sm font-medium text-primary">
              Dashboard
            </Link>
            <Link href="/admin/orders" className="text-sm font-medium hover:text-primary transition-colors">
              Orders
            </Link>
            <Link href="/admin/customers" className="text-sm font-medium hover:text-primary transition-colors">
              Customers
            </Link>
            <Link href="/admin/messages" className="text-sm font-medium hover:text-primary transition-colors">
              Messages
            </Link>
          </nav>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="flex-1 py-8">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage orders, prescriptions, and customer communications</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Processing</CardTitle>
                <Truck className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.processingOrders}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.completedOrders}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">${stats.totalRevenue.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <Link href="/admin/orders">
              <Card className="hover:border-primary cursor-pointer transition-colors h-full">
                <CardContent className="flex flex-col items-center justify-center py-6">
                  <Package className="h-8 w-8 text-primary mb-2" />
                  <p className="font-medium">View All Orders</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/customers">
              <Card className="hover:border-primary cursor-pointer transition-colors h-full">
                <CardContent className="flex flex-col items-center justify-center py-6">
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <p className="font-medium">Manage Customers</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/messages">
              <Card className="hover:border-primary cursor-pointer transition-colors h-full">
                <CardContent className="flex flex-col items-center justify-center py-6">
                  <MessageSquare className="h-8 w-8 text-primary mb-2" />
                  <p className="font-medium">Send Messages</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/prescriptions">
              <Card className="hover:border-primary cursor-pointer transition-colors h-full">
                <CardContent className="flex flex-col items-center justify-center py-6">
                  <FileText className="h-8 w-8 text-primary mb-2" />
                  <p className="font-medium">Prescriptions</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Link href="/admin/orders">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {allOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allOrders.slice(0, 10).map((order) => (
                    <Link key={order.id} href={`/admin/orders/${order.id}`}>
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold">#{order.order_number || order.id}</span>
                            <Badge className={getStatusBadge(order.status)}>{order.status}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {order.items.length} item(s)
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">${(order.total_amount || 0).toFixed(2)}</div>
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
