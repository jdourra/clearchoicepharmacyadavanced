import { NextResponse } from "next/server"
import { messaging } from "@/lib/auth"
import { getUserIdFromRequest } from "@/lib/server-session"

export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const messages = await messaging.getMessagesForPatient(userId)
    return NextResponse.json({ messages })
  } catch (error) {
    console.error("[patient-messages]", error)
    return NextResponse.json({ error: "Failed to load messages" }, { status: 500 })
  }
}
