import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { createWeightLossReorder } from "@/lib/patient-glp-reorder"
import { getUserIdFromRequest } from "@/lib/server-session"

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: "Please sign in to reorder." }, { status: 401 })
    }

    const patients = await sql("SELECT id, email FROM patients WHERE id = $1", [userId])
    if (patients.length === 0) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    const body = await request.json().catch(() => ({}))
    const intakeId = typeof body.intakeId === "string" ? body.intakeId : ""
    const note = typeof body.note === "string" ? body.note : ""

    const result = await createWeightLossReorder({
      patientId: String(patients[0].id),
      email: String(patients[0].email),
      sourceIntakeId: intakeId,
      note,
    })

    return NextResponse.json({
      ok: true,
      id: result.id,
      summary: result.summary,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not submit the reorder."
    const status = /not found|not ready|already waiting|Choose the order|under 2000/.test(message) ? 400 : 500
    if (status === 500) console.error("[patient-portal/reorder]", error)
    return NextResponse.json({ error: message }, { status })
  }
}
