"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import type { Order, PatientProfileSummary, User } from "@/lib/auth-types"
import { staffAuthFetch } from "@/lib/staff-session"
import { formatPhoneDisplay, phoneTelHref } from "@/lib/phone"
import { AdminHeader } from "@/components/admin-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
} from "lucide-react"

export default function AdminCustomerDetailPage() {
  const router = useRouter()
  const params = useParams()
  const customerId = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<PatientProfileSummary | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set())

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
      }
    } catch {
      router.push("/admin/login")
    } finally {
      setLoading(false)
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
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Orders</p>
                    <p className="text-2xl font-bold">{orders.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                    <p className="text-2xl font-bold text-primary">${totalSpent.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Order</p>
                    <p className="text-sm font-medium mt-1">
                      {orders.length > 0
                        ? new Date(orders[0].created_at).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

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
