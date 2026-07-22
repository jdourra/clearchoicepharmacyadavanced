"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { formatPhoneDisplay } from "@/lib/phone"

type Prescription = {
  id: string
  patient_id: string
  quantity_prescribed: number
  refills_remaining: number
  notes: string | null
  status: string
  prescriber_name: string
  prescriber_npi: string | null
  created_at: string
  medications: {
    name: string
    generic_name: string | null
    strength: string | null
    form: string | null
  } | null
  profiles: {
    full_name: string | null
    email: string
    phone: string | null
  } | null
}

export function PrescriptionManager({ prescriptions }: { prescriptions: Prescription[] }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")
  const [loading, setLoading] = useState<string | null>(null)

  const filteredPrescriptions = prescriptions.filter((rx) => {
    if (activeTab === "all") return true
    return rx.status === activeTab
  })

  const updateStatus = async (id: string, newStatus: string) => {
    setLoading(id)
    try {
      const res = await fetch("/api/prescriptions/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      })
      if (!res.ok) {
        throw new Error("Failed to update")
      }
      router.refresh()
    } catch (error) {
      console.error("[v0] Error updating prescription:", error)
      alert("Failed to update prescription")
    }
    setLoading(null)
  }

  const statusCounts = {
    all: prescriptions.length,
    pending: prescriptions.filter((p) => p.status === "pending").length,
    active: prescriptions.filter((p) => p.status === "active").length,
    filled: prescriptions.filter((p) => p.status === "filled").length,
    expired: prescriptions.filter((p) => p.status === "expired").length,
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
        <TabsTrigger value="pending">Pending ({statusCounts.pending})</TabsTrigger>
        <TabsTrigger value="active">Active ({statusCounts.active})</TabsTrigger>
        <TabsTrigger value="filled">Filled ({statusCounts.filled})</TabsTrigger>
        <TabsTrigger value="expired">Expired ({statusCounts.expired})</TabsTrigger>
      </TabsList>

      {["all", "pending", "active", "filled", "expired"].map((tab) => (
        <TabsContent key={tab} value={tab} className="space-y-4">
          {filteredPrescriptions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No prescriptions in this category</p>
              </CardContent>
            </Card>
          ) : (
            filteredPrescriptions.map((rx) => (
              <Card key={rx.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{rx.medications?.name}</CardTitle>
                      <div className="text-sm text-muted-foreground mt-1">
                        {rx.medications?.strength} - {rx.medications?.form}
                      </div>
                    </div>
                    <Badge
                      variant={
                        rx.status === "active"
                          ? "default"
                          : rx.status === "filled"
                            ? "secondary"
                            : rx.status === "cancelled" || rx.status === "expired"
                              ? "destructive"
                              : "outline"
                      }
                    >
                      {rx.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Patient Information</h4>
                      <div className="flex flex-col gap-1 text-sm">
                        <div>
                          <span className="font-medium">Name:</span> {rx.profiles?.full_name || "Unknown"}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span> {rx.profiles?.email}
                        </div>
                        {rx.profiles?.phone && (
                          <div>
                            <span className="font-medium">Phone:</span>{" "}
                            {formatPhoneDisplay(rx.profiles.phone)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Prescription Details</h4>
                      <div className="flex flex-col gap-1 text-sm">
                        <div>
                          <span className="font-medium">Quantity:</span> {rx.quantity_prescribed} days
                        </div>
                        <div>
                          <span className="font-medium">Refills:</span> {rx.refills_remaining}
                        </div>
                        <div>
                          <span className="font-medium">Prescriber:</span> {rx.prescriber_name}
                        </div>
                        <div>
                          <span className="font-medium">Submitted:</span> {new Date(rx.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {rx.notes && (
                    <div>
                      <h4 className="font-semibold mb-1 text-sm">Notes</h4>
                      <p className="text-sm text-muted-foreground">{rx.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t">
                    {rx.status === "pending" && (
                      <Button onClick={() => updateStatus(rx.id, "active")} disabled={loading === rx.id}>
                        {loading === rx.id ? "Processing..." : "Activate"}
                      </Button>
                    )}
                    {rx.status === "active" && (
                      <Button onClick={() => updateStatus(rx.id, "filled")} disabled={loading === rx.id}>
                        {loading === rx.id ? "Updating..." : "Mark as Filled"}
                      </Button>
                    )}
                    {(rx.status === "pending" || rx.status === "active") && (
                      <Button
                        variant="destructive"
                        onClick={() => updateStatus(rx.id, "cancelled")}
                        disabled={loading === rx.id}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      ))}
    </Tabs>
  )
}
