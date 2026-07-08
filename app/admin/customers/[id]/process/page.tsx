"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import type { Order, PatientProfileSummary, User } from "@/lib/auth-types"
import type { OrderPrescriptionDetails } from "@/lib/order-prescription"
import { staffAuthFetch } from "@/lib/staff-session"
import { AdminHeader } from "@/components/admin-header"
import { AdminOrderMedicationPicker } from "@/components/admin-order-medication-picker"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

type BatchOrderEntry = {
  order: Order
  prescription: OrderPrescriptionDetails
}

export default function AdminCustomerBatchProcessPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const customerId = params.id as string
  const orderIdsParam = searchParams.get("orders") || ""

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<PatientProfileSummary | null>(null)
  const [entries, setEntries] = useState<BatchOrderEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadData = useCallback(async () => {
    if (!orderIdsParam) {
      setError("No orders selected")
      setLoading(false)
      return
    }

    setLoading(true)
    setError("")
    try {
      const meRes = await staffAuthFetch("/api/admin/me")
      if (!meRes.ok) {
        router.push("/admin/login")
        return
      }

      const res = await staffAuthFetch(
        `/api/admin/customers/${customerId}/process?orders=${encodeURIComponent(orderIdsParam)}`
      )
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to load orders")
        return
      }
      setUser(data.user || null)
      setProfile(data.profile || null)
      setEntries(data.orders || [])
    } catch {
      router.push("/admin/login")
    } finally {
      setLoading(false)
    }
  }, [customerId, orderIdsParam, router])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading batch process...</p>
      </div>
    )
  }

  if (error || !user || entries.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/30">
        <AdminHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">{error || "No orders to process"}</p>
            <Button asChild>
              <Link href={`/admin/customers/${customerId}`}>Back to customer</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <AdminHeader />

      <main className="flex-1 py-8">
        <div className="container">
          <Link
            href={`/admin/customers/${customerId}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to {user.name}
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold">Process Orders</h1>
            <p className="text-muted-foreground mt-1">
              Select a medication below to open the process screen for {user.name}
            </p>
          </div>

          <AdminOrderMedicationPicker
            customerId={customerId}
            user={user}
            patient={profile}
            entries={entries}
          />
        </div>
      </main>
    </div>
  )
}
