"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { Order, PatientProfileSummary } from "@/lib/auth-types"
import type { OrderPrescriptionDetails } from "@/lib/order-prescription"
import { staffAuthFetch } from "@/lib/staff-session"

export function useAdminOrder(orderId: string) {
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [patient, setPatient] = useState<PatientProfileSummary | null>(null)
  const [prescription, setPrescription] = useState<OrderPrescriptionDetails | null>(null)
  const [staffId, setStaffId] = useState<string>("admin")
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
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
      }
    } catch {
      router.push("/admin/login")
    } finally {
      setLoading(false)
    }
  }, [orderId, router])

  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    order,
    setOrder,
    patient,
    prescription,
    staffId,
    loading,
    loadData,
  }
}
