import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getUserIdFromRequest } from "@/lib/server-session"
import { getTherapyTimelineForPatient } from "@/lib/patient-therapy-checkin"

export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const patients = await sql(
      "SELECT id, email, first_name, last_name FROM patients WHERE id = $1",
      [userId]
    )
    if (patients.length === 0) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    const p = patients[0]
    const timeline = await getTherapyTimelineForPatient({
      patientId: String(p.id),
      email: String(p.email),
      patientName: `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim(),
    })

    return NextResponse.json({ timeline })
  } catch (error) {
    console.error("[patient-therapy] GET", error)
    return NextResponse.json({ error: "Failed to load therapy timeline" }, { status: 500 })
  }
}
