"use client"

import type React from "react"
import { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function StaffResetPasswordFields({
  portal,
  loginHref,
  requestHref,
}: {
  portal: "admin" | "doctor"
  loginHref: string
  requestHref: string
}) {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/staff-reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Could not reset the password.")
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset the password.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-600">This reset link is invalid or has expired.</p>
        <Button asChild className="w-full">
          <Link href={requestHref}>Request a new link</Link>
        </Button>
      </div>
    )
  }

  if (done) {
    return (
      <div className="space-y-4">
        <p className="text-sm">Your password is updated. You can sign in with it now.</p>
        <Button asChild className="w-full">
          <Link href={loginHref}>Go to login</Link>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          type="password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Saving..." : "Update password"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        {portal === "doctor" ? "Clinician account" : "Admin account"}
      </p>
    </form>
  )
}

export function StaffResetPasswordForm(props: {
  portal: "admin" | "doctor"
  loginHref: string
  requestHref: string
}) {
  return (
    <Suspense fallback={<p className="text-center text-sm text-muted-foreground">Loading...</p>}>
      <StaffResetPasswordFields {...props} />
    </Suspense>
  )
}
