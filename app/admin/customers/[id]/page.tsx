"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import type { Order, PatientProfileSummary, User } from "@/lib/auth-types"
import type { CustomerClinicalProgram } from "@/lib/admin-customer-programs"
import type { PatientBalanceRequest, PatientLedgerEntry } from "@/lib/patient-balance-types"
import { staffAuthFetch } from "@/lib/staff-session"
import { formatPhoneDisplay, phoneTelHref } from "@/lib/phone"
import { AdminHeader } from "@/components/admin-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getOrderStatusBadgeClass } from "@/lib/admin-order-status"
import { buildBatchProcessUrl, isOrderBatchSelectable } from "@/lib/admin-order-batch"
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Package,
  User as UserIcon,
  Play,
  Stethoscope,
  DollarSign,
  Loader2,
} from "lucide-react"

type PaymentSummary = {
  totalReceived: number
  pendingRequested: number
  balanceRequests: PatientBalanceRequest[]
  ledger: PatientLedgerEntry[]
}

export default function AdminCustomerDetailPage() {
  const router = useRouter()
  const params = useParams()
  const customerId = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<PatientProfileSummary | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [clinicalPrograms, setClinicalPrograms] = useState<CustomerClinicalProgram[]>([])
  const [payments, setPayments] = useState<PaymentSummary>({
    totalReceived: 0,
    pendingRequested: 0,
    balanceRequests: [],
    ledger: [],
  })
  const [loading, setLoading] = useState(true)
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set())
  const [requestAmount, setRequestAmount] = useState("")
  const [requestDescription, setRequestDescription] = useState("Remaining balance due")
  const [recordAmount, setRecordAmount] = useState("")
  const [recordNote, setRecordNote] = useState("Prior payment recorded by staff")
  const [recordPi, setRecordPi] = useState("")
  const [paymentBusy, setPaymentBusy] = useState<"request" | "record" | null>(null)
  const [paymentMessage, setPaymentMessage] = useState("")
  const [paymentError, setPaymentError] = useState("")

  useEffect(() => {
    loadData()
  }, [router, customerId])

  const loadData = async () => {
    try {
      const meRes = await staffAuthFetch("/api/admin/me")
      if (!meRes.ok) {
        router.push("/admin/login")
        return
      }

      const res = await staffAuthFetch(`/api/admin/customers/${customerId}`)
      if (res.ok) {
        const data = await res.json()
        setUser(data.user || null)
        setProfile(data.profile || null)
        setOrders(data.orders || [])
        setClinicalPrograms(data.clinicalPrograms || [])
        if (data.payments) {
          setPayments({
            totalReceived: Number(data.payments.totalReceived || 0),
            pendingRequested: Number(data.payments.pendingRequested || 0),
            balanceRequests: data.payments.balanceRequests || [],
            ledger: data.payments.ledger || [],
          })
        }
      }
    } catch {
      router.push("/admin/login")
    } finally {
      setLoading(false)
    }
  }

  const refreshPayments = (data: Record<string, unknown>) => {
    setPayments({
      totalReceived: Number(data.totalReceived || 0),
      pendingRequested: Number(data.pendingRequested || 0),
      balanceRequests: (data.balanceRequests as PatientBalanceRequest[]) || [],
      ledger: (data.ledger as PatientLedgerEntry[]) || [],
    })
  }

  const submitBalanceRequest = async () => {
    setPaymentBusy("request")
    setPaymentError("")
    setPaymentMessage("")
    try {
      const res = await staffAuthFetch(`/api/admin/customers/${customerId}/balance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request",
          amount: Number(requestAmount),
          description: requestDescription,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to send payment request")
      refreshPayments(data)
      setPaymentMessage(
        data.emailSent
          ? `Payment request emailed. Link: ${data.paymentUrl || "created"}`
          : `Payment link created, but email failed: ${data.emailError || "unknown error"}. Link: ${data.paymentUrl || ""}`
      )
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Failed to send payment request")
    } finally {
      setPaymentBusy(null)
    }
  }

  const submitRecordPayment = async () => {
    setPaymentBusy("record")
    setPaymentError("")
    setPaymentMessage("")
    try {
      const res = await staffAuthFetch(`/api/admin/customers/${customerId}/balance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "record",
          amount: Number(recordAmount),
          note: recordNote,
          stripePaymentIntentId: recordPi || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to record payment")
      refreshPayments(data)
      setPaymentMessage(`Recorded $${Number(recordAmount).toFixed(2)} on patient ledger.`)
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Failed to record payment")
    } finally {
      setPaymentBusy(null)
    }
  }

  const selectableOrders = useMemo(
    () => orders.filter(isOrderBatchSelectable),
    [orders]
  )

  const allSelectableSelected =
    selectableOrders.length > 0 &&
    selectableOrders.every((o) => selectedOrderIds.has(o.id))

  const toggleOrder = (orderId: string, checked: boolean) => {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(orderId)
      else next.delete(orderId)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (allSelectableSelected) {
      setSelectedOrderIds(new Set())
    } else {
      setSelectedOrderIds(new Set(selectableOrders.map((o) => o.id)))
    }
  }

  const handleBatchProcess = () => {
    const ids = [...selectedOrderIds]
    if (ids.length === 0) return
    router.push(buildBatchProcessUrl(customerId, ids))
  }

  const totalSpent = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
  const combinedReceived = totalSpent + payments.totalReceived

  const formatAddress = () => {
    if (!profile) return null
    const parts = [
      profile.addressLine1,
      profile.addressLine2,
      [profile.city, profile.state, profile.zip].filter(Boolean).join(", "),
    ].filter(Boolean)
    return parts.length > 0 ? parts.join(", ") : null
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/30">
        <AdminHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Customer not found</p>
            <Button asChild>
              <Link href="/admin/customers">Back to Customers</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const address = formatAddress()

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <AdminHeader />

      <main className="flex-1 py-8">
        <div className="container">
          <Link
            href="/admin/customers"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Customers
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground mt-1">
              Customer since {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3 mb-8">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <UserIcon className="h-5 w-5" />
                  Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <a href={`mailto:${user.email}`} className="hover:text-primary">
                    {user.email}
                  </a>
                </div>
                {profile?.phone ? (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <a href={phoneTelHref(profile.phone)} className="hover:text-primary">
                      {formatPhoneDisplay(profile.phone)}
                    </a>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No phone on file</p>
                )}
                {address ? (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span>{address}</span>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Orders</p>
                    <p className="text-2xl font-bold">{orders.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Clinical programs</p>
                    <p className="text-2xl font-bold">{clinicalPrograms.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Orders total</p>
                    <p className="text-2xl font-bold text-primary">${totalSpent.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payments received</p>
                    <p className="text-2xl font-bold text-primary">${combinedReceived.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending requests</p>
                    <p className="text-2xl font-bold">${payments.pendingRequested.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payments &amp; balance requests
              </CardTitle>
              <CardDescription>
                Record prior payments (including old Stripe charges) and email a Stripe checkout link for remaining balance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3 rounded-lg border p-4">
                  <p className="font-medium">Request remaining balance</p>
                  <div className="space-y-2">
                    <Label htmlFor="requestAmount">Amount (USD)</Label>
                    <Input
                      id="requestAmount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={requestAmount}
                      onChange={(e) => setRequestAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="requestDescription">Description</Label>
                    <Textarea
                      id="requestDescription"
                      rows={2}
                      value={requestDescription}
                      onChange={(e) => setRequestDescription(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={submitBalanceRequest}
                    disabled={paymentBusy !== null}
                    className="w-full"
                  >
                    {paymentBusy === "request" ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Email Stripe payment link
                  </Button>
                </div>

                <div className="space-y-3 rounded-lg border p-4">
                  <p className="font-medium">Record prior payment</p>
                  <div className="space-y-2">
                    <Label htmlFor="recordAmount">Amount (USD)</Label>
                    <Input
                      id="recordAmount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={recordAmount}
                      onChange={(e) => setRecordAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recordNote">Note</Label>
                    <Textarea
                      id="recordNote"
                      rows={2}
                      value={recordNote}
                      onChange={(e) => setRecordNote(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recordPi">Stripe PaymentIntent (optional)</Label>
                    <Input
                      id="recordPi"
                      value={recordPi}
                      onChange={(e) => setRecordPi(e.target.value)}
                      placeholder="pi_..."
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={submitRecordPayment}
                    disabled={paymentBusy !== null}
                    className="w-full"
                  >
                    {paymentBusy === "record" ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Save on patient ledger
                  </Button>
                </div>
              </div>

              {paymentError ? <p className="text-sm text-destructive">{paymentError}</p> : null}
              {paymentMessage ? <p className="text-sm text-emerald-700 break-all">{paymentMessage}</p> : null}

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium mb-2">Payment requests</p>
                  {payments.balanceRequests.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No balance requests yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {payments.balanceRequests.map((req) => (
                        <div key={req.id} className="rounded-lg border p-3 text-sm">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-medium">${req.amount.toFixed(2)}</span>
                            <Badge variant={req.status === "paid" ? "default" : "secondary"}>
                              {req.status}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mt-1">{req.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {req.id} · {new Date(req.createdAt).toLocaleString()}
                          </p>
                          {req.paymentUrl ? (
                            <a
                              href={req.paymentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-primary underline-offset-2 hover:underline break-all"
                            >
                              Open payment link
                            </a>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Payment ledger</p>
                  {payments.ledger.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No recorded payments yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {payments.ledger.map((entry) => (
                        <div key={entry.id} className="rounded-lg border p-3 text-sm">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-medium text-primary">${entry.amount.toFixed(2)}</span>
                            <Badge variant="outline">{entry.source}</Badge>
                          </div>
                          {entry.note ? <p className="text-muted-foreground mt-1">{entry.note}</p> : null}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(entry.createdAt).toLocaleString()}
                            {entry.stripePaymentIntentId ? ` · ${entry.stripePaymentIntentId}` : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Clinical programs ({clinicalPrograms.length})
              </CardTitle>
              <CardDescription>
                Medication and service intakes — transaction stage and payment status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {clinicalPrograms.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  No clinical intakes for this customer yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {clinicalPrograms.map((program) => (
                    <Link
                      key={`${program.serviceType}-${program.id}`}
                      href={program.reviewHref}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="min-w-0 space-y-1">
                        <p className="font-medium">
                          {program.serviceLabel}
                          <span className="text-muted-foreground font-normal"> · {program.treatmentLabel}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {program.id} · Submitted {new Date(program.createdAt).toLocaleString()}
                          {program.stripePaymentIntentId
                            ? ` · Stripe ${program.stripePaymentIntentId}`
                            : ""}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <Badge variant="outline">{program.statusLabel}</Badge>
                        <Badge
                          variant={
                            program.paymentStatus === "captured"
                              ? "default"
                              : program.paymentStatus === "failed"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {program.paymentStatusLabel}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Orders ({orders.length})
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Select orders to process together, or open one to process individually
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {selectableOrders.length > 0 ? (
                    <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                      {allSelectableSelected ? "Clear selection" : `Select all (${selectableOrders.length})`}
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    disabled={selectedOrderIds.size === 0}
                    onClick={handleBatchProcess}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Process selected ({selectedOrderIds.size})
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => {
                    const selectable = isOrderBatchSelectable(order)
                    const isSelected = selectedOrderIds.has(order.id)

                    return (
                      <div
                        key={order.id}
                        className={`flex items-center gap-3 p-4 border rounded-lg transition-colors ${
                          isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                        }`}
                      >
                        <div
                          className="shrink-0 pt-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={isSelected}
                            disabled={!selectable}
                            onCheckedChange={(checked) =>
                              toggleOrder(order.id, checked === true)
                            }
                            aria-label={`Select order ${order.order_number || order.id}`}
                          />
                        </div>

                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="flex flex-1 items-center justify-between min-w-0 cursor-pointer"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold">
                                #{order.order_number || order.id}
                              </span>
                              <Badge className={getOrderStatusBadgeClass(order.status)}>
                                {order.status}
                              </Badge>
                              <Badge variant="outline" className="capitalize">
                                {order.payment_status || "unpaid"}
                              </Badge>
                            </div>
                            <div className="text-sm mt-2 text-muted-foreground">
                              {order.items.map((item, idx) => (
                                <span key={idx} className="mr-2">
                                  {item.drug_name} (x{item.quantity})
                                </span>
                              ))}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {new Date(order.created_at).toLocaleString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 ml-4">
                            <div className="text-lg font-bold text-primary">
                              ${(order.total_amount || 0).toFixed(2)}
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </Link>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
