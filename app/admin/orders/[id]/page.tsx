"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import type { Order, PatientProfileSummary } from "@/lib/auth-types"
import type { OrderPrescriptionDetails } from "@/lib/order-prescription"
import {
  buildPaymentRequestMessage,
  buildPrescriptionReadyMessage,
  resolveMessageBaseUrl,
} from "@/lib/order-patient-message"
import { messageSubjectForType } from "@/lib/patient-message-subjects"
import { staffAuthFetch, clearStaffSession } from "@/lib/staff-session"
import { AdminOrderPrescriptionPanel } from "@/components/admin-order-prescription"
import { AdminOrderPatientPanel } from "@/components/admin-order-patient"
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
  const [patient, setPatient] = useState<PatientProfileSummary | null>(null)
  const [prescription, setPrescription] = useState<OrderPrescriptionDetails | null>(null)
  const [staffId, setStaffId] = useState<string>("admin")
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
      const meRes = await staffAuthFetch("/api/admin/me")
      if (!meRes.ok) {
        router.push("/admin/login")
        return
      }
      const meData = await meRes.json()
      if (meData.staff?.id) setStaffId(meData.staff.id)

      const orderRes = await staffAuthFetch(`/api/admin/orders/${orderId}`)
      if (orderRes.ok) {
        const data = await orderRes.json()
        setOrder(data.order)
        setPatient(data.patient || null)
        setPrescription(data.prescription || null)
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
    clearStaffSession()
    router.push("/admin/login")
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return
    await staffAuthFetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    setOrder({ ...order, status: newStatus })
  }

  const messageBaseUrl = resolveMessageBaseUrl()

  const templatedMessagePreview = useMemo(() => {
    if (!order) return ""
    if (messageType === "prescription_ready") {
      return buildPrescriptionReadyMessage(order, paymentAmount, messageBaseUrl)
    }
    if (messageType === "payment_request") {
      return buildPaymentRequestMessage(order, paymentAmount, messageBaseUrl)
    }
    return ""
  }, [order, messageType, paymentAmount, messageBaseUrl])

  const handleSendMessage = async () => {
    if (!order) return

    if (!order.patient_id) {
      setSuccessMessage("")
      alert("This order has no linked patient account. Messages can only be sent to registered patients.")
      return
    }

    setSending(true)
    setSuccessMessage("")

    let content = ""
    let type = messageType

    switch (messageType) {
      case "prescription_ready":
        content = buildPrescriptionReadyMessage(order, paymentAmount, messageBaseUrl)
        break
      case "payment_request":
        content = buildPaymentRequestMessage(order, paymentAmount, messageBaseUrl)
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
        type = "custom"
        break
    }

    if (content) {
      if (!order.patient_id || order.patient_id === "null") {
        alert(
          "This order is not linked to a patient account. Ask the customer to place orders while logged in, or contact them by email directly."
        )
        setSending(false)
        return
      }

      const res = await staffAuthFetch("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderType: "staff",
          senderId: staffId,
          recipientType: "patient",
          recipientId: order.patient_id,
          subject: messageSubjectForType(type, order.order_number || order.id),
          body: content,
          orderId: order.id,
        }),
      })
      if (res.ok) {
        const data = await res.json().catch(() => ({}))
        if (data.emailed) {
          setSuccessMessage("Message sent to patient portal and email!")
        } else {
          setSuccessMessage(
            "Message sent to patient portal. Email was not sent — patient can view it at /account → Messages."
          )
        }
        setCustomMessage("")
      } else {
        const data = await res.json().catch(() => ({}))
        alert(data.error || "Failed to send message")
      }
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
              {prescription?.method === "upload" && prescription.uploads.length > 0 ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    const upload = prescription.uploads[0]
                    const url = `/api/admin/orders/${order.id}/prescription-file?uploadId=${upload.id}`
                    const win = window.open(url, "_blank")
                    if (win) setTimeout(() => win.print(), 600)
                  }}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Prescription
                </Button>
              ) : (
                <Button variant="outline" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Order Summary
                </Button>
              )}
            </div>
          </div>

          {prescription && (
            <div className="mb-6">
              <AdminOrderPrescriptionPanel
                orderId={order.id}
                prescription={prescription}
                onRefresh={loadData}
              />
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <AdminOrderPatientPanel patient={patient} patientId={order.patient_id} />

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
                  <span className="text-muted-foreground">Payment</span>
                  <div className="text-right space-y-1">
                    <Badge variant="outline">{order.payment_status || "unpaid"}</Badge>
                    {order.payment_preference && (
                      <p className="text-xs text-muted-foreground">
                        Preference: {order.payment_preference === "pay_by_phone" ? "Pay by phone" : "Pay now"}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-xl font-bold text-primary">${(order.total_amount || 0).toFixed(2)}</span>
                </div>

                {order.notes && prescription?.method === "unknown" && (
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
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Send Message to Patient</CardTitle>
                <CardDescription>
                  Messages appear in the patient&apos;s portal under Messages
                </CardDescription>
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
                  <>
                    <div className="space-y-2">
                      <Label>Total override (optional)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder={order.total_amount?.toFixed(2) || "0.00"}
                      />
                      <p className="text-xs text-muted-foreground">
                        Medication costs are taken from the order items below. Override only if the total differs.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Message preview</Label>
                      <Textarea value={templatedMessagePreview} readOnly rows={8} className="text-sm" />
                    </div>
                  </>
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
