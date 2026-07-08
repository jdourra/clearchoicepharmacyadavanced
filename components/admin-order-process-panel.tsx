"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import type { Order, PatientProfileSummary } from "@/lib/auth-types"
import type { OrderPrescriptionDetails } from "@/lib/order-prescription"
import {
  buildMissingPrescriptionInfoMessage,
  buildMobilePayLinkMessage,
  buildPaymentRequestMessage,
  buildPrescriptionReadyMessage,
  resolveMessageBaseUrl,
} from "@/lib/order-patient-message"
import { getOrderPayUrl, isOrderPaid, formatOrderPaymentLabel } from "@/lib/order-payment"
import { messageSubjectForType } from "@/lib/patient-message-subjects"
import {
  canAdvanceBeyondPending,
  getProcessingBlockers,
  blockerLabel,
  hasPrescriptionInfoBlockers,
  hasUnpaidBlocker,
  isFulfillmentStatus,
} from "@/lib/admin-order-processing-rules"
import { staffAuthFetch } from "@/lib/staff-session"
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
import { getOrderStatusBadgeClass } from "@/lib/admin-order-status"
import { ADMIN_ORDERS_QUEUE_PATH, exitsActiveQueue } from "@/lib/admin-order-buckets"
import { cn } from "@/lib/utils"
import {
  Printer,
  Send,
  CheckCircle,
  AlertTriangle,
  Phone,
  Mail,
  DollarSign,
} from "lucide-react"

type AdminOrderProcessPanelProps = {
  order: Order
  patient: PatientProfileSummary | null
  prescription: OrderPrescriptionDetails | null
  staffId: string
  selectedItemIndex: number
  onOrderUpdate: (order: Order) => void
  onRefresh: () => void
}

