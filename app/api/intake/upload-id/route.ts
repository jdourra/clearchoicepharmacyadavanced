import { NextRequest, NextResponse } from "next/server"
import { storeIdDocument } from "@/lib/intake-id-storage"
import { resolveUploadMimeType } from "@/lib/upload-mime"

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
])

export async function POST(request: NextRequest) {
  try {
    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return NextResponse.json(
        {
          error:
            "This photo is too large to upload. Please use Take photo in the form so it can be compressed automatically.",
        },
        { status: 413 }
      )
    }
    const file = formData.get("file")
    const side = formData.get("side")
    const intakePrefix = String(formData.get("intakePrefix") || "draft").replace(/[^a-zA-Z0-9_-]/g, "")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 })
    }

    if (side !== "front" && side !== "back") {
      return NextResponse.json({ error: "side must be front or back" }, { status: 400 })
    }

    const contentType = resolveUploadMimeType(file, ALLOWED_TYPES)
    if (!contentType) {
      return NextResponse.json(
        { error: "Please upload a JPEG, PNG, HEIC, or PDF of your photo ID" },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await storeIdDocument({
      file: buffer,
      contentType,
      originalName: file.name,
      side,
      intakePrefix,
    })

    return NextResponse.json({
      storageKey: result.storageKey,
      mode: result.mode,
    })
  } catch (error) {
    console.error("[intake/upload-id]", error)
    const message = error instanceof Error ? error.message : "Upload failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
