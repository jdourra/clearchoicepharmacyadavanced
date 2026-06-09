"use client"
import { useRouter } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Package, FileText, User, CreditCard } from "lucide-react"
import { useEffect, useState } from "react"
import type { User as AuthUser } from "@/lib/auth-types"
import { authFetch } from "@/lib/session"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authFetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
          router.push("/auth/login")
          return null
        }
        return res.json()
      })
      .then((data) => {
        if (data?.user) {
          setUser(data.user)
          setLoading(false)
        }
      })
      .catch(() => router.push("/auth/login"))
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
      <main className="flex-1 py-12">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Welcome back, {user?.name || "Patient"}</h1>
            <p className="text-muted-foreground mt-1">Manage your prescriptions and orders</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Browse Medications</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" size="sm" className="w-full bg-transparent">
                  <Link href="/">Search Medications</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">My Cart</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" size="sm" className="w-full bg-transparent">
                  <Link href="/cart">View Cart</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">My Orders</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" size="sm" className="w-full bg-transparent">
                  <Link href="/account">View Orders</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pricing Info</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" size="sm" className="w-full bg-transparent">
                  <Link href="/pricing">Learn More</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with Clear Choice Pharmacy</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Button asChild className="h-auto py-4">
                  <Link href="/" className="flex flex-col items-start gap-2">
                    <span className="font-semibold">Search Medications</span>
                    <span className="text-sm font-normal opacity-90">Find and compare medication prices</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto py-4 bg-transparent">
                  <Link href="/pricing" className="flex flex-col items-start gap-2">
                    <span className="font-semibold">How Pricing Works</span>
                    <span className="text-sm font-normal">Transparent, affordable pricing</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
