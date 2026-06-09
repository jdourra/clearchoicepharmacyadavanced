"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import type { Order, Message } from "@/lib/auth-types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pill,
  LogOut,
  ArrowLeft,
  Printer,
  Send,
  DollarSign,
  Truck,
  CheckCircle,
  MessageSquare,
} from "lucide-react"

export default function AdminOrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [messageType, setMessageType] = useState<string>("custom")
  const [customMessage, setCustomMessage] = useState("")
  const [paymentAmount, setPaymentAmount] = useState("")
  const [sending, setSending] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    loadData()
  }, [router, orderId])

  const loadData = async () => {
    try {
      const meRes = await fetch("/api/admin/me", { credentials: "include" })
      if (!meRes.ok) {
        router.push("/admin/login")
        return
      }
      const orderRes = await fetch(`/api/admin/orders/${orderId}`, { credentials: "include" })
      if (orderRes.ok) {
        const data = await orderRes.json()
        setOrder(data.order)
        if (data.order) {
          setPaymentAmount(data.order.total_amount?.toFixed(2) || "0")
        }
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

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return
    await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status: newStatus }),
    })
    setOrder({ ...order, status: newStatus })
  }

  const handleSendMessage = async () => {
    if (!order) return
    setSending(true)
    setSuccessMessage("")

    let content = ""

    switch (messageType) {
      case "prescription_ready":
        content = `Your prescription is ready! The total cost is $${paymentAmount}. How would you like to pay? Please reply or call us at (248) 987-6182.`
        break
      case "payment_request":
        content = `Payment request for Order #${order.order_number || order.id}. Amount due: $${paymentAmount}. Please complete your payment to proceed with your order.`
        break
      case "shipped":
        content = `Great news! Your prescription has been shipped. Order #${order.order_number || order.id}. You should receive it within 2-3 business days.`
        await handleStatusChange("shipped")
        break
      case "delivered":
        content = `Your prescription has been delivered! Order #${order.order_number || order.id}. Thank you for choosing Clear Choice Pharmacy.`
        await handleStatusChange("delivered")
        break
      case "custom":
        content = customMessage
        break
    }

    if (content) {
      await fetch("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          senderType: "admin",
          senderId: "admin",
          recipientType: "patient",
          recipientId: order.patient_id,
          subject: messageType,
          body: content,
        }),
      })
      setSuccessMessage("Message sent successfully!")
      setCustomMessage("")
    }

    setSending(false)
  }

  const handlePrint = () => {
    if (!order) return
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
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Order not found</p>
          <Link href="/admin/orders">
            <Button>Back to Orders</Button>
          </Link>
        </div>
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
          <Link href="/admin/orders" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Orders
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Order #{order.order_number || order.id}</h1>
              <p className="text-muted-foreground mt-1">{new Date(order.created_at).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print Prescription
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Select value={order.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-xl font-bold text-primary">${(order.total_amount || 0).toFixed(2)}</span>
                </div>

                {order.notes && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-semibold mb-3">Order Notes</h4>
                    <div className="p-3 bg-muted rounded-lg text-sm whitespace-pre-wrap">{order.notes}</div>
                  </div>
                )}

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-semibold mb-3">Items</h4>
                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{item.drug_name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <span className="font-semibold">${(item.price || 0).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Send Message to Patient</CardTitle>
                <CardDescription>Notify the patient about their prescription status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {successMessage && (
                  <div className="p-3 text-sm text-green-600 bg-green-50 rounded-lg flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    {successMessage}
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Message Type</Label>
                  <Select value={messageType} onValueChange={setMessageType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prescription_ready">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Prescription Ready + Cost
                        </div>
                      </SelectItem>
                      <SelectItem value="payment_request">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-primary" />
                          Payment Request
                        </div>
                      </SelectItem>
                      <SelectItem value="shipped">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-purple-600" />
                          Prescription Shipped
                        </div>
                      </SelectItem>
                      <SelectItem value="delivered">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-gray-600" />
                          Prescription Delivered
                        </div>
                      </SelectItem>
                      <SelectItem value="custom">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Custom Message
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(messageType === "prescription_ready" || messageType === "payment_request") && (
                  <div className="space-y-2">
                    <Label>Amount ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                    />
                  </div>
                )}

                {messageType === "custom" && (
                  <div className="space-y-2">
                    <Label>Custom Message</Label>
                    <Textarea
                      placeholder="Type your message here..."
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      rows={4}
                    />
                  </div>
                )}

                <Button
                  onClick={handleSendMessage}
                  disabled={sending || (messageType === "custom" && !customMessage)}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {sending ? "Sending..." : "Send Message"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
