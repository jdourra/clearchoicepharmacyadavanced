import { NextRequest, NextResponse } from "next/server"
import {
  DROPBOX_SIGN_CALLBACK_ACK,
  isDropboxSignConfigured,
  verifyDropboxSignCallback,
} from "@/lib/dropbox-sign"
import { finalizeSignedPrescriptionFromDropbox } from "@/lib/clinical-prescription-service"

export const runtime = "nodejs"

/** Dropbox Sign account/app callback — must respond with exact ack string. */
export async function POST(request: NextRequest) {
  try {
    const form = await request.formData()
    const jsonField = form.get("json")
    if (typeof jsonField !== "string" || !jsonField.trim()) {
      return new NextResponse(DROPBOX_SIGN_CALLBACK_ACK, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      })
    }

    if (!isDropboxSignConfigured()) {
      console.warn("[dropbox-sign/webhook] API key not configured")
      return new NextResponse(DROPBOX_SIGN_CALLBACK_ACK, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      })
    }

    let verified: ReturnType<typeof verifyDropboxSignCallback>
    try {
      verified = verifyDropboxSignCallback(jsonField)
    } catch (error) {
      console.error("[dropbox-sign/webhook] parse failed:", error)
      return new NextResponse(DROPBOX_SIGN_CALLBACK_ACK, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      })
    }

    if (!verified.valid) {
      console.warn("[dropbox-sign/webhook] invalid event hash")
      return new NextResponse(DROPBOX_SIGN_CALLBACK_ACK, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      })
    }

    const signedEvents = new Set([
      "signature_request_all_signed",
      "signature_request_signed",
      "signature_request_downloadable",
    ])

    if (verified.signatureRequestId && signedEvents.has(verified.eventType)) {
      // Prefer all_signed / downloadable so the file is complete
      if (
        verified.eventType === "signature_request_all_signed" ||
        verified.eventType === "signature_request_downloadable"
      ) {
        const result = await finalizeSignedPrescriptionFromDropbox(verified.signatureRequestId)
        if (!result.ok) {
          console.error("[dropbox-sign/webhook] finalize failed:", result.error)
        }
      }
    }

    return new NextResponse(DROPBOX_SIGN_CALLBACK_ACK, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    })
  } catch (error) {
    console.error("[dropbox-sign/webhook] handler error:", error)
    return new NextResponse(DROPBOX_SIGN_CALLBACK_ACK, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    })
  }
}
