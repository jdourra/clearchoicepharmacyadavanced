"use client"

import { useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

type PageProps = { params: Promise<{ token: string }> }

export default function TherapyCheckInPage({ params }: PageProps) {
  const [token, setToken] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)
  const [alreadyDone, setAlreadyDone] = useState(false)
  const [monthLabel, setMonthLabel] = useState("")
  const [firstName, setFirstName] = useState("")
  const [tolerating, setTolerating] = useState<"yes" | "no" | "">("")
  const [weightLostLbs, setWeightLostLbs] = useState("")
  const [sideEffects, setSideEffects] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    params.then(({ token: t }) => {
      setToken(t)
      fetch(`/api/therapy-checkin/${t}`)
        .then(async (res) => {
          const data = await res.json().catch(() => ({}))
          if (!res.ok) throw new Error(data.error || "Invalid link")
          setMonthLabel(String(data.checkIn?.monthLabel || ""))
          setFirstName(String(data.patientFirstName || ""))
          if (data.checkIn?.respondedAt) {
            setAlreadyDone(true)
            setDone(true)
            setTolerating(data.checkIn.tolerating ? "yes" : "no")
            if (data.checkIn.weightLostLbs != null) {
              setWeightLostLbs(String(data.checkIn.weightLostLbs))
            }
            setSideEffects(String(data.checkIn.sideEffects || ""))
            setNotes(String(data.checkIn.notes || ""))
          }
        })
        .catch((err) => setError(err instanceof Error ? err.message : "Could not load check-in"))
        .finally(() => setLoading(false))
    })
  }, [params])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!tolerating) {
      setError("Please select whether you are tolerating therapy.")
      return
    }
    setSubmitting(true)
    setError("")
    try {
      const res = await fetch(`/api/therapy-checkin/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tolerating: tolerating === "yes",
          weightLostLbs: weightLostLbs.trim() || null,
          sideEffects,
          notes,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Could not save")
      setDone(true)
      setAlreadyDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <SiteHeader />
      <main className="container max-w-lg py-10">
        <Card>
          <CardHeader>
            <CardTitle>Therapy check-in</CardTitle>
            <CardDescription>
              {firstName ? `Hi ${firstName} — ` : ""}
              {monthLabel
                ? `Tell us how ${monthLabel} of therapy is going before your next kit.`
                : "Share how therapy is going before your next kit."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : error && !done ? (
              <div className="space-y-3">
                <p className="text-destructive text-sm">{error}</p>
                <Button asChild variant="outline">
                  <Link href="/account?tab=therapy">Open patient portal</Link>
                </Button>
              </div>
            ) : done ? (
              <div className="space-y-3">
                <p className="text-sm">
                  {alreadyDone
                    ? "Thank you — your check-in was saved. Your clinician can review it on your therapy chart."
                    : "Saved. Thank you!"}
                </p>
                <Button asChild>
                  <Link href="/account?tab=therapy">View therapy chart</Link>
                </Button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={onSubmit}>
                <div className="space-y-2">
                  <Label>Are you tolerating the medication well?</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={tolerating === "yes" ? "default" : "outline"}
                      onClick={() => setTolerating("yes")}
                    >
                      Yes
                    </Button>
                    <Button
                      type="button"
                      variant={tolerating === "no" ? "default" : "outline"}
                      onClick={() => setTolerating("no")}
                    >
                      No
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weightLostLbs">Approx. weight lost (lbs, optional)</Label>
                  <Input
                    id="weightLostLbs"
                    type="number"
                    step="0.1"
                    value={weightLostLbs}
                    onChange={(e) => setWeightLostLbs(e.target.value)}
                    placeholder="e.g. 4"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sideEffects">Side effects (optional)</Label>
                  <Textarea
                    id="sideEffects"
                    rows={2}
                    value={sideEffects}
                    onChange={(e) => setSideEffects(e.target.value)}
                    placeholder="Nausea, constipation, none…"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Anything else for your doctor?</Label>
                  <Textarea
                    id="notes"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Submit check-in
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
