"use client"

import type React from "react"
import useSWR from "swr"
import { SiteHeader } from "@/components/site-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Search, ChevronLeft, ChevronRight, Pill, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"

interface Medication {
  id: number
  name: string
  generic_name: string | null
  brand_name: string | null
  strength: string
  dosage_form: string
  ndc: string | null
  acquisition_cost: number | null
  our_price: number | null
  typical_retail_price: number | null
  per_unit_cost: number | null
  package_quantity: number | null
  is_generic: boolean
  days_supply: number | null
  category: string | null
  status: string
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

interface MedicationsResponse {
  medications: Medication[]
  pagination: PaginationInfo
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const ITEMS_PER_PAGE = 48

const UNIT_BASED_FORMS = [
  "INHALER", "SOLUTION", "CREAM", "OINTMENT", "LOTION", "GEL",
  "SPRAY", "SYRINGE", "DROPS", "SUSPENSION", "PATCH", "VIAL", "PEN", "NEBULIZER",
]

function isUnitBasedForm(form: string) {
  return UNIT_BASED_FORMS.includes(form.toUpperCase())
}

function calculatePrice(med: Medication): {
  price: string
  retailPrice: string
  savings: string
  savingsPercent: number
  supplyLabel: string
} {
  // Normalize numeric fields because Postgres often returns them as strings
  const ourPriceNum = med.our_price != null ? Number(med.our_price) : 0
  const typicalRetailNum = med.typical_retail_price != null ? Number(med.typical_retail_price) : undefined
  const perUnitCostNum = med.per_unit_cost != null ? Number(med.per_unit_cost) : undefined
  const acquisitionCostNum = med.acquisition_cost != null ? Number(med.acquisition_cost) : undefined
  const packageQtyNum = med.package_quantity != null ? Number(med.package_quantity) : 1
  const daysSupplyNum = med.days_supply != null ? Number(med.days_supply) : 30

  // Use precomputed our_price / typical_retail_price when available
  if (ourPriceNum > 0) {
    const price = ourPriceNum.toFixed(2)
    const retailBase = typicalRetailNum && typicalRetailNum > 0 ? typicalRetailNum : ourPriceNum * 3.5
    const retailPrice = retailBase.toFixed(2)
    const savingsNum = retailBase - ourPriceNum
    const savings = savingsNum.toFixed(2)
    const savingsPercent = retailBase > 0 ? Math.round((savingsNum / retailBase) * 100) : 0
    const isUnit = isUnitBasedForm(med.dosage_form || "")
    const supplyLabel = isUnit
      ? `per ${(med.dosage_form || "unit").toLowerCase()}`
      : `${daysSupplyNum}-day supply`
    return { price, retailPrice, savings, savingsPercent, supplyLabel }
  }

  // Fallback: compute price from per-unit cost or acquisition_cost
  const perUnit =
    perUnitCostNum ??
    (acquisitionCostNum ? acquisitionCostNum / packageQtyNum : 0.5)

  const isUnit = isUnitBasedForm(med.dosage_form || "")
  const qty = isUnit ? 1 : daysSupplyNum
  const priceNum = perUnit * qty * 1.15 + 5
  const price = priceNum.toFixed(2)

  const retailBase = typicalRetailNum && typicalRetailNum > 0 ? typicalRetailNum : priceNum * 3.5
  const retailPrice = retailBase.toFixed(2)
  const savingsNum = retailBase - priceNum
  const savings = savingsNum.toFixed(2)
  const savingsPercent = retailBase > 0 ? Math.round((savingsNum / retailBase) * 100) : 0
  const supplyLabel = isUnit
    ? `per ${(med.dosage_form || "unit").toLowerCase()}`
    : `${daysSupplyNum}-day supply`

  return { price, retailPrice, savings, savingsPercent, supplyLabel }
}

export default function MedicationsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get("q") || ""
  const currentPage = parseInt(searchParams.get("page") || "1", 10)
  const [searchTerm, setSearchTerm] = useState(query)

  const apiUrl = `/api/drugs?page=${currentPage}&limit=${ITEMS_PER_PAGE}${query ? `&q=${encodeURIComponent(query)}` : ""}`

