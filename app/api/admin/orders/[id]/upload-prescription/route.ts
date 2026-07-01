import { NextRequest, NextResponse } from "next/server"
import { orders, staffAuth } from "@/lib/auth"
import { savePrescriptionUpload } from "@/lib/order-prescription-admin"
import { buildPrescriptionNotes } from "@/lib/order-prescription-notes"
import { storeOrderPrescription } from "@/lib/order-prescription-storage"

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "application/pdf"])

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!staff || staff.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: orderId } = await params
    const order = await orders.getOrderById(orderId)
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get("file")
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 })
    }

    const contentType = file.type || "application/pdf"
    if (!ALLOWED_TYPES.has(contentType)) {
      return NextResponse.json({ error: "Only JPEG, PNG, or PDF files are allowed" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const stored = await storeOrderPrescription({
      file: buffer,
      contentType,
      originalName: file.name,
      orderId,
    })

    if (stored.mode === "dev") {
      return NextResponse.json(
        {
          error:
            "S3 is not configured on this server. Add INTAKE_ID_BUCKET and AWS credentials, then redeploy.",
        },
        { status: 503 }
      )
    }

    await savePrescriptionUpload({
      orderId,
      patientId: order.patient_id,
      storageKey: stored.storageKey,
      fileName: file.name,
    })

    const deliveryMethod = order.payment_method || "pickup"
    const notes = buildPrescriptionNotes("upload", { deliveryMethod })
    await orders.updateOrderPrescription(orderId, "upload", notes)

    return NextResponse.json({ success: true, storageKey: stored.storageKey })
  } catch (error) {
    console.error("[admin/orders/upload-prescription]", error)
    const message = error instanceof Error ? error.message : "Upload failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
