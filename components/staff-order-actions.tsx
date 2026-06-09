"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

type OrderStatus = "pending" | "processing" | "ready" | "completed" | "cancelled" | "problem"

export function StaffOrderActions({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const updateStatus = async (newStatus: OrderStatus) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        throw new Error("Failed to update order")
      }
      router.refresh()
    } catch (err) {
      console.error("[staff] Failed to update order status", err)
      alert("Failed to update order status. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {status === "pending" && (
        <Button size="sm" disabled={loading} onClick={() => updateStatus("processing")}>
          {loading ? "Updating..." : "Start Processing"}
        </Button>
      )}
      {status === "processing" && (
        <Button size="sm" disabled={loading} onClick={() => updateStatus("ready")}>
          {loading ? "Updating..." : "Mark Ready"}
        </Button>
      )}
      {status === "ready" && (
        <Button size="sm" disabled={loading} onClick={() => updateStatus("completed")}>
          {loading ? "Updating..." : "Mark Completed"}
        </Button>
      )}
      {["pending", "processing", "ready"].includes(status) && (
        <Button
          size="sm"
          variant="destructive"
          disabled={loading}
          onClick={() => updateStatus("cancelled")}
        >
          {loading ? "Updating..." : "Cancel Order"}
        </Button>
      )}
    </div>
  )
}

