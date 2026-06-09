"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { Order, User } from "@/lib/auth-types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Pill,
  LogOut,
  Search,
  Users,
  Package,
  Mail,
} from "lucide-react"
import Loading from "./loading"

interface CustomerWithOrders extends User {
  orders: Order[]
  totalSpent: number
}

export default function AdminCustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<CustomerWithOrders[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerWithOrders[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadData()
  }, [router])

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
      const meRes = await fetch("/api/admin/me", { credentials: "include" })
      if (!meRes.ok) {
        router.push("/admin/login")
        return
      }

      const [customersRes, ordersRes] = await Promise.all([
        fetch("/api/admin/customers", { credentials: "include" }),
        fetch("/api/admin/orders", { credentials: "include" }),
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

  const handleSignOut = async () => {
    await fetch("/api/auth/staff-signout", { method: "POST", credentials: "include" })
    router.push("/admin/login")
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
            <Link href="/admin/orders" className="text-sm font-medium hover:text-primary transition-colors">Orders</Link>
            <Link href="/admin/customers" className="text-sm font-medium text-primary">Customers</Link>
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
            <h1 className="text-3xl font-bold">Customer Management</h1>
            <p className="text-muted-foreground mt-1">View all registered customers and their order history</p>
          </div>

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
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
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
                      </div>
                      <div className="flex items-center gap-6">
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
