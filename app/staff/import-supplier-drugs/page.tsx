"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "react-hot-toast"

export default function ImportSupplierDrugsPage() {
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResults(null)
    }
  }

  const handleImport = async () => {
    if (!file) return

    setProcessing(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/import-supplier-drugs", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setResults(data)
        toast.success(`Successfully imported ${data.imported} medications!`)
      } else {
        toast.error(data.error || "Import failed")
      }
    } catch (error) {
      console.error("Import error:", error)
      toast.error("Failed to import drugs")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Import Supplier Drugs</h1>
          <p className="text-muted-foreground">
            Upload your supplier's drug report CSV to automatically populate the database with NDC codes and acquisition
            costs
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload Drug Report</CardTitle>
            <CardDescription>CSV file should contain: DrugName, DrugNDC, RxQty, AACCost</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload */}
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <input type="file" id="file-upload" accept=".csv" onChange={handleFileChange} className="hidden" />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-medium">{file ? file.name : "Click to upload CSV file"}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {file ? `${(file.size / 1024).toFixed(2)} KB` : "Maximum file size: 50MB"}
                  </p>
                </div>
              </label>
            </div>

            {/* Import Button */}
            <Button onClick={handleImport} disabled={!file || processing} className="w-full" size="lg">
              {processing ? (
                <>Processing...</>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Import Drugs
                </>
              )}
            </Button>

            {/* Results */}
            {results && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-green-900">Import Successful</h3>
                      <div className="mt-2 space-y-1 text-sm text-green-800">
                        <p>• Total medications processed: {results.total}</p>
                        <p>• Successfully imported: {results.imported}</p>
                        <p>• Duplicates eliminated: {results.duplicates}</p>
                        <p>• Updated existing: {results.updated}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {results.errors && results.errors.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-yellow-900">Warnings</h3>
                        <div className="mt-2 space-y-1 text-sm text-yellow-800">
                          {results.errors.slice(0, 5).map((error: string, i: number) => (
                            <p key={i}>• {error}</p>
                          ))}
                          {results.errors.length > 5 && <p>• ... and {results.errors.length - 5} more</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>1. The system parses your CSV file and extracts drug information</p>
            <p>2. Duplicates are eliminated by keeping only the NDC with the lowest per-unit cost</p>
            <p>3. Drug names are parsed to extract strength, form, and base name</p>
            <p>4. Acquisition costs are calculated per unit (pill/tablet/capsule)</p>
            <p>5. Data is inserted into the database or updates existing entries if a lower price is found</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
