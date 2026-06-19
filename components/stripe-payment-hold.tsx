"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

type StripePaymentHoldInnerProps = {
  clientSecret: string
  paymentIntentId: string
  onAuthorized: (paymentIntentId: string) => void
  onError: (message: string) => void
}

function StripePaymentHoldInner({
  clientSecret,
  paymentIntentId,
  onAuthorized,
  onError,
}: StripePaymentHoldInnerProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [busy, setBusy] = useState(false)
  const [ready, setReady] = useState(false)

  const authorize = async () => {
    if (!stripe || !elements) return
    setBusy(true)
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
        confirmParams: {
          return_url: `${window.location.origin}/account?tab=programs`,
        },
      })

      if (error) {
        onError(error.message || "Payment authorization failed")
        return
      }

      const pi = paymentIntent
      if (pi && (pi.status === "requires_capture" || pi.status === "succeeded")) {
        onAuthorized(pi.id)
      } else {
        onAuthorized(paymentIntentId)
      }
    } catch {
      onError("Payment authorization failed. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <PaymentElement onReady={() => setReady(true)} />
      <Button type="button" className="w-full" disabled={!stripe || !ready || busy} onClick={authorize}>
        {busy ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Authorizing...
          </>
        ) : (
          "Authorize Payment Hold"
        )}
      </Button>
    </div>
  )
}

type StripePaymentHoldProps = {
  amount: number
  email: string
  serviceType: string
  onAuthorized: (paymentIntentId: string) => void
  invalid?: boolean
}

export function StripePaymentHold({ amount, email, serviceType, onAuthorized, invalid }: StripePaymentHoldProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [mode, setMode] = useState<"loading" | "stripe" | "mock" | "error">("loading")
  const [error, setError] = useState("")
  const onAuthorizedRef = useRef(onAuthorized)
  onAuthorizedRef.current = onAuthorized

  const initHold = useCallback(async () => {
    if (!email || amount < 1) return
    setMode("loading")
    setError("")
    try {
      const res = await fetch("/api/payments/create-hold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, email, serviceType }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to initialize payment")

      setPaymentIntentId(data.paymentIntentId)

      if (data.mode === "development_mock") {
        setMode("mock")
        onAuthorizedRef.current(data.paymentIntentId)
        return
      }

      setClientSecret(data.clientSecret)
      setMode("stripe")
    } catch (err) {
      setMode("error")
      setError(err instanceof Error ? err.message : "Payment setup failed")
    }
  }, [amount, email, serviceType])

  useEffect(() => {
    initHold()
  }, [initHold])

  if (mode === "loading") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
        <Loader2 className="h-4 w-4 animate-spin" /> Preparing secure payment...
      </div>
    )
  }

  if (mode === "mock") {
    return (
      <Alert>
        <AlertDescription>
          Development mode: payment hold simulated. Configure <code>STRIPE_SECRET_KEY</code> and{" "}
          <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> for production.
        </AlertDescription>
      </Alert>
    )
  }

  if (mode === "error") {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!clientSecret || !paymentIntentId || !stripePromise) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Stripe publishable key is not configured.</AlertDescription>
      </Alert>
    )
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: { theme: "stripe" },
  }

  return (
    <div
      data-field="stripePayment"
      className={invalid ? "rounded-lg ring-2 ring-destructive p-2 -m-2" : undefined}
    >
      <Elements stripe={stripePromise} options={options}>
        <StripePaymentHoldInner
          clientSecret={clientSecret}
          paymentIntentId={paymentIntentId}
          onAuthorized={onAuthorized}
          onError={setError}
        />
      </Elements>
      {error && (
        <p className="text-sm text-destructive mt-2">{error}</p>
      )}
    </div>
  )
}
