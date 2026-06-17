"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { toast } from "react-hot-toast"
import {
  ArrowRight,
  Bookmark,
  Loader2,
  Pill,
  Plus,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { MedicationAutocomplete, type MedicationSearchResult } from "@/components/medication-autocomplete"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { buildCartItem } from "@/lib/cart"
import {
  clearSavedQuote,
  loadSavedQuote,
  quoteTotal,
  saveQuote,
  type QuoteLine,
} from "@/lib/medication-quote"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type MedicationRecord = {
  id: string
  name: string
  strength: string
  dosage_form: string
  is_generic?: boolean
  per_unit_cost?: number | string | null
  acquisition_cost?: number | string | null
  package_quantity?: number | null
  days_supply?: number | null
  ndc?: string | null
}

function newLineId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function MedicationQuoteBuilder() {
  const router = useRouter()
  const [lines, setLines] = useState<QuoteLine[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [pendingMed, setPendingMed] = useState<MedicationSearchResult | null>(null)
  const [selectedStrengthId, setSelectedStrengthId] = useState("")
  const [quantity, setQuantity] = useState(30)
  const [priceData, setPriceData] = useState<{
    price: number
    breakdown?: { acquisitionCostPerUnit?: number }
    isUnitBased?: boolean
  } | null>(null)
  const [loadingPrice, setLoadingPrice] = useState(false)
  const [adding, setAdding] = useState(false)

  const { data: medication } = useSWR<MedicationRecord>(
    pendingMed ? `/api/medications/${pendingMed.id}` : null,
    fetcher
  )

  const { data: relatedData, isLoading: loadingStrengths } = useSWR(
    medication?.name ? `/api/drugs?q=${encodeURIComponent(medication.name)}&limit=20` : null,
    fetcher
  )

  const strengthOptions = useMemo(() => {
    if (!medication) return []
    const related = (relatedData?.medications || []).filter(
      (m: MedicationRecord) => m.name === medication.name
    )
    const byId = new Map<string, MedicationRecord>()
    ;[medication, ...related].forEach((m) => byId.set(String(m.id), m))
    return Array.from(byId.values())
  }, [medication, relatedData?.medications])

  const selectedMed = useMemo(
    () => strengthOptions.find((m) => String(m.id) === selectedStrengthId) || medication,
    [strengthOptions, selectedStrengthId, medication]
  )

  useEffect(() => {
    setLines(loadSavedQuote())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!pendingMed || !medication?.id) return
    setSelectedStrengthId(String(medication.id))
    setQuantity(30)
    setPriceData(null)
  }, [pendingMed, medication?.id])

  useEffect(() => {
    if (!selectedMed?.id || quantity < 1) {
      setPriceData(null)
      return
    }

    const controller = new AbortController()
    setLoadingPrice(true)

    fetch("/api/prices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ medicationId: selectedMed.id, quantity }),
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setPriceData(data)
      })
      .catch((err) => {
        if (err.name !== "AbortError") setPriceData(null)
      })
      .finally(() => setLoadingPrice(false))

    return () => controller.abort()
  }, [selectedMed?.id, quantity])

  const total = quoteTotal(lines)

  const handleSelectMedication = useCallback((med: MedicationSearchResult) => {
    setPendingMed(med)
  }, [])

  const closePending = () => {
    setPendingMed(null)
    setPriceData(null)
  }

  const addLine = async () => {
    if (!selectedMed || !priceData?.price) {
      toast.error("Select strength and quantity to add this medication.")
      return
    }

    setAdding(true)
    try {
      const line: QuoteLine = {
        id: newLineId(),
        medicationId: String(selectedMed.id),
        name: selectedMed.name,
        strength: selectedMed.strength,
        dosageForm: selectedMed.dosage_form,
        quantity,
        price: priceData.price,
        perUnitCost: priceData.breakdown?.acquisitionCostPerUnit,
        isGeneric: selectedMed.is_generic,
      }
      setLines((prev) => [...prev, line])
      toast.success(`${selectedMed.name} added to your list`)
      closePending()
    } finally {
      setAdding(false)
    }
  }

  const removeLine = (id: string) => {
    setLines((prev) => prev.filter((line) => line.id !== id))
  }

  const handleSaveForLater = () => {
    saveQuote(lines)
    toast.success("Your medication list was saved on this device.")
  }

  const handleOrderNow = () => {
    if (lines.length === 0) {
      toast.error("Add at least one medication to continue.")
      return
    }

    const existingCart = sessionStorage.getItem("cart")
    const cart = existingCart ? JSON.parse(existingCart) : []

    for (const line of lines) {
      const cartItem = buildCartItem({
        medication: {
          id: line.medicationId,
          name: line.name,
          strength: line.strength,
          dosage_form: line.dosageForm,
          is_generic: line.isGeneric,
          per_unit_cost: line.perUnitCost,
        },
        quantity: line.quantity,
        price: line.price,
        perUnitCost: line.perUnitCost,
      })
      cart.push(cartItem)
    }

    sessionStorage.setItem("cart", JSON.stringify(cart))
    clearSavedQuote()
    setLines([])
    router.push("/cart")
    toast.success("Medications added to cart!")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 py-8 md:py-12">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-balance">
              See how much your medications cost
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Search medications, add them to your list, and see a running total.
              Drug cost + 15% + $5 per prescription—no insurance required.
            </p>
          </div>

          <div className="mb-8">
            <MedicationAutocomplete
              placeholder="Search for a medication to add (e.g., Lisinopril, Metformin)"
              onSelect={handleSelectMedication}
              submitLabel="Add"
            />
          </div>

          {pendingMed && (
            <Card className="mb-8 p-6 border-2 border-primary/30 shadow-lg">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-xl font-semibold">{medication?.name || pendingMed.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose strength and quantity, then add to your list.
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={closePending} aria-label="Close">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {!medication ? (
                <div className="flex items-center gap-2 text-muted-foreground py-4">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading medication details...
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Strength &amp; form</Label>
                      <Select
                        value={selectedStrengthId}
                        onValueChange={setSelectedStrengthId}
                        disabled={loadingStrengths}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select strength" />
                        </SelectTrigger>
                        <SelectContent>
                          {strengthOptions.map((m) => (
                            <SelectItem key={m.id} value={String(m.id)}>
                              {m.strength} {m.dosage_form}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quote-qty">Quantity (days supply)</Label>
                      <Input
                        id="quote-qty"
                        type="number"
                        min={1}
                        max={priceData?.isUnitBased ? 1 : 90}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        disabled={priceData?.isUnitBased}
                      />
                      {priceData?.isUnitBased && (
                        <p className="text-xs text-muted-foreground">Priced per unit for this form.</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg bg-muted/50 p-5 flex flex-col justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Your price</p>
                      {loadingPrice ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Calculating...
                        </div>
                      ) : priceData?.price ? (
                        <p className="text-4xl font-bold text-primary">${priceData.price.toFixed(2)}</p>
                      ) : (
                        <p className="text-muted-foreground">—</p>
                      )}
                      {selectedMed?.is_generic && (
                        <Badge variant="secondary" className="mt-2">
                          Generic
                        </Badge>
                      )}
                    </div>
                    <Button
                      className="mt-6 w-full"
                      size="lg"
                      onClick={addLine}
                      disabled={adding || loadingPrice || !priceData?.price}
                    >
                      {adding ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      Add to my list
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}

          <Card className="p-6">
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Pill className="h-5 w-5 text-primary" />
                My medications
              </h2>
              {hydrated && lines.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => { setLines([]); clearSavedQuote() }}>
                  Clear list
                </Button>
              )}
            </div>

            {!hydrated ? (
              <div className="text-center py-10 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                Loading your list...
              </div>
            ) : lines.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Pill className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="font-medium text-foreground mb-1">No medications yet</p>
                <p className="text-sm">Search above to start building your quote.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lines.map((line) => (
                  <div
                    key={line.id}
                    className="flex items-center justify-between gap-4 rounded-lg border p-4"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{line.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {line.strength} {line.dosageForm}
                        {line.quantity > 1 ? ` · ${line.quantity}-day supply` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-lg font-bold text-primary">${line.price.toFixed(2)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLine(line.id)}
                        aria-label={`Remove ${line.name}`}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Estimated total</p>
                <p className="text-3xl font-bold">${total.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Includes 15% markup and $5 dispensing fee per line item
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleSaveForLater}
                  disabled={lines.length === 0}
                >
                  <Bookmark className="mr-2 h-4 w-4" />
                  Save for later
                </Button>
                <Button size="lg" onClick={handleOrderNow} disabled={lines.length === 0}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Order now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
