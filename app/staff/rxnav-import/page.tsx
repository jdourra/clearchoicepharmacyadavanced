"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { searchDrugs } from "@/lib/rxnav-api"
import { Loader2, Search, Plus, DollarSign } from "lucide-react"

export default function RxNavImportPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setMessage(null)

    try {
      const results = await searchDrugs(searchQuery)
      setSearchResults(results)

      if (results.length === 0) {
        setMessage({ type: "error", text: "No medications found" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Search failed" })
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async (drug: any) => {
    setImporting(drug.rxcui)
    setMessage(null)

    try {
      const response = await fetch("/api/rxnav/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rxcui: drug.rxcui,
          name: drug.name,
          dosageForm: drug.name.toLowerCase().includes("inhaler") ? "inhaler" : "tablet",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({
          type: "success",
          text: `Imported ${drug.name} - Price: $${data.pricing.priceFor30.toFixed(2)} for 30-day supply`,
        })
      } else {
        setMessage({ type: "error", text: data.error || "Import failed" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Import failed" })
    } finally {
      setImporting(null)
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Import Medications from RxNav</CardTitle>
          <CardDescription>
            Search and import medications from the NIH RxNav database. Pricing: $1 for tablets/capsules (30-day supply),
            $30 for inhalers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Medication</Label>
            <div className="flex gap-2">
              <Input
                id="search"
                placeholder="Enter medication name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Search
              </Button>
            </div>
          </div>

          {/* Message */}
          {message && (
            <Alert variant={message.type === "error" ? "destructive" : "default"}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Search Results ({searchResults.length})</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {searchResults.map((drug) => (
                  <div key={drug.rxcui} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{drug.name}</p>
                      <p className="text-sm text-muted-foreground">RxCUI: {drug.rxcui}</p>
                      <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                        <DollarSign className="h-3 w-3" />
                        {drug.name.toLowerCase().includes("inhaler") ? "$30" : "$1 for 30 pills"}
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleImport(drug)} disabled={importing === drug.rxcui}>
                      {importing === drug.rxcui ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      Import
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing Info */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">Testing Pricing Structure</h4>
            <ul className="text-sm space-y-1">
              <li>• Tablets/Capsules: $1 for 30-day supply ($0.0333 per pill)</li>
              <li>• Inhalers: $30 per inhaler</li>
              <li>• Final price includes 15% markup + $5 dispensing fee</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
