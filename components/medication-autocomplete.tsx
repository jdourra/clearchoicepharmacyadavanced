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
  type MedicationSearchResult,
  type PharmacyMedication,
} from "@/lib/pharmacy-medication"

export function MedicationAutocomplete({
  placeholder,
  onSelect,
}: {
  placeholder?: string
  onSelect?: (medication: MedicationSearchResult) => void
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
    const fetchSuggestions = async () => {
      if (query.length < 3) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      setIsLoading(true)

      try {
        const results = await fetchMedicationSuggestions(query)
        setSuggestions(results)
        setShowSuggestions(true)
      } catch {
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounce = setTimeout(fetchSuggestions, 200)
    return () => clearTimeout(debounce)
  }, [query])

  const handleSelect = (med: MedicationSearchResult) => {
    setQuery("")
    setSuggestions([])
    setShowSuggestions(false)

    if (onSelect) {
      onSelect(med)
    } else {
      router.push(`/medications?q=${encodeURIComponent(med.name)}`)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (suggestions.length > 0) {
      handleSelect(suggestions[0])
    } else if (query.trim().length >= 3) {
      router.push(`/medications?q=${encodeURIComponent(query.trim())}`)
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
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true)
          }}
        />
        {isLoading && (
          <Loader2 className="absolute right-36 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
        )}
        <Button type="submit" size="lg" className="absolute right-2 top-2 h-10">
          Search
        </Button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute z-50 w-full mt-2 max-h-96 overflow-y-auto shadow-xl border-2">
          <div className="divide-y">
            {suggestions.map((med, index) => (
              <button
                key={med.id}
                type="button"
                onClick={() => handleSelect(med)}
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

      {showSuggestions && query.length >= 3 && suggestions.length === 0 && !isLoading && (
        <Card className="absolute z-50 w-full mt-2 p-4 shadow-lg">
          <p className="text-sm text-muted-foreground">No medications found starting with "{query}"</p>
          <p className="text-xs text-muted-foreground mt-1">Try a different spelling or generic name</p>
        </Card>
      )}
    </div>
  )
}

export type { PharmacyMedication, MedicationSearchResult }
