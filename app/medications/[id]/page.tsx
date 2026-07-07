"use client"

import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { ArrowLeft, ShoppingCart, AlertCircle, Loader2 } from "lucide-react"
import { useEffect, useState, useMemo, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "react-hot-toast"
import { authFetch } from "@/lib/session"
import { buildCartItem } from "@/lib/cart"
import { resolveEdTrocheProductUrl } from "@/lib/prescription-telemedicine"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function MedicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [selectedStrength, setSelectedStrength] = useState<string>("")
  const [quantity, setQuantity] = useState<number>(30)
  const [user, setUser] = useState<any>(null)
  const [priceData, setPriceData] = useState<any>(null)
  const [loadingPrice, setLoadingPrice] = useState(false)

  // Fetch medication from database API
  const { data: medication, error: medError, isLoading } = useSWR(
    id ? `/api/medications/${id}` : null,
    fetcher
  )

  // Fetch related medications by name for strength variants
  const { data: relatedData } = useSWR(
    medication?.name ? `/api/drugs?q=${encodeURIComponent(medication.name)}&limit=20` : null,
    fetcher
  )

  const relatedStrengths = useMemo(
    () =>
      (relatedData?.medications || []).filter(
        (m: { id: string; name: string }) => m.id !== medication?.id && m.name === medication?.name
      ),
    [relatedData?.medications, medication?.id, medication?.name]
  )

  const fetchPrice = useCallback(async (medId: string, qty: number, signal: AbortSignal) => {
    setLoadingPrice(true)
    try {
      const response = await fetch("/api/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicationId: medId,
          quantity: qty,
        }),
        signal,
      })

      if (!response.ok) {
        throw new Error(`Price request failed (${response.status})`)
      }

      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }

      setPriceData(data)
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Error fetching price:", error)
        toast.error("Unable to calculate price. Please try again.")
      }
    } finally {
      setLoadingPrice(false)
    }
  }, [])

  useEffect(() => {
    authFetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => setUser(null))
  }, [])

  useEffect(() => {
    if (!medication?.name) return
    const trocheUrl = resolveEdTrocheProductUrl(
      medication.name,
      medication.dosage_form,
      medication.strength
    )
    if (trocheUrl) router.replace(trocheUrl)
  }, [medication?.name, medication?.dosage_form, medication?.strength, router])

  useEffect(() => {
    if (medication?.id) {
      setSelectedStrength(String(medication.id))
      setQuantity(30)
      setPriceData(null)
    }
  }, [medication?.id])

  useEffect(() => {
    if (!medication?.id || !selectedStrength || quantity < 1) {
      setPriceData(null)
      return
    }

    const selectedMed =
      selectedStrength === String(medication.id)
        ? medication
        : relatedStrengths.find((m: { id: string }) => String(m.id) === selectedStrength) || medication

    const controller = new AbortController()
    fetchPrice(String(selectedMed.id), quantity, controller.signal)

    return () => controller.abort()
  }, [medication, selectedStrength, quantity, relatedStrengths, fetchPrice])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 py-8">
          <div className="container max-w-7xl mx-auto px-4 text-center py-16">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading medication details...</p>
          </div>
        </main>
      </div>
    )
  }

  if (medError || !medication) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 py-8">
          <div className="container max-w-7xl mx-auto px-4 text-center py-16">
            <p className="text-lg font-semibold mb-4">Medication not found</p>
            <Button asChild>
              <Link href="/medications">Browse All Medications</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const selectedMed =
    selectedStrength === String(medication.id)
      ? medication
      : relatedStrengths.find((m: any) => String(m.id) === selectedStrength) || medication

  const totalPrice = priceData?.price || 0
  const drugCost = priceData?.breakdown?.drugCost || 0
  const markup = priceData?.breakdown?.drugCost * 0.15 || 0
  const dispensingFee = 5.0
  const pricePerPill = totalPrice > 0 ? totalPrice / quantity : 0
  const priceSource = priceData?.source || "database"

  const retailPrice = totalPrice * 3.5
  const savings = retailPrice - totalPrice
  const savingsPercent = totalPrice > 0 ? Math.round((savings / retailPrice) * 100) : 0

  const canShowPrice = selectedStrength && quantity >= 1

  const addToCart = () => {
    if (!canShowPrice || !priceData || !selectedStrength) {
      toast.error("Please select strength and quantity to add to cart.")
      return
    }

    const existingCart = sessionStorage.getItem("cart")
    const cart = existingCart ? JSON.parse(existingCart) : []

    const cartItem = buildCartItem({
      medication: selectedMed,
      quantity,
      price: totalPrice,
      perUnitCost: priceData?.breakdown?.acquisitionCostPerUnit,
    })

    cart.push(cartItem)
    sessionStorage.setItem("cart", JSON.stringify(cart))
    router.push("/cart")
    toast.success("Medication added to cart successfully!")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 py-8 md:py-12">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <Button asChild variant="ghost" className="mb-6">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to search
              </Link>
            </Button>

            <div className="grid lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3 space-y-6">
                <div>
                  <div className="flex items-start gap-3 mb-3">
                    <h1 className="text-3xl md:text-4xl font-bold">{medication.name}</h1>
                    {medication.is_generic && (
                      <Badge variant="secondary" className="mt-1">
                        Generic
                      </Badge>
                    )}
                  </div>
                  {selectedStrength ? (
                    <p className="text-xl text-muted-foreground">
                      {selectedMed.strength} {selectedMed.dosage_form}
                    </p>
                  ) : (
                    <p className="text-xl text-amber-600">{"<- Please select strength and quantity"}</p>
                  )}
                  {medication.brand_name && (
                    <p className="text-sm text-muted-foreground mt-2">Brand: {medication.brand_name}</p>
                  )}
                </div>

                {selectedMed.ndc && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">NDC:</span>{" "}
                    <span className="font-mono">{selectedMed.ndc}</span>
                  </div>
                )}

                {medication.description && (
                  <Card className="p-5">
                    <h3 className="font-semibold mb-2">About this medication</h3>
                    <p className="text-muted-foreground">{medication.description}</p>
                  </Card>
                )}

                {medication.category && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Category:</span>{" "}
                    <Badge variant="outline">{medication.category}</Badge>
                  </div>
                )}
              </div>

              <div className="lg:col-span-2">
                <Card className="p-6 sticky top-20">
                  <div className="space-y-6">
                    {!canShowPrice ? (
                      <div className="text-center py-8 space-y-3">
                        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
                        <div>
                          <p className="font-semibold text-lg mb-1">Select options to see price</p>
                          <p className="text-sm text-muted-foreground">Choose strength and quantity below</p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-5xl font-bold text-primary mb-1">
                          {loadingPrice ? (
                            <span className="text-3xl text-muted-foreground">Calculating...</span>
                          ) : (
                            `$${totalPrice.toFixed(2)}`
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ${pricePerPill.toFixed(2)} per pill
                          {priceSource === "live" && (
                            <span className="ml-2 text-xs text-green-600 font-semibold">Live Price</span>
                          )}
                        </p>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="strength" className="text-sm font-medium mb-2 block">
                        Select Strength: <span className="text-red-500">*</span>
                      </Label>
                      {relatedStrengths.length > 0 ? (
                        <Select value={selectedStrength} onValueChange={setSelectedStrength}>
                          <SelectTrigger id="strength">
                            <SelectValue placeholder="Choose a strength" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={String(medication.id)}>{medication.strength}</SelectItem>
                            {relatedStrengths.map((med: any) => (
                              <SelectItem key={med.id} value={String(med.id)}>
                                {med.strength}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Button
                          variant={selectedStrength === String(medication.id) ? "default" : "outline"}
                          className="w-full"
                          onClick={() => setSelectedStrength(String(medication.id))}
                        >
                          {medication.strength}
                        </Button>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="quantity" className="text-sm font-medium mb-2 block">
                        Quantity (tablets): <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        max="999"
                        step="1"
                        value={quantity}
                        onChange={(e) => {
                          const val = Number.parseInt(e.target.value, 10)
                          if (!Number.isNaN(val) && val >= 1 && val <= 999) {
                            setQuantity(val)
                          }
                        }}
                        className="text-lg"
                      />
                      <div className="flex flex-wrap gap-2 mt-2">
                        {[30, 60, 90, 120].map((q) => (
                          <Button
                            key={q}
                            variant="outline"
                            size="sm"
                            onClick={() => setQuantity(q)}
                            className={quantity === q ? "border-primary bg-primary/5" : ""}
                          >
                            {q}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {canShowPrice && priceData && (
                      <>
                        <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                          <div className="font-semibold mb-3">Price Breakdown:</div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Drug Cost ({quantity} tablets):
                            </span>
                            <span className="font-medium">${drugCost.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">15% Markup:</span>
                            <span className="font-medium">${markup.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Dispensing Fee:</span>
                            <span className="font-medium">${dispensingFee.toFixed(2)}</span>
                          </div>
                          <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                            <span>Your Total:</span>
                            <span className="text-primary">${totalPrice.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="bg-accent/10 rounded-lg p-4">
                          <div className="text-sm text-muted-foreground mb-1">Typical Retail:</div>
                          <div className="text-lg line-through">${retailPrice.toFixed(2)}</div>
                          <div className="text-xl font-bold mt-1" style={{ color: "var(--savings-green, #16a34a)" }}>
                            YOU SAVE ${savings.toFixed(2)} ({savingsPercent}%)
                          </div>
                        </div>
                      </>
                    )}

                    {user ? (
                      <Button size="lg" className="w-full" onClick={addToCart} disabled={!canShowPrice || loadingPrice}>
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        {canShowPrice ? "Add to Cart" : "Select Options First"}
                      </Button>
                    ) : (
                      <Button asChild size="lg" className="w-full">
                        <Link href="/auth/sign-up">Sign Up to Order</Link>
                      </Button>
                    )}

                    <div className="text-xs text-muted-foreground border-t pt-4">
                      <p className="font-semibold mb-1">Cash-pay price from Prescription Supply</p>
                      <p>No insurance, no PBM fees, no hidden costs.</p>
                      {priceSource === "live" && (
                        <p className="mt-2 text-green-600">Real-time pricing updated from supplier</p>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
