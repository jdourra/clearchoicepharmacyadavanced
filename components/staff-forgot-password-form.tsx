"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function StaffForgotPasswordForm({
  portal,
  loginHref,
}: {
  portal: "admin" | "doctor"
  loginHref: string
}) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch("/api/auth/staff-forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, portal }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Could not send the reset email.")
      setMessage(data.message || "If an account exists for that email, we sent a link to reset the password.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the reset email.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder={portal === "doctor" ? "doctor@clearchoicepharmacy.com" : "admin@clearchoicepharmacy.com"}
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}
      {message && <div className="p-3 text-sm bg-muted rounded-lg">{message}</div>}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Sending..." : "Send reset link"}
      </Button>
      <div className="text-center text-sm">
        <Link href={loginHref} className="text-primary hover:underline">
          Back to login
        </Link>
      </div>
    </form>
  )
}
