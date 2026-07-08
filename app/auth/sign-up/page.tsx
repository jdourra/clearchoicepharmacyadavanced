"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useState } from "react"
import { saveSession } from "@/lib/session"
import { SiteLogo } from "@/components/site-logo"

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
]

export default function SignUpPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [dob, setDob] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [zip, setZip] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          dob: dob || undefined,
          address,
          city,
          state,
          zip,
          password,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "An error occurred")
      }
      saveSession(data.sessionId)
      window.location.href = "/"
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred"
      if (errorMessage.includes("already registered")) {
        setError("This email is already registered. Please login instead.")
      } else {
        setError(errorMessage)
      }
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-muted/30">
      <div className="w-full max-w-xl">
        <div className="flex flex-col gap-6">
          <div className="flex justify-center">
            <SiteLogo href="/" height={88} priority />
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Create Account</CardTitle>
              <CardDescription>
                Sign up for transparent medication pricing. All fields help us serve you faster at checkout.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp}>
                <div className="flex flex-col gap-5">
                  {/* --- Personal Info --- */}
                  <p className="text-sm font-semibold text-foreground border-b pb-2">Personal Information</p>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="firstName">
                        First Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="phone">
                        Phone Number <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(248) 555-0100"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input
                        id="dob"
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {/* --- Address --- */}
                  <p className="text-sm font-semibold text-foreground border-b pb-2 mt-2">Address</p>

                  <div className="grid gap-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      placeholder="123 Main St"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="Novi"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="state">State</Label>
                      <Select value={state} onValueChange={setState}>
                        <SelectTrigger id="state">
                          <SelectValue placeholder="State" />
                        </SelectTrigger>
                        <SelectContent>
                          {US_STATES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input
                        id="zip"
                        placeholder="48375"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* --- Password --- */}
                  <p className="text-sm font-semibold text-foreground border-b pb-2 mt-2">Password</p>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="password">
                        Password <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirmPassword">
                        Confirm Password <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                      {error}
                      {error.includes("already registered") && (
                        <div className="mt-2">
                          <Link href="/auth/login" className="underline font-medium">
                            Go to login page
                          </Link>
                        </div>
                      )}
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                  <Button type="button" variant="outline" className="w-full bg-transparent" asChild>
                    <Link href="/">Continue as Guest</Link>
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  {"Already have an account? "}
                  <Link href="/auth/login" className="underline underline-offset-4 text-primary">
                    Login
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
