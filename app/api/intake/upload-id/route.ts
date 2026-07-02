import { NextRequest, NextResponse } from "next/server"
import { storeIdDocument } from "@/lib/intake-id-storage"
import { resolveUploadMimeType } from "@/lib/upload-mime"

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
])

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")
    const side = formData.get("side")
    const intakePrefix = String(formData.get("intakePrefix") || "draft").replace(/[^a-zA-Z0-9_-]/g, "")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 })
    }

    if (side !== "front" && side !== "back") {
      return NextResponse.json({ error: "side must be front or back" }, { status: 400 })
    }

    const contentType = resolveUploadMimeType(file, ALLOWED_TYPES, "image/jpeg")
    if (!contentType) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP, or HEIC license photos are allowed" },
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
