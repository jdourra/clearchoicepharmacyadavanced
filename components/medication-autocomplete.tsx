"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Search, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  fetchMedicationSuggestions,
  findTopMedicationMatch,
  MIN_SEARCH_LENGTH,
  type MedicationSearchResult,
} from "@/lib/pharmacy-medication"

export function MedicationAutocomplete({
  placeholder,
  onSelect,
  fallbackSearchHref = "/medications",
  submitLabel = "Search",
}: {
  placeholder?: string
  /** When set, selecting a medication calls this instead of navigating away. */
  onSelect?: (med: MedicationSearchResult) => void
  /** Used when no exact match is found on submit (navigate mode only). */
  fallbackSearchHref?: string
  submitLabel?: string
}) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<MedicationSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const router = useRouter()
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const loadSuggestions = async () => {
      if (query.trim().length < MIN_SEARCH_LENGTH) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      setIsLoading(true)
      setShowSuggestions(true)

      try {
        const results = await fetchMedicationSuggestions(query)
        setSuggestions(results)
      } catch {
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounce = setTimeout(loadSuggestions, 200)
    return () => clearTimeout(debounce)
  }, [query])

  const handleMedicationPick = (med: MedicationSearchResult) => {
    setQuery("")
    setSuggestions([])
    setShowSuggestions(false)
    if (onSelect) {
      onSelect(med)
      return
    }
    router.push(`/medications/${med.id}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmed = query.trim()
    if (trimmed.length < MIN_SEARCH_LENGTH) return

    setShowSuggestions(false)

    if (suggestions.length > 0) {
      handleMedicationPick(suggestions[0])
      return
    }

    setIsLoading(true)
    try {
      const match = await findTopMedicationMatch(trimmed)
      if (match) {
        handleMedicationPick(match)
      } else if (!onSelect) {
        router.push(fallbackSearchHref)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder || "Search for your medication (e.g., Lisinopril, Metformin)"}
          className="h-14 text-lg pl-12 pr-32 rounded-xl border-2 border-border focus:border-primary"
          autoComplete="off"
          onFocus={() => {
            if (query.trim().length >= MIN_SEARCH_LENGTH) setShowSuggestions(true)
          }}
        />
        {isLoading && (
          <Loader2 className="absolute right-36 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
        )}
        <Button type="submit" size="lg" className="absolute right-2 top-2 h-10">
          {submitLabel}
        </Button>
      </form>

      {showSuggestions && query.trim().length >= MIN_SEARCH_LENGTH && suggestions.length > 0 && (
        <Card className="absolute z-50 w-full mt-2 max-h-96 overflow-y-auto shadow-xl border-2">
          <div className="divide-y">
            {suggestions.map((med, index) => (
              <button
                key={med.id}
                type="button"
                onClick={() => handleMedicationPick(med)}
                className="w-full text-left p-4 hover:bg-primary/10 transition-colors focus:outline-none focus:bg-primary/10 first:rounded-t-lg last:rounded-b-lg"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="font-semibold text-base">{med.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Multiple strengths available
                      {med.is_generic && " • Generic"}
                    </div>
                  </div>
                  {index === 0 && (
                    <Badge variant="secondary" className="text-xs shrink-0">
                      Top match
                    </Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {showSuggestions && query.trim().length >= MIN_SEARCH_LENGTH && suggestions.length === 0 && !isLoading && (
        <Card className="absolute z-50 w-full mt-2 p-4 shadow-lg">
          <p className="text-sm text-muted-foreground">No medications found starting with "{query}"</p>
          <p className="text-xs text-muted-foreground mt-1">Press Search to browse the catalog</p>
        </Card>
      )}
    </div>
  )
}

export type { MedicationSearchResult }
