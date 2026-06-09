import { NextResponse } from "next/server"
import { staffAuth, messaging } from "@/lib/auth"

export async function GET() {
  try {
    const staff = await staffAuth.getCurrentStaff()
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
    const staff = await staffAuth.getCurrentStaff()
    if (!staff || staff.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { senderType, senderId, recipientType, recipientId, subject, body } = await request.json()
    const message = await messaging.sendMessage(senderType, senderId, recipientType, recipientId, subject, body)
    return NextResponse.json({ message })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