  const { data, error, isLoading } = useSWR<MedicationsResponse>(apiUrl, fetcher, {
    keepPreviousData: true,
  })

  const medications = data?.medications || []
  const pagination = data?.pagination || { page: 1, limit: ITEMS_PER_PAGE, total: 0, totalPages: 0, hasNext: false, hasPrev: false }

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (searchTerm.trim()) {
        router.push(`/medications?q=${encodeURIComponent(searchTerm.trim())}`)
      } else {
        router.push("/medications")
      }
    },
    [searchTerm, router]
  )

  const goToPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams()
      if (query) params.set("q", query)
      params.set("page", String(page))
      router.push(`/medications?${params.toString()}`)
    },
    [query, router]
  )

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 py-8 md:py-12">
        <div className="container max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            {query ? (
              <>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 text-balance">
                  {'Search Results for "'}{query}{'"'}
                </h1>
                <p className="text-muted-foreground text-lg">
                  Found {pagination.total} matching medication{pagination.total !== 1 ? "s" : ""}
                </p>
              </>
            ) : (
              <>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">All Medications</h1>
                <p className="text-muted-foreground text-lg">
                  Browse our complete medication catalog with transparent pricing ({pagination.total} medications)
                </p>
              </>
            )}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-2 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search medications by name, NDC, or generic name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
              {query && (
                <Button type="button" variant="outline" onClick={() => { setSearchTerm(""); router.push("/medications") }}>
                  Clear
                </Button>
              )}
            </div>
          </form>

          {/* Loading State */}
          {isLoading && !data ? (
            <div className="text-center py-16">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-lg text-muted-foreground">Loading medications...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-lg font-semibold mb-2 text-destructive">Failed to load medications</p>
              <p className="text-muted-foreground mb-6">
                Please try refreshing the page or check back later.
              </p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          ) : medications.length > 0 ? (
            <>
              {/* Medication Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {medications.map((med) => {
                  const { price, retailPrice, savings, savingsPercent, supplyLabel } = calculatePrice(med)

                  return (
                    <Link key={med.id} href={`/medications/${med.id}`}>
                      <Card className="p-5 hover:border-primary hover:shadow-lg transition-all cursor-pointer h-full">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-lg leading-tight line-clamp-2">{med.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {med.strength} {med.dosage_form}
                            </p>
                            <div className="flex gap-1 mt-1">
                              {med.is_generic && (
                                <Badge variant="secondary" className="text-xs">
                                  Generic
                                </Badge>
                              )}
                              {med.category && (
                                <Badge variant="outline" className="text-xs">
                                  {med.category}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-3xl font-bold text-primary">${price}</div>
                            <p className="text-xs text-muted-foreground">{supplyLabel}</p>
                          </div>
                          <div className="pt-2 border-t">
                            <p className="text-xs text-muted-foreground line-through">Retail: ${retailPrice}</p>
                            <p className="text-sm font-semibold" style={{ color: "var(--savings-green, #16a34a)" }}>
                              Save ${savings} ({savingsPercent}%)
                            </p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  )
                })}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {(pagination.page - 1) * pagination.limit + 1}
                    {" - "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                    {" of "}
                    {pagination.total} medications
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!pagination.hasPrev}
                      onClick={() => goToPage(pagination.page - 1)}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNum: number
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1
                        } else if (pagination.page >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i
                        } else {
                          pageNum = pagination.page - 2 + i
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === pagination.page ? "default" : "outline"}
                            size="sm"
                            className="w-9"
                            onClick={() => goToPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!pagination.hasNext}
                      onClick={() => goToPage(pagination.page + 1)}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <Pill className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              {query ? (
                <>
                  <p className="text-lg font-semibold mb-2">{'No medications found for "'}{query}{'"'}</p>
                  <p className="text-muted-foreground mb-6">
                    Try searching for a different medication or browse all available options
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={() => { setSearchTerm(""); router.push("/medications") }}>
                      View All Medications
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/">Back to Home</Link>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-lg font-semibold mb-2">No medications available yet</p>
                  <p className="text-muted-foreground mb-6">
                    Medications will appear here once they are added to the system.
                  </p>
                  <Button asChild variant="outline">
                    <Link href="/">Back to Home</Link>
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
