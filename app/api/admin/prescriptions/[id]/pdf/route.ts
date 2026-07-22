import { NextRequest, NextResponse } from "next/server"
import { staffAuth } from "@/lib/auth"
import {
  getPrescriptionById,
} from "@/lib/clinical-prescription-service"
import { fetchPrescriptionPdf } from "@/lib/clinical-prescription-storage"
import { buildPrescriptionPdf } from "@/lib/clinical-prescription"
import { getClinicalIntakeDetail, isAdminIntakeServiceType, SERVICE_LABELS } from "@/lib/telehealth/intake-registry"

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!staff || staff.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const rx = await getPrescriptionById(id)
    if (!rx) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 })
    }

    const key = rx.signedPdfKey || rx.unsignedPdfKey
    if (key) {
      const fetched = await fetchPrescriptionPdf(key)
      if (fetched.ok) {
        return new NextResponse(new Uint8Array(fetched.body), {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${rx.id}.pdf"`,
            "Cache-Control": "private, no-store",
          },
        })
      }
    }

    // Regenerate from stored fields if S3 object missing
    let detail: Record<string, unknown> = {
      first_name: rx.patientName.split(" ")[0] ?? "",
      last_name: rx.patientName.split(" ").slice(1).join(" ") || "",
      date_of_birth: rx.patientDob,
      phone: rx.patientPhone,
      email: rx.patientEmail,
      shipping_address: rx.patientAddress,
      shipping_city: rx.patientCity,
      shipping_state: rx.patientState,
      shipping_zip: rx.patientZip,
    }

    if (isAdminIntakeServiceType(rx.serviceType)) {
      const live = await getClinicalIntakeDetail(rx.serviceType, rx.intakeId)
      if (live) detail = live
    }

    const serviceLabel = isAdminIntakeServiceType(rx.serviceType)
      ? SERVICE_LABELS[rx.serviceType]
      : rx.serviceType

    const pdf = await buildPrescriptionPdf({
      intakeId: rx.intakeId,
      serviceLabel,
      rx: {
        medicationName: rx.medicationName,
        strength: rx.strength,
        directions: rx.directions,
        quantity: rx.quantity,
        refills: rx.refills,
      },
      detail,
      signedName: rx.clinicianEsignName,
      signedAt: rx.signedAt,
    })

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${rx.id}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load prescription PDF"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
