import { NextResponse } from "next/server"
import { messaging } from "@/lib/auth"
import { getUserIdFromRequest } from "@/lib/server-session"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const messages = await messaging.getMessagesForPatient(userId)
    const owned = messages.find((m) => m.id === id)
    if (!owned) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    await messaging.markAsRead(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[patient-messages/read]", error)
    return NextResponse.json({ error: "Failed to update message" }, { status: 500 })
  }
}
