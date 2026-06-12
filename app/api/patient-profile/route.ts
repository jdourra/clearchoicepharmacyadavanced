import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getUserIdFromRequest } from "@/lib/server-session"

export async function PATCH(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const firstName = String(body.firstName || "").trim()
    const lastName = String(body.lastName || "").trim()
    const phone = body.phone != null ? String(body.phone).trim() : ""
    const dob = body.dob != null ? String(body.dob).trim() : ""
    const address = body.address != null ? String(body.address).trim() : ""
    const city = body.city != null ? String(body.city).trim() : ""
    const state = body.state != null ? String(body.state).trim().toUpperCase() : ""
    const zip = body.zip != null ? String(body.zip).trim() : ""

    if (!firstName || !lastName) {
      return NextResponse.json({ error: "First and last name are required" }, { status: 400 })
    }

    if (state && state.length !== 2) {
      return NextResponse.json({ error: "State must be a 2-letter code" }, { status: 400 })
    }

    const rows = await sql(
      `UPDATE patients
       SET first_name = $1,
           last_name = $2,
           phone = $3,
           date_of_birth = $4,
           address_line1 = $5,
           city = $6,
           state = $7,
           zip_code = $8
       WHERE id = $9
       RETURNING id, email, first_name, last_name, phone, date_of_birth, address_line1, city, state, zip_code, created_at`,
      [
        firstName,
        lastName,
        phone || null,
        dob || null,
        address || null,
        city || null,
        state || null,
        zip || null,
        userId,
      ]
    )

    if (rows.length === 0) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    const p = rows[0]
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
      },
    })
  } catch (error) {
    console.error("[patient-profile] Update error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
