import { NextRequest, NextResponse } from "next/server"
import { staffAuth } from "@/lib/auth"
import { sql } from "@/lib/db"
import {
  derivePricingFields,
  validateMedicationInput,
  type AdminMedicationInput,
} from "@/lib/admin-medications"

async function requireAdmin(request: Request) {
  const staff = await staffAuth.getCurrentStaff(request)
  if (!staff || staff.role !== "admin") return null
  return staff
}

export async function GET(request: NextRequest) {
  try {
    if (!(await requireAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")?.trim() || ""
    const active = searchParams.get("active")
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)))
    const offset = (page - 1) * limit

    const conditions: string[] = []
    const params: unknown[] = []
    let paramIndex = 1

    if (active === "true") {
      conditions.push(`is_active IS NOT FALSE`)
    } else if (active === "false") {
      conditions.push(`is_active = false`)
    }

    if (q) {
      const pattern = `%${q.toLowerCase()}%`
      conditions.push(
        `(LOWER(name) LIKE $${paramIndex} OR LOWER(COALESCE(generic_name, '')) LIKE $${paramIndex} OR LOWER(COALESCE(ndc, '')) LIKE $${paramIndex})`
      )
      params.push(pattern)
      paramIndex++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

    const countRows = await sql(
      `SELECT COUNT(*)::int AS total FROM medications ${whereClause}`,
      params
    )
    const total = Number(countRows[0]?.total ?? 0)

    const medications = await sql(
      `SELECT id, name, generic_name, brand_name, strength, dosage_form, ndc,
              per_unit_cost, acquisition_cost, our_price, typical_retail_price,
              package_quantity, is_generic, is_active, category, description, days_supply,
              created_at, updated_at
       FROM medications
       ${whereClause}
       ORDER BY name ASC, strength ASC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    )

    return NextResponse.json({
      medications,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to list medications"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await requireAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await request.json()) as AdminMedicationInput
    const validationError = validateMedicationInput(body)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const ndc = body.ndc?.trim() ? body.ndc.replace(/\D/g, "") : null
    if (ndc) {
      const existing = await sql("SELECT id FROM medications WHERE ndc = $1 LIMIT 1", [ndc])
      if (existing.length > 0) {
        return NextResponse.json({ error: "A medication with this NDC already exists" }, { status: 409 })
      }
    }

    const { perUnit, ourPrice, typicalRetail, daysSupply } = derivePricingFields(body)
    const packageQty = body.package_quantity && body.package_quantity > 0 ? body.package_quantity : 1

    const rows = await sql(
      `INSERT INTO medications (
        name, generic_name, brand_name, strength, dosage_form, ndc,
        per_unit_cost, acquisition_cost, our_price, typical_retail_price,
        package_quantity, is_generic, is_active, category, description, days_supply,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10,
        $11, $12, true, $13, $14, $15,
        NOW(), NOW()
      )
      RETURNING id, name, generic_name, brand_name, strength, dosage_form, ndc,
                per_unit_cost, acquisition_cost, our_price, typical_retail_price,
                package_quantity, is_generic, is_active, category, description, days_supply,
                created_at, updated_at`,
      [
        body.name.trim(),
        body.generic_name?.trim() || null,
        body.brand_name?.trim() || null,
        body.strength?.trim() || null,
        body.dosage_form?.trim().toUpperCase() || "TABLET",
        ndc,
        perUnit,
        body.acquisition_cost ?? null,
        ourPrice,
        typicalRetail,
        packageQty,
        body.is_generic !== false,
        body.category?.trim() || null,
        body.description?.trim() || null,
        daysSupply,
      ]
    )

    return NextResponse.json({ medication: rows[0] }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create medication"
    if (message.includes("duplicate") || message.includes("unique")) {
      return NextResponse.json({ error: "A medication with this NDC already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
