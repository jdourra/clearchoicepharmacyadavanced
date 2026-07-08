"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { Order, User } from "@/lib/auth-types"
import { staffAuthFetch } from "@/lib/staff-session"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Users,
  Package,
  Mail,
  Send,
  Loader2,
  MessageCircle,
} from "lucide-react"
import { AdminHeader } from "@/components/admin-header"
import Loading from "./loading"

interface CustomerWithOrders extends User {
  orders: Order[]
  totalSpent: number
}

type FollowupCandidate = {
  id: string
  email: string
  name: string
  createdAt: string
}

export default function AdminCustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<CustomerWithOrders[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerWithOrders[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [followupCandidates, setFollowupCandidates] = useState<FollowupCandidate[]>([])
  const [followupLoading, setFollowupLoading] = useState(true)
  const [sendingFollowup, setSendingFollowup] = useState(false)
  const [sendingPatientId, setSendingPatientId] = useState<string | null>(null)
  const [followupMessage, setFollowupMessage] = useState("")

  const loadFollowupCandidates = useCallback(async () => {
    setFollowupLoading(true)
    try {
      const res = await staffAuthFetch("/api/admin/customers/signup-followup")
      if (res.ok) {
        const data = await res.json()
        setFollowupCandidates(data.candidates || [])
      }
    } catch {
      setFollowupCandidates([])
    } finally {
      setFollowupLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    loadFollowupCandidates()
  }, [router, loadFollowupCandidates])

  useEffect(() => {
    if (searchTerm) {
      setFilteredCustomers(
        customers.filter(
          (c) =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    } else {
      setFilteredCustomers(customers)
    }
  }, [searchTerm, customers])

  const loadData = async () => {
    try {
      const meRes = await staffAuthFetch("/api/admin/me")
      if (!meRes.ok) {
        router.push("/admin/login")
        return
      }

      const [customersRes, ordersRes] = await Promise.all([
        staffAuthFetch("/api/admin/customers"),
        staffAuthFetch("/api/admin/orders"),
      ])

      const allUsers: User[] = customersRes.ok ? (await customersRes.json()).users || [] : []
      const allOrders: Order[] = ordersRes.ok ? (await ordersRes.json()).orders || [] : []

      const customersWithOrders: CustomerWithOrders[] = allUsers.map((user) => {
        const userOrders = allOrders.filter((o) => o.patient_id === user.id)
        const totalSpent = userOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
        return { ...user, orders: userOrders, totalSpent }
      })

      setCustomers(customersWithOrders.sort((a, b) => b.totalSpent - a.totalSpent))
    } catch {
      router.push("/admin/login")
    } finally {
      setLoading(false)
    }
  }

  const handleSendFollowupBatch = async () => {
    if (followupCandidates.length === 0) return
    const confirmed = window.confirm(
      `Send a friendly check-in email to ${followupCandidates.length} patient(s) who signed up 3–30 days ago with no orders? Each person will only receive this once.`
    )
    if (!confirmed) return

    setSendingFollowup(true)
    setFollowupMessage("")
    try {
      const res = await staffAuthFetch("/api/admin/customers/signup-followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Send failed")
      }
      setFollowupMessage(
        `Sent ${data.sent} of ${data.eligible} email(s).${data.failed ? ` ${data.failed} failed — check SES configuration.` : ""}`
      )
      await loadFollowupCandidates()
    } catch (err) {
      setFollowupMessage(err instanceof Error ? err.message : "Failed to send emails")
    } finally {
      setSendingFollowup(false)
    }
  }

  const handleSendFollowupOne = async (patientId: string, email: string) => {
    const confirmed = window.confirm(`Send check-in email to ${email}?`)
    if (!confirmed) return

    setSendingPatientId(patientId)
    try {
      const res = await staffAuthFetch("/api/admin/customers/signup-followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientIds: [patientId] }),
      })
      const data = await res.json()
      if (!res.ok || data.failed > 0) {
        const err = data.results?.[0]?.error || data.error || "Send failed"
        throw new Error(err)
      }
      setFollowupMessage(`Check-in email sent to ${email}.`)
      await loadFollowupCandidates()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to send email")
    } finally {
      setSendingPatientId(null)
    }
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <AdminHeader />

      <main className="flex-1 py-8">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Customer Management</h1>
            <p className="text-muted-foreground mt-1">View all registered customers and their order history</p>
          </div>

          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                Signup check-in emails
              </CardTitle>
              <CardDescription>
                Send a one-time helpful email to patients who joined 3–30 days ago but have not placed an order yet.
                Asks if they need help with pricing, transfers, or telemedicine.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {followupLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading eligible patients...
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      {followupCandidates.length} eligible
                    </Badge>
                    <Button
                      onClick={handleSendFollowupBatch}
                      disabled={followupCandidates.length === 0 || sendingFollowup}
                    >
                      {sendingFollowup ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send check-in to all eligible
                        </>
                      )}
                    </Button>
                  </div>
                  {followupMessage ? (
                    <p className="text-sm text-foreground rounded-lg border bg-background px-4 py-3">{followupMessage}</p>
                  ) : null}
                  {followupCandidates.length > 0 ? (
                    <ul className="text-sm space-y-2 max-h-40 overflow-y-auto">
                      {followupCandidates.map((c) => (
                        <li key={c.id} className="flex justify-between gap-2 text-muted-foreground">
                          <span>
                            {c.name || c.email} · {c.email}
                          </span>
                          <span className="shrink-0">{new Date(c.createdAt).toLocaleDateString()}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No patients are due for a check-in right now.</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customers ({filteredCustomers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredCustomers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No customers found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 hover:border-primary/40 transition-colors"
                    >
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="flex-1 min-w-0 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-primary font-semibold">
                              {customer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold">{customer.name}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </p>
                          </div>
                        </div>
                      </Link>
                      <div className="flex items-center gap-6 shrink-0 ml-4">
                        <div className="text-center">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Package className="h-4 w-4" />
                            <span className="text-sm">Orders</span>
                          </div>
                          <p className="font-semibold">{customer.orders.length}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Total Spent</p>
                          <p className="font-semibold text-primary">${customer.totalSpent.toFixed(2)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Joined</p>
                          <p className="text-sm">{new Date(customer.created_at).toLocaleDateString()}</p>
                        </div>
                        {customer.orders.length === 0 ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={sendingPatientId === customer.id}
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleSendFollowupOne(customer.id, customer.email)
                            }}
                          >
                            {sendingPatientId === customer.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Send className="h-3 w-3 mr-1" />
                                Check-in
                              </>
                            )}
                          </Button>
                        ) : null}
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
