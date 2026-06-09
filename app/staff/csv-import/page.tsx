"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react"
import { StaffNav } from "@/components/staff-nav"

// Direct database import using fetch to a simple endpoint
export default function CSVImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{ success: boolean; message: string; inserted?: number; updated?: number; errors?: number } | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = useCallback((f: File) => {
    if (f.name.endsWith(".csv") || f.name.endsWith(".xlsx") || f.name.endsWith(".xls")) {
      setFile(f)
      setResult(null)
    } else {
      setResult({ success: false, message: "Please upload a CSV or Excel file" })
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [handleFile])

  const handleImport = async () => {
    if (!file) return
    
    setImporting(true)
    setProgress(10)
    setResult(null)

    try {
      // Read file as text
      const text = await file.text()
      setProgress(20)
      
      // Parse CSV
      const lines = text.split("\n").filter(line => line.trim())
      const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, "").toLowerCase())
      
      // Find column indices - handle NADAC format
      const nameIdx = headers.findIndex(h => 
        h.includes("ndc description") || h.includes("drug name") || h.includes("name") || h.includes("description")
      )
      const ndcIdx = headers.findIndex(h => h === "ndc" || h.includes("ndc"))
      const priceIdx = headers.findIndex(h => 
        h.includes("nadac_per_unit") || h.includes("unit price") || h.includes("price") || h.includes("cost")
      )
      const unitIdx = headers.findIndex(h => 
        h.includes("pricing unit") || h.includes("unit") || h.includes("form")
      )

      if (nameIdx === -1) {
        setResult({ success: false, message: "Could not find drug name column. Expected: NDC Description, Drug Name, or Name" })
        setImporting(false)
        return
      }

      setProgress(30)

      // Parse rows into medications
      const medications: Array<{
        name: string
        ndc: string | null
        per_unit_cost: number | null
        dosage_form: string | null
      }> = []

      for (let i = 1; i < lines.length; i++) {
        // Handle CSV with quoted fields
        const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
        if (!row) continue

        const cleanField = (idx: number) => {
          if (idx === -1 || !row[idx]) return null
          return row[idx].replace(/"/g, "").trim() || null
        }

        const name = cleanField(nameIdx)
        if (!name) continue

        const ndc = cleanField(ndcIdx)
        const priceStr = cleanField(priceIdx)
        const price = priceStr ? parseFloat(priceStr) : null
        const unit = cleanField(unitIdx)

        medications.push({
          name,
          ndc,
          per_unit_cost: price && !isNaN(price) ? price : null,
          dosage_form: unit
        })
      }

      setProgress(50)

      if (medications.length === 0) {
        setResult({ success: false, message: "No valid medications found in file" })
        setImporting(false)
        return
      }

      // Send to simple import API
      const response = await fetch("/api/simple-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medications })
      })

      setProgress(90)

      const data = await response.json()
      
      if (response.ok) {
        setResult({
          success: true,
          message: `Successfully imported ${data.inserted || 0} medications`,
          inserted: data.inserted,
          updated: data.updated,
          errors: data.errors
        })
      } else {
        setResult({ success: false, message: data.error || "Import failed" })
      }
    } catch (err) {
      setResult({ success: false, message: `Error: ${(err as Error).message}` })
    } finally {
      setImporting(false)
      setProgress(100)
    }
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <StaffNav />
      <main className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Import Medications (CSV)</h1>
          <p className="text-muted-foreground mb-8">Upload your NADAC or medication CSV file</p>

          <Card>
            <CardHeader>
              <CardTitle>Upload File</CardTitle>
              <CardDescription>
                Supports NADAC format with columns: NDC Description, NDC, NADAC_Per_Unit, Pricing Unit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                }`}
              >
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg mb-2">Drag and drop your CSV file here</p>
                <p className="text-sm text-muted-foreground mb-4">or</p>
                <label>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    className="hidden"
                  />
                  <Button variant="outline" asChild>
                    <span>Browse Files</span>
                  </Button>
                </label>
              </div>

              {/* Selected file */}
              {file && (
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <FileSpreadsheet className="h-8 w-8 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button onClick={handleImport} disabled={importing}>
                    {importing ? "Importing..." : "Import"}
                  </Button>
                </div>
              )}

              {/* Progress */}
              {importing && (
                <div className="space-y-2">
                  <Progress value={progress} />
                  <p className="text-sm text-muted-foreground text-center">
                    Processing... {progress}%
                  </p>
                </div>
              )}

              {/* Result */}
              {result && (
                <div className={`flex items-start gap-3 p-4 rounded-lg ${
                  result.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                }`}>
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">{result.success ? "Success!" : "Error"}</p>
                    <p className="text-sm">{result.message}</p>
                    {result.updated !== undefined && result.updated > 0 && (
                      <p className="text-sm">Updated: {result.updated}</p>
                    )}
                    {result.errors !== undefined && result.errors > 0 && (
                      <p className="text-sm">Errors: {result.errors}</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
