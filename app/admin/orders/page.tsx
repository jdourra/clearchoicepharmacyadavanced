"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { Order } from "@/lib/auth-types"
import { staffAuthFetch, clearStaffSession } from "@/lib/staff-session"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pill,
  Package,
  LogOut,
  Search,
  Printer,
  Eye,
} from "lucide-react"
import { useSearchParams } from "next/navigation"
import Loading from "./loading"
import { isActiveOrderStatus, isCompletedOrderStatus } from "@/lib/admin-order-buckets"
import { isTelemedicineAwaitingApprovalStatus } from "@/lib/admin-order-processing-rules"

const STATUS_FILTER_OPTIONS = [
  "active",
  "awaiting_telehealth",
  "pending",
  "processing",
  "ready",
  "shipped",
  "delivered",
  "completed",
  "cancelled",
  "all",
] as const

export default function AdminOrdersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [allOrders, setAllOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("active")

  useEffect(() => {
    loadData()
  }, [router])

  useEffect(() => {
    const status = searchParams.get("status")
    if (status && STATUS_FILTER_OPTIONS.includes(status as (typeof STATUS_FILTER_OPTIONS)[number])) {
      setStatusFilter(status)
    } else {
      setStatusFilter("active")
    }
  }, [searchParams])

  useEffect(() => {
    filterOrders()
  }, [searchTerm, statusFilter, allOrders])

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    if (value === "active") {
      router.replace("/admin/orders")
    } else {
      router.replace(`/admin/orders?status=${value}`)
    }
  }

  const loadData = async () => {
    try {
      const meRes = await staffAuthFetch("/api/admin/me")
      if (!meRes.ok) {
        router.push("/admin/login")
        return
      }
      const ordersRes = await staffAuthFetch("/api/admin/orders")
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

  const filterOrders = () => {
    let filtered = [...allOrders]
    if (statusFilter === "active") {
      filtered = filtered.filter((o) => {
        if (!isActiveOrderStatus(o.status)) return false
        if (o.prescription_method !== "telemedicine") return true
        return !isTelemedicineAwaitingApprovalStatus(o.telemedicine_intake_status)
      })
    } else if (statusFilter === "awaiting_telehealth") {
      filtered = filtered.filter(
        (o) =>
          isActiveOrderStatus(o.status) &&
          o.prescription_method === "telemedicine" &&
          isTelemedicineAwaitingApprovalStatus(o.telemedicine_intake_status)
      )
    } else if (statusFilter === "completed") {
      filtered = filtered.filter((o) => isCompletedOrderStatus(o.status))
    } else if (statusFilter !== "all") {
      filtered = filtered.filter((o) => o.status === statusFilter)
    }
    if (searchTerm) {
      filtered = filtered.filter(
        (o) =>
          o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (o.order_number || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.items.some((item) => item.drug_name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
    setFilteredOrders(filtered)
  }

  const handleSignOut = async () => {
    await fetch("/api/auth/staff-signout", { method: "POST", credentials: "include" })
    clearStaffSession()
    router.push("/admin/login")
  }

  const handlePrint = (order: Order) => {
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Prescription - Order #${order.order_number || order.id}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #0066cc; }
              .order-info { margin: 20px 0; padding: 15px; border: 1px solid #ddd; }
              .items { margin-top: 20px; }
              .item { padding: 10px 0; border-bottom: 1px solid #eee; }
              .total { font-size: 1.2em; font-weight: bold; margin-top: 20px; }
              @media print { button { display: none; } }
            </style>
          </head>
          <body>
            <h1>Clear Choice Pharmacy</h1>
            <h2>Prescription Order #${order.order_number || order.id}</h2>
            <div class="order-info">
              <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
              <p><strong>Status:</strong> ${order.status}</p>
            </div>
            <div class="items">
              <h3>Medications:</h3>
              ${order.items.map((item) => `
                <div class="item">
                  <p><strong>${item.drug_name}</strong></p>
                  <p>Quantity: ${item.quantity}</p>
                  <p>Price: $${(item.price || 0).toFixed(2)}</p>
                </div>
              `).join("")}
            </div>
            <div class="total">
              Total: $${(order.total_amount || 0).toFixed(2)}
            </div>
            <br/>
            <button onclick="window.print()">Print Prescription</button>
          </body>
        </html>
      `)
      printWindow.document.close()
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

  if (loading) {
    return <Loading />
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
            <Link href="/admin" className="text-sm font-medium hover:text-primary transition-colors">Dashboard</Link>
            <Link href="/admin/orders" className="text-sm font-medium text-primary">Orders</Link>
            <Link href="/admin/customers" className="text-sm font-medium hover:text-primary transition-colors">Customers</Link>
            <Link href="/admin/messages" className="text-sm font-medium hover:text-primary transition-colors">Messages</Link>
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
            <h1 className="text-3xl font-bold">Order Management</h1>
            <p className="text-muted-foreground mt-1">
              {statusFilter === "active"
                ? "Active work queue — pending and in-progress orders"
                : "View and manage customer orders"}
            </p>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by order ID or medication..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                  <SelectTrigger className="w-full md:w-56">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active queue</SelectItem>
                    <SelectItem value="awaiting_telehealth">Awaiting telehealth approval</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="completed">Completed (ready, shipped & delivered)</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="all">All statuses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Orders ({filteredOrders.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No orders found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 hover:border-primary/40 transition-colors"
                    >
                      <Link href={`/admin/orders/${order.id}`} className="flex-1 min-w-0 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">#{order.order_number || order.id}</span>
                          <Badge className={getStatusBadge(order.status)}>{order.status}</Badge>
                        </div>
                        <div className="text-sm mt-2">
                          {order.items.map((item, idx) => (
                            <span key={idx} className="mr-2">
                              {item.drug_name} (x{item.quantity})
                            </span>
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(order.created_at).toLocaleString()}
                        </div>
                      </Link>
                      <div className="flex items-center gap-2 shrink-0 ml-4">
                        <div className="text-right mr-2">
                          <div className="text-lg font-bold text-primary">${(order.total_amount || 0).toFixed(2)}</div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handlePrint(order)
                          }}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/orders/${order.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
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
