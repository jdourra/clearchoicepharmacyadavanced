"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { TherapyMonthRow, TherapyTimelineResult } from "@/lib/patient-therapy-timeline"
import { Loader2 } from "lucide-react"

function formatShortDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    })
  } catch {
    return iso
  }
}

function CheckInCell({ row }: { row: TherapyMonthRow }) {
  const c = row.checkIn
  if (!c) {
    return <span className="text-muted-foreground text-xs">No check-in yet</span>
  }
  if (!c.respondedAt) {
    return (
      <span className="text-xs text-amber-700 dark:text-amber-300">
        Sent {c.sentAt ? formatShortDate(c.sentAt) : ""} — awaiting reply
      </span>
    )
  }
  return (
    <div className="text-xs space-y-0.5">
      <p>
        <span className="font-medium">
          {c.tolerating ? "Tolerating well" : "Not tolerating well"}
        </span>
        {c.weightLostLbs != null ? ` · Lost ~${c.weightLostLbs} lbs` : ""}
      </p>
      {c.sideEffects ? <p className="text-muted-foreground">SE: {c.sideEffects}</p> : null}
      {c.notes ? <p className="text-muted-foreground">{c.notes}</p> : null}
    </div>
  )
}

type PatientTherapyTimelineTableProps = {
  timeline: TherapyTimelineResult
  /** admin | doctor can send check-ins */
  canSendCheckIn?: boolean
  sendingKey?: string | null
  onSendCheckIn?: (intakeId: string, monthIndex: number) => void
  compact?: boolean
}

export function PatientTherapyTimelineTable({
  timeline,
  canSendCheckIn = false,
  sendingKey = null,
  onSendCheckIn,
  compact = false,
}: PatientTherapyTimelineTableProps) {
  if (timeline.rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No weight-loss therapy months on file yet. Approved and fulfilled GLP orders will appear here by month.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {(timeline.nextRefillAt || timeline.refillReminderDue) && (
        <div className="flex flex-wrap gap-2 text-sm">
          {timeline.nextRefillAt ? (
            <Badge variant="outline">
              Supply ends ~{formatShortDate(timeline.nextRefillAt)}
            </Badge>
          ) : null}
          {timeline.refillReminderDue ? (
            <Badge className="bg-amber-600 hover:bg-amber-600">Refill reminder due</Badge>
          ) : null}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left">
              <th className="p-3 font-medium">Month</th>
              <th className="p-3 font-medium">Medication / dose</th>
              {!compact && <th className="p-3 font-medium hidden md:table-cell">Weeks</th>}
              <th className="p-3 font-medium">Doctor</th>
              <th className="p-3 font-medium hidden sm:table-cell">Cost</th>
              <th className="p-3 font-medium">Kits / refills</th>
              <th className="p-3 font-medium">Patient check-in</th>
              {canSendCheckIn ? <th className="p-3 font-medium">Action</th> : null}
            </tr>
          </thead>
          <tbody>
            {timeline.rows.map((row) => {
              const key = `${row.intakeId}:${row.monthIndex}`
              return (
                <tr key={row.key} className="border-b last:border-0 align-top">
                  <td className="p-3">
                    <p className="font-medium">{row.monthLabel}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatShortDate(row.periodStart)} – {formatShortDate(row.periodEnd)}
                    </p>
                  </td>
                  <td className="p-3">
                    <p className="font-medium">{row.medication}</p>
                    <p className="text-xs text-muted-foreground">{row.weeklyDose}</p>
                    {!compact ? (
                      <p className="text-xs text-muted-foreground mt-0.5">{row.doseLabel}</p>
                    ) : null}
                  </td>
                  {!compact && (
                    <td className="p-3 hidden md:table-cell text-muted-foreground">
                      {row.weeksCovered}
                    </td>
                  )}
                  <td className="p-3">{row.doctorName}</td>
                  <td className="p-3 hidden sm:table-cell">
                    <p className="font-medium">{row.monthCostLabel}</p>
                    <p className="text-xs text-muted-foreground">
                      of {row.orderTotalLabel} order
                    </p>
                  </td>
                  <td className="p-3">
                    <p>
                      Kit {row.kitNumber} of {row.kitsInOrder}
                    </p>
                    <p className="text-xs text-muted-foreground">{row.refillsRemainingLabel}</p>
                  </td>
                  <td className="p-3">
                    <CheckInCell row={row} />
                  </td>
                  {canSendCheckIn ? (
                    <td className="p-3">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={sendingKey === key || Boolean(row.checkIn?.respondedAt)}
                        onClick={() => onSendCheckIn?.(row.intakeId, row.monthIndex)}
                      >
                        {sendingKey === key ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                        ) : null}
                        {row.checkIn?.respondedAt
                          ? "Done"
                          : row.checkIn?.sentAt
                            ? "Resend"
                            : "Send check-in"}
                      </Button>
                    </td>
                  ) : null}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
