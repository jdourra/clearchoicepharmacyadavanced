import { listOlaScheduleSlots, OlaApiError } from "@/lib/ola/client"
import { isOlaConfigured } from "@/lib/ola/config"
import { PHARMACY_PHONE_DISPLAY } from "@/lib/phone"
import { parseUsState, requiresSyncVisit } from "@/lib/us-states"

export type SyncVisitSelection = {
  scheduleStart: string
  scheduleEnd: string
  providerGuid: string
}

export function parseSyncVisit(value: unknown): SyncVisitSelection | null {
  if (!value || typeof value !== "object") return null
  const visit = value as Record<string, unknown>
  const scheduleStart = String(visit.scheduleStart || "")
  const scheduleEnd = String(visit.scheduleEnd || "")
  const providerGuid = String(visit.providerGuid || "")
  if (!scheduleStart || !scheduleEnd || !providerGuid) return null
  return { scheduleStart, scheduleEnd, providerGuid }
}

export function visitFromKey(key: string): SyncVisitSelection | null {
  const [scheduleStart, scheduleEnd, providerGuid] = key.split("||")
  if (!scheduleStart || !scheduleEnd || !providerGuid) return null
  return { scheduleStart, scheduleEnd, providerGuid }
}

export function formatVisitSlot(start: string): string {
  const date = new Date(start)
  if (Number.isNaN(date.getTime())) return start
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

export async function confirmSyncVisit(
  stateValue: unknown,
  visit: SyncVisitSelection | null
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const state = parseUsState(stateValue)
  if (!state || !requiresSyncVisit(state.code)) return { ok: true }
  if (!visit) {
    return {
      ok: false,
      status: 400,
      error: `${state.name} requires a live video visit. Choose an appointment time.`,
    }
  }
  if (!isOlaConfigured()) {
    return {
      ok: false,
      status: 400,
      error: `Live video visits are not available yet. Call ${PHARMACY_PHONE_DISPLAY}.`,
    }
  }
  try {
    const slots = await listOlaScheduleSlots(state.code)
    const matched = slots.some(
      (slot) =>
        slot.scheduleStart === visit.scheduleStart &&
        slot.scheduleEnd === visit.scheduleEnd &&
        slot.providerGuid === visit.providerGuid
    )
    if (!matched) {
      return {
        ok: false,
        status: 400,
        error: "That video visit time is no longer available. Choose another time.",
      }
    }
    return { ok: true }
  } catch (error) {
    const message = error instanceof OlaApiError ? error.message : "Video visit times could not be confirmed."
    return { ok: false, status: 502, error: `${message} Call ${PHARMACY_PHONE_DISPLAY}.` }
  }
}