export function AdminOrderProcessPanel({
  order,
  patient,
  prescription,
  staffId,
  selectedItemIndex,
  onOrderUpdate,
  onRefresh,
}: AdminOrderProcessPanelProps) {
  const router = useRouter()
  const [messageType, setMessageType] = useState<string>("custom")
  const [customMessage, setCustomMessage] = useState("")
  const [paymentAmount, setPaymentAmount] = useState(order.total_amount?.toFixed(2) || "0")
  const [sending, setSending] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [patientHighlighted, setPatientHighlighted] = useState(false)

  const messageBaseUrl = resolveMessageBaseUrl()
  const payUrl = !isOrderPaid(order) ? getOrderPayUrl(order.id, messageBaseUrl) : null

  const scrollToPatient = () => {
    const el = document.getElementById("admin-order-patient-panel")
    el?.scrollIntoView({ behavior: "smooth", block: "start" })
    setPatientHighlighted(true)
    window.setTimeout(() => setPatientHighlighted(false), 2500)
  }

  const selectedItem = order.items[selectedItemIndex] ?? order.items[0]
  const blockers = useMemo(
    () => getProcessingBlockers(order, prescription),
    [order, prescription]
  )
  const canProcess = canAdvanceBeyondPending(order, prescription)
  const statusLocked = !canProcess && isFulfillmentStatus(order.status)

  const handleStatusChange = async (newStatus: string) => {
    const res = await staffAuthFetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(data.error || "Could not update status")
      return
    }
    onOrderUpdate({ ...order, status: newStatus })

    if (exitsActiveQueue(newStatus)) {
      const message =
        newStatus === "shipped"
          ? "Order shipped — returning to queue for the next order."
          : newStatus === "delivered"
            ? "Order delivered — returning to queue."
            : "Order updated — returning to queue."
      setSuccessMessage(message)
      window.setTimeout(() => router.push(ADMIN_ORDERS_QUEUE_PATH), 1500)
    }
  }

  const templatedMessagePreview = useMemo(() => {
    if (messageType === "prescription_ready") {
      return buildPrescriptionReadyMessage(order, paymentAmount, messageBaseUrl)
    }
    if (messageType === "payment_request") {
      return buildPaymentRequestMessage(order, paymentAmount, messageBaseUrl)
    }
    if (messageType === "mobile_pay_link") {
      return buildMobilePayLinkMessage(order, paymentAmount, messageBaseUrl)
    }
    if (messageType === "missing_prescription_info" && prescription) {
      return buildMissingPrescriptionInfoMessage(order, prescription, messageBaseUrl)
    }
    return ""
  }, [order, messageType, paymentAmount, messageBaseUrl, prescription])

  const sendPortalMessage = async (type: string, body: string) => {
    if (!order.patient_id) {
      alert("This order has no linked patient account. Contact the customer by email or phone directly.")
      return false
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
        body,
        orderId: order.id,
      }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(data.error || "Failed to send message")
      return false
    }

    const data = await res.json().catch(() => ({}))
    if (data.emailed) {
      setSuccessMessage("Message sent to patient portal and email!")
    } else {
      setSuccessMessage(`Message saved to patient portal.${data.emailError ? ` Email: ${data.emailError}` : ""}`)
    }
    return true
  }

  const handleSendPaymentEmail = async () => {
    setSending(true)
    await sendPortalMessage(
      "payment_request",
      buildPaymentRequestMessage(order, paymentAmount, messageBaseUrl)
    )
    setSending(false)
  }

  const handleSendPayLink = async () => {
    setSending(true)
    await sendPortalMessage(
      "mobile_pay_link",
      buildMobilePayLinkMessage(order, paymentAmount, messageBaseUrl)
    )
    setSending(false)
  }

  const handleSendMissingRxEmail = async () => {
    if (!prescription) return
    setSending(true)
    await sendPortalMessage(
      "missing_prescription_info",
      buildMissingPrescriptionInfoMessage(order, prescription, messageBaseUrl)
    )
    setSending(false)
  }

  const handleMarkPaidInFull = async (method: "phone" | "cash") => {
    setSending(true)
    setSuccessMessage("")
    try {
      const res = await staffAuthFetch(`/api/admin/orders/${order.id}/mark-paid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || "Could not mark order paid")
      }
      if (data.order) {
        onOrderUpdate(data.order)
      } else {
        onRefresh()
      }
      setSuccessMessage(
        method === "phone"
          ? "Order marked paid in full (phone)."
          : "Order marked paid in full (cash at pharmacy)."
      )
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not mark order paid")
    } finally {
      setSending(false)
    }
  }

  const handleSendMessage = async () => {
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
      case "mobile_pay_link":
        content = buildMobilePayLinkMessage(order, paymentAmount, messageBaseUrl)
        break
      case "missing_prescription_info":
        if (prescription) {
          content = buildMissingPrescriptionInfoMessage(order, prescription, messageBaseUrl)
        }
        break
      case "shipped":
        content = `Great news! Your prescription has been shipped. Order #${order.order_number || order.id}. You should receive it within 2-3 business days.`
        if (canProcess) await handleStatusChange("shipped")
        break
      case "delivered":
        content = `Your prescription has been delivered! Order #${order.order_number || order.id}. Thank you for choosing Clear Choice Pharmacy.`
        if (canProcess) await handleStatusChange("delivered")
        break
      case "custom":
        content = customMessage
        type = "custom"
        break
    }

    if (content) {
      await sendPortalMessage(type, content)
      setCustomMessage("")
    }

    setSending(false)
  }

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return
    printWindow.document.write(`
      <html>
        <head><title>Order #${order.order_number || order.id}</title></head>
        <body>
          <h1>Clear Choice Pharmacy</h1>
          <h2>Order #${order.order_number || order.id}</h2>
          <p>Status: ${order.status}</p>
          <p>Total: $${(order.total_amount || 0).toFixed(2)}</p>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="space-y-6">
      {selectedItem ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Processing medication</CardTitle>
            <CardDescription>
              Order #{order.order_number || order.id} ·{" "}
              <Badge className={getOrderStatusBadgeClass(order.status)}>{order.status}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-background rounded-lg border">
              <div>
                <p className="font-semibold text-lg">{selectedItem.drug_name}</p>
                <p className="text-sm text-muted-foreground">Qty: {selectedItem.quantity}</p>
              </div>
              <p className="text-xl font-bold text-primary">${(selectedItem.price || 0).toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {!canProcess ? (
        <Card className="border-amber-200 bg-amber-50/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-amber-900">
              <AlertTriangle className="h-5 w-5" />
              Order must stay pending
            </CardTitle>
            <CardDescription className="text-amber-800/90">
              Payment and prescription requirements must be met before processing, ready, or shipped
              status. Mark paid in full if the patient paid by phone or cash at the pharmacy.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="text-sm text-amber-900 space-y-1">
              {blockers.map((b) => (
                <li key={b}>• {blockerLabel(b)}</li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              {hasUnpaidBlocker(blockers) ? (
                <>
                  <Button size="sm" disabled={sending} onClick={() => void handleSendPayLink()}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send pay link
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-background"
                    disabled={sending}
                    onClick={() => void handleSendPaymentEmail()}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send full payment email
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-background"
                    disabled={sending}
                    onClick={() => void handleMarkPaidInFull("phone")}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Paid in full (phone)
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-background"
                    disabled={sending}
                    onClick={() => void handleMarkPaidInFull("cash")}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Paid in full (cash)
                  </Button>
                </>
              ) : null}
              {hasPrescriptionInfoBlockers(blockers) && prescription ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-background"
                  disabled={sending}
                  onClick={() => void handleSendMissingRxEmail()}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Request prescription info
                </Button>
              ) : null}
              {patient ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-background"
                  type="button"
                  onClick={scrollToPatient}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call patient
                </Button>
              ) : null}
            </div>
            {statusLocked ? (
              <p className="text-xs text-amber-800">
                This order is in a fulfillment status but requirements are not met. Set status back
                to pending below.
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="py-4 flex items-center gap-2 text-green-800 text-sm">
            <CheckCircle className="h-4 w-4 shrink-0" />
            Payment received and prescription requirements met — you can process this order.
          </CardContent>
        </Card>
      )}

      {prescription ? (
        <AdminOrderPrescriptionPanel
          orderId={order.id}
          prescription={prescription}
          onRefresh={onRefresh}
        />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <AdminOrderPatientPanel
            patient={patient}
            patientId={order.patient_id}
            highlighted={patientHighlighted}
            payUrl={payUrl}
          />

          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Select value={order.status} onValueChange={(v) => void handleStatusChange(v)}>
                  <SelectTrigger className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing" disabled={!canProcess}>
                      Processing
                    </SelectItem>
                    <SelectItem value="ready" disabled={!canProcess}>
                      Ready
                    </SelectItem>
                    <SelectItem value="shipped" disabled={!canProcess}>
                      Shipped
                    </SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Payment</span>
                <Badge
                  variant="outline"
                  className={cn(isOrderPaid(order) && "border-green-300 bg-green-50 text-green-800")}
                >
                  {formatOrderPaymentLabel(order)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="text-xl font-bold text-primary">
                  ${(order.total_amount || 0).toFixed(2)}
                </span>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">All items</h4>
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex justify-between items-center p-3 rounded-lg border",
                        idx === selectedItemIndex && "border-primary bg-primary/5"
                      )}
                    >
                      <div>
                        <p className="font-medium">{item.drug_name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-semibold">${(item.price || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
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
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Send Message to Patient</CardTitle>
            <CardDescription>Messages appear in the patient&apos;s portal under Messages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {successMessage ? (
              <div className="p-3 text-sm text-green-600 bg-green-50 rounded-lg flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                {successMessage}
              </div>
            ) : null}

            <div className="space-y-2">
              <Label>Message Type</Label>
              <Select value={messageType} onValueChange={setMessageType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mobile_pay_link">Pay Link (mobile)</SelectItem>
                  <SelectItem value="payment_request">Payment Request (full)</SelectItem>
                  <SelectItem value="missing_prescription_info">Request Prescription Info</SelectItem>
                  <SelectItem value="prescription_ready">Prescription Ready + Cost</SelectItem>
                  <SelectItem value="shipped" disabled={!canProcess}>
                    Prescription Shipped
                  </SelectItem>
                  <SelectItem value="delivered">Prescription Delivered</SelectItem>
                  <SelectItem value="custom">Custom Message</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(messageType === "prescription_ready" ||
              messageType === "payment_request" ||
              messageType === "mobile_pay_link" ||
              messageType === "missing_prescription_info") && (
              <>
                {(messageType === "prescription_ready" ||
                  messageType === "payment_request" ||
                  messageType === "mobile_pay_link") && (
                  <div className="space-y-2">
                    <Label>Total override (optional)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                    />
                  </div>
                )}
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
              onClick={() => void handleSendMessage()}
              disabled={
                sending ||
                (messageType === "custom" && !customMessage) ||
                (messageType === "missing_prescription_info" && !prescription)
              }
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              {sending ? "Sending..." : "Send Message"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
