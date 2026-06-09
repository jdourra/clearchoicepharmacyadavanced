"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Search, Plus } from "lucide-react"

interface RxNavResult {
  rxcui: string
  name: string
  score: number
  ndc: string | null
  ndcCodes: string[]
}

export function RxNavMedicationImport() {
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<RxNavResult[]>([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/rxnav/search?query=${encodeURIComponent(searchTerm)}`)
      const data = await response.json()

      if (data.error) {
        setMessage({ type: "error", text: data.error })
      } else {
        setResults(data.results || [])
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to search RxNav database" })
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async (result: RxNavResult) => {
    setImporting(result.rxcui)
    setMessage(null)

    try {
      // Import medication into database with $1 per 30 tablets pricing
      const response = await fetch("/api/drugs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: result.name,
          generic_name: result.name,
          ndc: result.ndc,
          acquisition_cost: 0.0333, // $1 / 30 tablets
          category: "Prescription",
          manufacturer: "Generic",
        }),
      })

      if (response.ok) {
        setMessage({ type: "success", text: `Successfully imported ${result.name}` })
        // Remove from results
        setResults(results.filter((r) => r.rxcui !== result.rxcui))
      } else {
        setMessage({ type: "error", text: "Failed to import medication" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to import medication" })
    } finally {
      setImporting(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Import from RxNav (NIH)
        </CardTitle>
        <CardDescription>
          Search and import medications from the National Library of Medicine RxNav database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search medication name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Found {results.length} medication{results.length !== 1 ? "s" : ""}
            </p>
            {results.map((result) => (
              <div key={result.rxcui} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{result.name}</p>
                  <p className="text-sm text-muted-foreground">
                    RxCUI: {result.rxcui} {result.ndc && `| NDC: ${result.ndc}`}
                  </p>
                </div>
                <Button size="sm" onClick={() => handleImport(result)} disabled={importing === result.rxcui}>
                  <Plus className="h-4 w-4 mr-1" />
                  {importing === result.rxcui ? "Importing..." : "Import"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
