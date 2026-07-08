import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSessionIdFromRequest } from "@/lib/server-session"

export async function GET(request: Request) {
  try {
    const sessionId = getSessionIdFromRequest(request)

    if (!sessionId) {
      return NextResponse.json({ user: null })
    }

    const sessions = await sql(
      `SELECT s.*
       FROM sessions s
       INNER JOIN patients p ON p.id = s.user_id
       WHERE s.id = $1
         AND s.expires_at > now()
         AND s.user_type = 'patient'`,
      [sessionId]
    )

    if (sessions.length === 0) {
      return NextResponse.json({ user: null })
    }

    const session = sessions[0]
    const patients = await sql(
      "SELECT id, email, first_name, last_name, phone, date_of_birth, address_line1, city, state, zip_code, created_at FROM patients WHERE id = $1",
      [session.user_id]
    )

    if (patients.length === 0) {
      return NextResponse.json({ user: null })
    }

    const p = patients[0]
    return NextResponse.json({
      user: {
        id: p.id,
        email: p.email,
        name: `${p.first_name} ${p.last_name}`.trim(),
        firstName: p.first_name || "",
        lastName: p.last_name || "",
        phone: p.phone || "",
        dob: p.date_of_birth || "",
        address: p.address_line1 || "",
        city: p.city || "",
        state: p.state || "",
        zip: p.zip_code || "",
        created_at: p.created_at,
      }
    })
  } catch {
    return NextResponse.json({ user: null })
  }
}
