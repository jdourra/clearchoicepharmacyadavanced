import { NextRequest, NextResponse } from "next/server"
import { staffAuth } from "@/lib/auth"
import { sql } from "@/lib/db"
import { fetchOrderPrescriptionFile } from "@/lib/order-prescription-storage"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!staff || staff.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: orderId } = await params
    const uploadId = request.nextUrl.searchParams.get("uploadId")
    if (!uploadId) {
      return NextResponse.json({ error: "uploadId is required" }, { status: 400 })
    }

    const rows = await sql(
      `SELECT file_url, file_name FROM prescription_uploads WHERE id = $1 AND order_id = $2`,
      [uploadId, orderId]
    )
    if (rows.length === 0) {
      return NextResponse.json({ error: "Upload not found" }, { status: 404 })
    }

    const storageKey = String(rows[0].file_url)
    const fileName = rows[0].file_name ? String(rows[0].file_name) : "prescription"

    const file = await fetchOrderPrescriptionFile(storageKey)
    if (!file) {
      return NextResponse.json(
        {
          error:
            "Prescription file is not available in storage. Configure INTAKE_ID_BUCKET or re-upload from checkout.",
        },
        { status: 404 }
      )
    }

    const disposition = request.nextUrl.searchParams.get("download") === "1" ? "attachment" : "inline"

    return new NextResponse(new Uint8Array(file.body), {
      headers: {
        "Content-Type": file.contentType,
        "Content-Disposition": `${disposition}; filename="${fileName.replace(/"/g, "")}"`,
        "Cache-Control": "private, no-store",
      },
    })
  } catch (error) {
    console.error("[admin/orders/prescription-file]", error)
    return NextResponse.json({ error: "Failed to load prescription file" }, { status: 500 })
  }
}
