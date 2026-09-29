"use client"

import { useState } from "react"
import { Loader2, RotateCcw } from "lucide-react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { authFetch } from "@/lib/session"

export function GlpReorderButton({
  intakeId,
  summary,
  onReordered,
}: {
  intakeId: string
  summary?: string
  onReordered: () => void
}) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    setSubmitting(true)
    try {
      const res = await authFetch("/api/patient-portal/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intakeId, note }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Could not submit the reorder.")
      }
      toast.success("Reorder sent. Your clinician will review it.")
      setOpen(false)
      setNote("")
      onReordered()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit the reorder.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Button type="button" size="sm" onClick={() => setOpen(true)}>
        <RotateCcw className="h-4 w-4 mr-2" />
        Reorder
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reorder this medication</DialogTitle>
            <DialogDescription>
              {summary
                ? `This sends ${summary} back to your clinician. You do not need to fill out a new intake.`
                : "This sends the same medication and dose back to your clinician. You do not need to fill out a new intake."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor={`reorder-note-${intakeId}`}>Note or question for the physician (optional)</Label>
            <Textarea
              id={`reorder-note-${intakeId}`}
              rows={4}
              value={note}
              maxLength={2000}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Side effects, a dose question, or anything else you want the physician to know."
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void submit()} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit reorder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
