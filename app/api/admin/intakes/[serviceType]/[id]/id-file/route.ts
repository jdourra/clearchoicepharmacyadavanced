import { NextRequest, NextResponse } from "next/server"
import { staffAuth } from "@/lib/auth"
import { fetchIdDocument, idFileFetchErrorMessage } from "@/lib/intake-id-storage"
import { getClinicalIntakeDetail, isAdminIntakeServiceType } from "@/lib/telehealth/intake-registry"

type RouteParams = { params: Promise<{ serviceType: string; id: string }> }

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!staff || staff.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { serviceType, id } = await params
    if (!isAdminIntakeServiceType(serviceType)) {
      return NextResponse.json({ error: "Invalid service type" }, { status: 400 })
    }

    const side = request.nextUrl.searchParams.get("side")
    if (side !== "front" && side !== "back") {
      return NextResponse.json({ error: "side must be front or back" }, { status: 400 })
    }

    const detail = await getClinicalIntakeDetail(serviceType, id)
    if (!detail) {
      return NextResponse.json({ error: "Intake not found" }, { status: 404 })
    }

    const storageKey =
      side === "front"
        ? detail.id_front_key != null
          ? String(detail.id_front_key)
          : null
        : detail.id_back_key != null
          ? String(detail.id_back_key)
          : null

    if (!storageKey) {
      return NextResponse.json({ error: `No ${side} ID on file for this intake` }, { status: 404 })
    }

    const file = await fetchIdDocument(storageKey)
    if (!file.ok) {
      return NextResponse.json(
        { error: idFileFetchErrorMessage(file.error), code: file.error },
        { status: file.error === "bucket_not_configured" ? 503 : 404 }
      )
    }

    const disposition = request.nextUrl.searchParams.get("download") === "1" ? "attachment" : "inline"
    const filename = `id-${side}-${id}.${file.contentType.includes("png") ? "png" : "jpg"}`

    return new NextResponse(new Uint8Array(file.body), {
      headers: {
        "Content-Type": file.contentType,
        "Content-Disposition": `${disposition}; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    })
  } catch (error) {
    console.error("[admin/intakes/id-file]", error)
    return NextResponse.json({ error: "Failed to load ID image" }, { status: 500 })
  }
}
