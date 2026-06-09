"use client"

import { useEffect, useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { Package, User, MapPin, Phone, Calendar } from "lucide-react"
import Link from "next/link"
import type { Order } from "@/lib/auth-types"
import { authFetch, clearSession } from "@/lib/session"

interface PatientProfile {
  id: string
  email: string
  name: string
  firstName?: string
  lastName?: string
  phone?: string
  dob?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  created_at: string
}

export default function AccountPage() {
  const [user, setUser] = useState<PatientProfile | null>(null)
  const [userOrders, setUserOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      try {
        const meRes = await authFetch("/api/auth/me")
        const meData = await meRes.json()
        if (!meData.user) {
          router.push("/auth/login?redirect=/account")
          return
        }
        setUser(meData.user)

        // Load orders
        const ordersRes = await authFetch("/api/patient-orders")
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json()
          setUserOrders(ordersData.orders || [])
        }
      } catch {
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 py-12 flex items-center justify-center">
          <p>Loading...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 py-8 md:py-12 bg-muted/30">
        <div className="container max-w-6xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">{user?.name}</h1>

          <Tabs defaultValue="orders" className="flex flex-col gap-6">
            <TabsList>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="flex flex-col gap-6">
              {userOrders.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                    <p className="text-muted-foreground mb-6">Start shopping to see your order history here</p>
                    <Button asChild>
                      <Link href="/">Search Medications</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex flex-col gap-4">
                  {userOrders.map((order) => (
                    <Card key={order.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <p className="font-semibold text-lg">Order #{order.order_number}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString()} at{" "}
                              {new Date(order.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-xl text-primary">${(order.total_amount || 0).toFixed(2)}</p>
                            <p className="text-sm capitalize text-muted-foreground">
                              {order.payment_status} - {order.status}
                            </p>
                          </div>
                        </div>
                        {order.items && order.items.length > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-sm font-medium mb-2">Items:</p>
                            <ul className="flex flex-col gap-1">
                              {order.items.map((item, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground">
                                  {item.drug_name} - Qty: {item.quantity} - ${(item.price || 0).toFixed(2)}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="profile" className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <User className="h-8 w-8" />
                    <div>
                      <CardTitle>Profile Information</CardTitle>
                      <p className="text-sm text-muted-foreground">Your account details</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
                    <div>
                      <p className="text-sm font-medium mb-1">Full Name</p>
                      <p className="text-muted-foreground">{user?.name || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Email</p>
                      <p className="text-muted-foreground">{user?.email}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-1 flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" /> Phone
                      </p>
                      <p className="text-muted-foreground">{user?.phone || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" /> Date of Birth
                      </p>
                      <p className="text-muted-foreground">
                        {user?.dob
                          ? new Date(user.dob + "T00:00:00").toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Not provided"}
                      </p>
                    </div>

                    <div className="sm:col-span-2">
                      <p className="text-sm font-medium mb-1 flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" /> Address
                      </p>
                      <p className="text-muted-foreground">
                        {user?.address
                          ? `${user.address}${user.city ? `, ${user.city}` : ""}${user.state ? `, ${user.state}` : ""} ${user.zip || ""}`.trim()
                          : "Not provided"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-1">Member Since</p>
                      <p className="text-muted-foreground">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={async () => {
                      await authFetch("/api/auth/signout", { method: "POST" })
                      clearSession()
                      router.push("/")
                      }}
                    >
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
