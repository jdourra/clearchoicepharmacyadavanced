"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, Download, Upload } from "lucide-react"

export function StaffPricingSync() {
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  const syncPrices = async () => {
    setSyncing(true)
    try {
      // TODO: Implement bulk price sync from Prescription Supply
      // This would call your supplier API to update all medication prices
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate API call
      setLastSync(new Date())
    } catch (error) {
      console.error("[v0] Error syncing prices:", error)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prescription Supply Price Sync</CardTitle>
        <CardDescription>Sync medication prices from your Prescription Supply account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Last synced:</p>
            <p className="text-sm text-muted-foreground">{lastSync ? lastSync.toLocaleString() : "Never"}</p>
          </div>
          <Button onClick={syncPrices} disabled={syncing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync Now"}
          </Button>
        </div>

        <div className="border-t pt-4 space-y-3">
          <p className="text-sm font-medium">Manual Price Management:</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export Current Prices
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Import Price CSV
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Upload a CSV file with NDC codes and acquisition costs from your Prescription Supply portal
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 text-sm">
          <p className="font-semibold mb-2">API Configuration:</p>
          <p className="text-muted-foreground mb-2">
            To enable automatic price sync, contact Prescription Supply for API credentials
          </p>
          <p className="text-xs text-muted-foreground">
            Set PRESCRIPTION_SUPPLY_API_KEY and PRESCRIPTION_SUPPLY_API_ENDPOINT in environment variables
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
