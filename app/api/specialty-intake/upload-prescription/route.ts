import { NextRequest, NextResponse } from "next/server"
import { storeSpecialtyPrescription } from "@/lib/specialty-prescription-storage"

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "application/pdf"])

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")
    const intakePrefix = String(formData.get("intakePrefix") || "draft").replace(/[^a-zA-Z0-9_-]/g, "")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 })
    }

    const contentType = file.type || "application/pdf"
    if (!ALLOWED_TYPES.has(contentType)) {
      return NextResponse.json({ error: "Only JPEG, PNG, or PDF files are allowed" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await storeSpecialtyPrescription({
      file: buffer,
      contentType,
      originalName: file.name,
      intakePrefix,
    })

    return NextResponse.json({
      storageKey: result.storageKey,
      mode: result.mode,
    })
  } catch (error) {
    console.error("[specialty-intake/upload-prescription]", error)
    const message = error instanceof Error ? error.message : "Upload failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
