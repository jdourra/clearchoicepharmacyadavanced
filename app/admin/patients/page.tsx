"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AdminShell } from "@/components/admin-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { formatPaymentStatus } from "@/lib/intake-payment-status"
import { formatPortalStatus } from "@/lib/patient-portal-types"
import { formatPhoneDisplay } from "@/lib/phone"
import { staffAuthFetch } from "@/lib/staff-session"
import type { WeightLossProfit } from "@/lib/glp-order-profit"

type HistoryOrder = {
  serviceType: string
  serviceLabel: string
  id: string
  treatmentLabel: string
  status: string
  paymentStatus: string | null
  createdAt: string
  patientPaid: number | null
  profit: WeightLossProfit | null
  countedInTotal: boolean
}

type PatientGroup = {
  key: string
  name: string
  email: string
  phone: string | null
  orders: HistoryOrder[]
  collectedProfit: number
}

function dollars(amount: number): string {
  return amount.toLocaleString("en-US", { style: "currency", currency: "USD" })
}

function ProfitLines({ profit }: { profit: WeightLossProfit }) {
  return (
    <p className="text-xs text-muted-foreground">
      Paid {dollars(profit.patientPaid)}
      {" · "}
      Rx Ave {dollars(profit.medicationCost)}
      {profit.kits > 1 ? ` (${profit.kits} vials at ${dollars(profit.vialCost)})` : ` (${dollars(profit.vialCost)} vial)`}
      {" · "}
      Doctor {dollars(profit.doctorFee)} ({profit.doctorFeeLabel})
      {" · "}
      <span className="font-medium text-foreground">Profit {dollars(profit.profitBeforeShipping)}</span>
      {profit.approximatedDose ? " · closest stocked vial" : ""}
      {profit.partnerPricing ? "" : " · filled before the Rx Ave list, so this cost is only a comparison"}
    </p>
  )
}

export default function AdminPatientsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q")?.trim() || ""
  const [query, setQuery] = useState(initialQuery)
  const [patients, setPatients] = useState<PatientGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = useCallback(
    (q: string) => {
      setLoading(true)
      setError("")
      const params = q.trim().length >= 2 ? `?q=${encodeURIComponent(q.trim())}` : ""
      staffAuthFetch(`/api/admin/patients${params}`)
        .then(async (res) => {
          if (res.status === 401) {
            router.push("/admin/login")
            return
          }
          const data = await res.json()
          if (!res.ok) throw new Error(data.error || "Could not search patients")
          setPatients(data.patients || [])
        })
        .catch((err: unknown) => {
          setPatients([])
          setError(err instanceof Error ? err.message : "Could not search patients")
        })
        .finally(() => setLoading(false))
    },
    [router]
  )

  useEffect(() => {
    setQuery(initialQuery)
    load(initialQuery)
  }, [initialQuery, load])

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const next = query.trim()
    router.replace(next.length >= 2 ? `/admin/patients?q=${encodeURIComponent(next)}` : "/admin/patients")
  }

  return (
    <AdminShell
      title="Patients"
      description="Search a name to see every order. Weight-loss profit is what the patient paid, minus the Rx Ave medication price and the doctor visit fee. Shipping is not on the Rx Ave sheet, so it is not subtracted."
    >
      <form onSubmit={submit} className="mb-6 flex max-w-xl gap-2">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by patient name or email"
          aria-label="Search by patient name or email"
        />
        <Button type="submit">Search</Button>
      </form>

      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading patients…</p>
      ) : patients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {initialQuery.length >= 2
              ? `No orders found for “${initialQuery}”.`
              : "No weight-loss orders yet."}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {!initialQuery ? (
            <p className="text-sm text-muted-foreground">Recent weight-loss orders. Search a name to include every service.</p>
          ) : null}
          {patients.map((patient) => (
            <Card key={patient.key}>
              <CardContent className="space-y-3 py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <p className="font-medium">{patient.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {patient.email}
                      {patient.phone ? ` · ${formatPhoneDisplay(patient.phone)}` : ""}
                      {` · ${patient.orders.length} order${patient.orders.length === 1 ? "" : "s"}`}
                    </p>
                  </div>
                  <p className="text-sm font-medium">Collected profit {dollars(patient.collectedProfit)}</p>
                </div>
                <div className="space-y-2">
                  {patient.orders.map((order) => (
                    <div key={`${order.serviceType}-${order.id}`} className="rounded-md border px-3 py-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm">
                          <span className="font-medium">{order.treatmentLabel}</span>
                          <span className="text-muted-foreground"> · {order.serviceLabel}</span>
                          <span className="text-muted-foreground">
                            {" · "}
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                          {order.patientPaid != null && !order.profit ? (
                            <span className="text-muted-foreground"> · {dollars(order.patientPaid)}</span>
                          ) : null}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline">{formatPortalStatus(order.status)}</Badge>
                          <Badge variant="secondary">{formatPaymentStatus(order.paymentStatus)}</Badge>
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/admin/intakes/${order.serviceType}/${order.id}`}>Open</Link>
                          </Button>
                        </div>
                      </div>
                      {order.profit ? <ProfitLines profit={order.profit} /> : null}
                      {order.profit && !order.countedInTotal ? (
                        <p className="text-xs text-muted-foreground">Not included in collected profit until this order is paid and still open.</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminShell>
  )
}
