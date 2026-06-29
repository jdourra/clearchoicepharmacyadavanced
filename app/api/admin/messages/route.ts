import { NextResponse } from "next/server"
import { staffAuth, messaging } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!staff || staff.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const messages = await messaging.getAllMessages()
    return NextResponse.json({ messages })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!staff || staff.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { senderType, senderId, recipientType, recipientId, subject, body, orderId } =
      await request.json()
    const message = await messaging.sendMessage(
      senderType,
      senderId,
      recipientType,
      recipientId,
      subject,
      body,
      orderId || null
    )
    return NextResponse.json({ message })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
