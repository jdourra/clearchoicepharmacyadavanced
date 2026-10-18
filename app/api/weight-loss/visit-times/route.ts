import { NextRequest, NextResponse } from "next/server"
import { listOlaScheduleSlots, OlaApiError } from "@/lib/ola/client"
import { isOlaConfigured } from "@/lib/ola/config"
import { PHARMACY_PHONE_DISPLAY } from "@/lib/phone"
import { parseUsState, requiresSyncVisit } from "@/lib/us-states"

export async function GET(request: NextRequest) {
  const state = parseUsState(request.nextUrl.searchParams.get("state"))
  if (!state || !requiresSyncVisit(state.code)) {
    return NextResponse.json({ slots: [], message: "" })
  }

  if (!isOlaConfigured()) {
    return NextResponse.json({
      slots: [],
      message: `Live video visits are not available yet. Call ${PHARMACY_PHONE_DISPLAY}.`,
    })
  }

  try {
    const slots = await listOlaScheduleSlots(state.code)
    return NextResponse.json({
      slots: slots.slice(0, 24).map((slot) => ({
        scheduleStart: slot.scheduleStart,
        scheduleEnd: slot.scheduleEnd,
        providerGuid: slot.providerGuid,
      })),
      message:
        slots.length === 0
          ? `No video visit times are open for ${state.name} right now. Call ${PHARMACY_PHONE_DISPLAY}.`
          : "",
    })
  } catch (error) {
    const message = error instanceof OlaApiError ? error.message : "Video visit times could not be loaded."
    return NextResponse.json(
      { slots: [], message: `${message} Call ${PHARMACY_PHONE_DISPLAY}.` },
      { status: 502 }
    )
  }
}
