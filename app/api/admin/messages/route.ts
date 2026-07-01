import { NextResponse } from "next/server"
import { admin, staffAuth, messaging } from "@/lib/auth"
import { emailPatientPortalMessage } from "@/lib/portal-message-email"

function isValidPatientId(id: unknown): id is string {
  return typeof id === "string" && id.length > 0 && id !== "null" && id !== "undefined"
}

export async function GET(request: Request) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!staff || staff.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const messages = await messaging.getAllMessages()
    return NextResponse.json({ messages })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load messages"
    return NextResponse.json({ error: message }, { status: 500 })
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

    if (!isValidPatientId(recipientId)) {
      return NextResponse.json(
        {
          error:
            "This order has no linked patient account. The customer must check out while logged in, or you can contact them directly by email.",
        },
        { status: 400 }
      )
    }

    const message = await messaging.sendMessage(
      senderType,
      senderId,
      recipientType,
      recipientId,
      subject,
      body,
      orderId || null
    )

    const patient = await admin.getPatientProfileById(recipientId)
    let emailResult: { emailed: boolean; error?: string } = { emailed: false }
    if (patient?.email) {
      emailResult = await emailPatientPortalMessage({
        to: patient.email,
        patientName: `${patient.firstName} ${patient.lastName}`.trim(),
        subject: subject || "Message from Clear Choice Pharmacy",
        body,
        orderId: orderId || null,
      })
    }

    return NextResponse.json({
      message,
      emailed: emailResult.emailed,
      emailError: emailResult.error || null,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to send message"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
