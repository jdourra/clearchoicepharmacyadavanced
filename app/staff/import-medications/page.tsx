"use client"

import { useState, useRef } from "react"
import { StaffNav } from "@/components/staff-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  Info,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface ImportResult {
  success: boolean
  summary: {
    totalRowsProcessed: number
    inserted: number
    updated: number
    skipped: number
    totalMedications: number
    errors: string[]
  }
  detectedColumns: { field: string; matchedHeader: string }[]
}

export default function ImportMedicationsPage() {
  const [file, setFile] = useState<File | null>(null)
  const [mode, setMode] = useState<string>("upsert")
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ]
    const validExtensions = [".xlsx", ".xls", ".csv"]
    const ext = f.name.substring(f.name.lastIndexOf(".")).toLowerCase()

    if (!validTypes.includes(f.type) && !validExtensions.includes(ext)) {
      setError("Please upload an Excel file (.xlsx, .xls) or CSV file (.csv)")
      return
    }
    setFile(f)
    setError(null)
    setResult(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleImport = async () => {
    if (!file) return
    setImporting(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("mode", mode)

      const response = await fetch("/api/import-csv", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Import failed")
        if (data.detectedColumns) {
          setResult(data)
        }
        return
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred")
    } finally {
      setImporting(false)
    }
  }

  const expectedColumns = [
    { field: "name", required: true, desc: "Medication name (e.g., Lisinopril)" },
    { field: "strength", required: true, desc: "Dosage strength (e.g., 10mg)" },
    { field: "dosage_form", required: false, desc: "Form type (e.g., TABLET, CAPSULE). Defaults to TABLET" },
    { field: "generic_name", required: false, desc: "Generic drug name" },
    { field: "brand_name", required: false, desc: "Brand drug name" },
    { field: "ndc", required: false, desc: "National Drug Code" },
    { field: "acquisition_cost", required: false, desc: "Wholesale/acquisition cost for the package" },
    { field: "our_price", required: false, desc: "Your selling price (cash pay)" },
    { field: "typical_retail_price", required: false, desc: "Typical retail/pharmacy price" },
    { field: "per_unit_cost", required: false, desc: "Cost per pill/unit. Auto-calculated if not provided" },
    { field: "package_quantity", required: false, desc: "Number of units in the package (e.g., 1000)" },
    { field: "is_generic", required: false, desc: "Generic flag (true/false, yes/no, 1/0)" },
    { field: "category", required: false, desc: "Drug category (e.g., Cardiovascular)" },
    { field: "days_supply", required: false, desc: "Default days supply (e.g., 30, 90)" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <StaffNav />

      <main className="container max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Import Medications</h1>
          <p className="text-muted-foreground">
            Upload an Excel or CSV file to bulk import medications into the database.
          </p>
        </div>

        <div className="grid gap-6">
          {/* Upload Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload File
              </CardTitle>
              <CardDescription>
                Upload an Excel (.xlsx, .xls) or CSV file with your medications list.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Drop Zone */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                  dragActive
                    ? "border-primary bg-primary/5"
                    : file
                    ? "border-primary/50 bg-primary/5"
                    : "border-muted-foreground/25 hover:border-muted-foreground/50"
                }`}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragActive(true)
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFile(e.target.files[0])
                  }}
                />
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileSpreadsheet className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <p className="font-semibold">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB - Click to change
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="font-medium mb-1">Drag and drop your file here</p>
                    <p className="text-sm text-muted-foreground">or click to browse</p>
                    <p className="text-xs text-muted-foreground mt-2">Supports .xlsx, .xls, and .csv files</p>
                  </div>
                )}
              </div>

              {/* Import Mode */}
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <Label htmlFor="mode" className="text-sm font-medium mb-2 block">
                    Import Mode
                  </Label>
                  <Select value={mode} onValueChange={setMode}>
                    <SelectTrigger id="mode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upsert">
                        Update existing, add new (recommended)
                      </SelectItem>
                      <SelectItem value="replace">
                        Replace all medications (deletes existing data)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  size="lg"
                  onClick={handleImport}
                  disabled={!file || importing}
                >
                  {importing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Import Medications
                    </>
                  )}
                </Button>
              </div>

              {mode === "replace" && (
                <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>
                    Replace mode will <strong>delete all existing medications</strong> before importing.
                    This cannot be undone.
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-destructive">Import Error</p>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Result Display */}
          {result?.success && (
            <Card className="border-primary/50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 mb-4">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-primary">Import Complete</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Processed {result.summary.totalRowsProcessed} rows successfully.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-primary">{result.summary.inserted}</div>
                    <div className="text-xs text-muted-foreground">New Added</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{result.summary.updated}</div>
                    <div className="text-xs text-muted-foreground">Updated</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-muted-foreground">{result.summary.skipped}</div>
                    <div className="text-xs text-muted-foreground">Skipped</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{result.summary.totalMedications}</div>
                    <div className="text-xs text-muted-foreground">Total in DB</div>
                  </div>
                </div>

                {result.detectedColumns && result.detectedColumns.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Matched Columns:</p>
                    <div className="flex flex-wrap gap-2">
                      {result.detectedColumns.map((col) => (
                        <Badge key={col.field} variant="secondary">
                          {col.matchedHeader} {"-> "} {col.field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {result.summary.errors.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-destructive mb-2">
                      Errors ({result.summary.errors.length}):
                    </p>
                    <div className="bg-destructive/5 rounded-lg p-3 max-h-40 overflow-auto text-xs font-mono">
                      {result.summary.errors.map((err, i) => (
                        <p key={i} className="text-destructive">
                          {err}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Column Reference */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Expected Column Format
              </CardTitle>
              <CardDescription>
                Your Excel file should have a header row. The importer will auto-detect columns by name.
                Column names are flexible and case-insensitive.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Field</TableHead>
                    <TableHead>Required</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expectedColumns.map((col) => (
                    <TableRow key={col.field}>
                      <TableCell className="font-mono text-sm">{col.field}</TableCell>
                      <TableCell>
                        {col.required ? (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">Optional</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{col.desc}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
