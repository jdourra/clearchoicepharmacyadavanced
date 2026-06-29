"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { CreditCard, Loader2, Phone, CheckCircle2, ArrowLeft } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { authFetch } from "@/lib/session"
import type { Order } from "@/lib/auth-types"
import { buildMedicationCostSummary, resolveOrderTotal } from "@/lib/order-patient-message"
import { isOrderPaid } from "@/lib/order-payment"
import toast from "react-hot-toast"

export function OrderPaymentChoice({ orderId }: { orderId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [choosingPhone, setChoosingPhone] = useState(false)
  const [phoneConfirmed, setPhoneConfirmed] = useState(false)

  const success = searchParams.get("success") === "1"
  const canceled = searchParams.get("canceled") === "1"
  const sessionId = searchParams.get("session_id")

  useEffect(() => {
    async function load() {
      try {
        const verifyUrl = sessionId
          ? `/api/orders/${orderId}/payment/verify?session_id=${encodeURIComponent(sessionId)}`
          : `/api/orders/${orderId}/payment/verify`

        const res = await authFetch(verifyUrl)
        if (res.status === 401) {
          router.push(`/auth/login?redirect=/account/orders/${orderId}/pay`)
          return
        }
        const data = await res.json()
        if (!res.ok || !data.order) {
          toast.error(data.error || "Order not found")
          router.push("/account?tab=orders")
          return
        }
        setOrder(data.order)
        if (data.order.payment_preference === "pay_by_phone") {
          setPhoneConfirmed(true)
        }
      } catch {
        toast.error("Failed to load order")
        router.push("/account?tab=orders")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [orderId, router, sessionId])

  const handlePayNow = async () => {
    setPaying(true)
    try {
      await authFetch(`/api/orders/${orderId}/payment-preference`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preference: "pay_now" }),
      })

      const res = await authFetch(`/api/orders/${orderId}/checkout`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Checkout failed")

      if (data.url) {
        window.location.href = data.url
        return
      }
      throw new Error("No checkout URL returned")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Payment failed")
      setPaying(false)
    }
  }

  const handlePayByPhone = async () => {
    setChoosingPhone(true)
    try {
      const res = await authFetch(`/api/orders/${orderId}/payment-preference`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preference: "pay_by_phone" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to save preference")
      setPhoneConfirmed(true)
      setOrder((prev) =>
        prev ? { ...prev, payment_preference: "pay_by_phone", payment_method: "phone" } : prev
      )
      toast.success("We'll call you to collect payment.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setChoosingPhone(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    )
  }

  if (!order) return null

  const paid = isOrderPaid(order)
  const total = resolveOrderTotal(order)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 py-8 md:py-12 bg-muted/30">
        <div className="container max-w-2xl mx-auto px-4">
          <Button asChild variant="ghost" className="mb-4 -ml-2">
            <Link href="/account?tab=orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to orders
            </Link>
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>Pay for Order #{order.order_number}</CardTitle>
                  <CardDescription className="mt-1">
                    Choose how you&apos;d like to pay for your prescription.
                  </CardDescription>
                </div>
                <Badge variant={paid ? "default" : "secondary"}>
                  {paid ? "Paid" : "Payment due"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg bg-muted p-4 text-sm whitespace-pre-wrap">
                {buildMedicationCostSummary(order)}
              </div>

              {success && paid && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Payment received — thank you! We&apos;ll process your order right away.
                  </AlertDescription>
                </Alert>
              )}

              {canceled && !paid && (
                <Alert>
                  <AlertDescription>
                    Checkout was canceled. You can try again or choose to pay by phone.
                  </AlertDescription>
                </Alert>
              )}

              {paid ? (
                <div className="text-center space-y-3">
                  <p className="text-muted-foreground">
                    Your payment of {`$${total.toFixed(2)}`} has been received.
                  </p>
                  <Button asChild>
                    <Link href="/account?tab=orders">View all orders</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card className="border-primary/30">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-center gap-2 font-semibold text-primary">
                        <CreditCard className="h-5 w-5" />
                        Pay now
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Secure card payment via Stripe. Fastest way to get your prescription processed.
                      </p>
                      <Button className="w-full" onClick={handlePayNow} disabled={paying || choosingPhone}>
                        {paying ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Redirecting...
                          </>
                        ) : (
                          `Pay $${total.toFixed(2)} now`
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-center gap-2 font-semibold">
                        <Phone className="h-5 w-5" />
                        Pay by phone
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Our pharmacy will call you at the number on your account to collect payment.
                      </p>
                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={handlePayByPhone}
                        disabled={paying || choosingPhone || phoneConfirmed}
                      >
                        {choosingPhone ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : phoneConfirmed ? (
                          "We'll call you"
                        ) : (
                          "Wait for pharmacy to call"
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
