import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { staffAuth } from "@/lib/auth"
import { canReviewClinicalIntakesStaff } from "@/lib/staff-roles"

export async function GET(request: Request) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!canReviewClinicalIntakesStaff(staff)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const rows = await sql(
      `SELECT DISTINCT ON (LOWER(email))
         id,
         patient_id,
         email,
         first_name,
         last_name,
         selected_program,
         created_at
       FROM weight_loss_intake
       WHERE email IS NOT NULL AND email <> ''
       ORDER BY LOWER(email), created_at DESC
       LIMIT 200`,
      []
    ).catch(() => [])

    const patients = rows.map((r: Record<string, unknown>) => {
      const email = String(r.email ?? "").toLowerCase()
      const patientId = r.patient_id != null ? String(r.patient_id) : ""
      return {
        patientKey: patientId || email,
        name: `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim() || email,
        email,
        latestProgram: String(r.selected_program ?? "weight_loss"),
        latestAt: String(r.created_at ?? new Date().toISOString()),
      }
    })

    return NextResponse.json({ patients })
  } catch (error) {
    console.error("[doctor/patients]", error)
    return NextResponse.json({ error: "Failed to list patients" }, { status: 500 })
  }
}
