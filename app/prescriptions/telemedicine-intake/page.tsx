"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { EdTabletTelemedicineIntakeForm } from "@/components/ed-tablet-telemedicine-intake-form"
import { RxTelemedicineIntakeForm } from "@/components/rx-telemedicine-intake-form"
import {
  collectDrugClassesFromCart,
  orderItemsToCartLike,
  type TelemedicineIntakeType,
} from "@/lib/prescription-telemedicine"
import type { CartItem } from "@/lib/cart"

type OrderResponse = {
  order?: {
    id: string
    prescription_method?: string | null
    items?: { drug_name: string; quantity: number; price?: number }[]
  }
  error?: string
}

function TelemedicineIntakeContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId") || ""
  const typeParam = (searchParams.get("type") || "general") as TelemedicineIntakeType
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [orderItems, setOrderItems] = useState<CartItem[]>([])

  useEffect(() => {
    if (!orderId) {
      setError("Missing order ID.")
      setLoading(false)
      return
    }

    fetch(`/api/patient-orders/${orderId}`)
      .then((r) => r.json())
      .then((data: OrderResponse) => {
        if (!data.order) {
          setError(data.error || "Order not found")
          return
        }
        if (data.order.prescription_method !== "telemedicine") {
          setError("This order does not require a telemedicine intake.")
          return
        }
        const items = orderItemsToCartLike(data.order.items || [])
        if (items.length === 0) {
          setError("No medications found on this order.")
          return
        }
        setOrderItems(items)
      })
      .catch(() => setError("Unable to load your order."))
      .finally(() => setLoading(false))
  }, [orderId])

  const intakeType: TelemedicineIntakeType =
    typeParam === "ed_tablet" ? "ed_tablet" : "general"

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 py-10 md:py-14 bg-muted/30">
        <div className="container max-w-3xl mx-auto px-4">
          <Button asChild variant="ghost" className="mb-6">
            <Link href="/prescriptions">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to prescriptions
            </Link>
          </Button>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading your order...
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
              <p className="text-destructive font-medium mb-4">{error}</p>
              <Button asChild variant="outline">
                <Link href="/prescriptions">Return to prescriptions</Link>
              </Button>
            </div>
          ) : intakeType === "ed_tablet" ? (
            <EdTabletTelemedicineIntakeForm orderId={orderId} orderItems={orderItems} />
          ) : (
            <RxTelemedicineIntakeForm
              orderId={orderId}
              orderItems={orderItems}
              drugClasses={collectDrugClassesFromCart(orderItems)}
            />
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

export default function PrescriptionTelemedicineIntakePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <TelemedicineIntakeContent />
    </Suspense>
  )
}
