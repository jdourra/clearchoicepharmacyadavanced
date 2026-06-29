import { NextRequest, NextResponse } from "next/server"
import { staffAuth } from "@/lib/auth"
import { sql } from "@/lib/db"
import {
  derivePricingFields,
  validateMedicationInput,
  type AdminMedicationInput,
} from "@/lib/admin-medications"

async function requireAdmin(request: NextRequest) {
  const staff = await staffAuth.getCurrentStaff(request)
  if (!staff || staff.role !== "admin") return null
  return staff
}

const SELECT_FIELDS = `id, name, generic_name, brand_name, strength, dosage_form, ndc,
  per_unit_cost, acquisition_cost, our_price, typical_retail_price,
  package_quantity, is_generic, is_active, category, description, days_supply,
  created_at, updated_at`

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const rows = await sql(`SELECT ${SELECT_FIELDS} FROM medications WHERE id = $1`, [id])
    if (rows.length === 0) {
      return NextResponse.json({ error: "Medication not found" }, { status: 404 })
    }

    return NextResponse.json({ medication: rows[0] })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch medication"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const existing = await sql(`SELECT ${SELECT_FIELDS} FROM medications WHERE id = $1`, [id])
    if (existing.length === 0) {
      return NextResponse.json({ error: "Medication not found" }, { status: 404 })
    }

    const body = (await request.json()) as AdminMedicationInput
    const current = existing[0] as Record<string, unknown>

    const merged: AdminMedicationInput = {
      name: body.name ?? String(current.name ?? ""),
      generic_name: body.generic_name !== undefined ? body.generic_name : (current.generic_name as string | null),
      brand_name: body.brand_name !== undefined ? body.brand_name : (current.brand_name as string | null),
      strength: body.strength !== undefined ? body.strength : (current.strength as string | null),
      dosage_form: body.dosage_form !== undefined ? body.dosage_form : (current.dosage_form as string | null),
      ndc: body.ndc !== undefined ? body.ndc : (current.ndc as string | null),
      per_unit_cost:
        body.per_unit_cost !== undefined
          ? body.per_unit_cost
          : current.per_unit_cost != null
            ? Number(current.per_unit_cost)
            : null,
      acquisition_cost:
        body.acquisition_cost !== undefined
          ? body.acquisition_cost
          : current.acquisition_cost != null
            ? Number(current.acquisition_cost)
            : null,
      our_price:
        body.our_price !== undefined
          ? body.our_price
          : current.our_price != null
            ? Number(current.our_price)
            : null,
      typical_retail_price:
        body.typical_retail_price !== undefined
          ? body.typical_retail_price
          : current.typical_retail_price != null
            ? Number(current.typical_retail_price)
            : null,
      package_quantity:
        body.package_quantity !== undefined
          ? body.package_quantity
          : current.package_quantity != null
            ? Number(current.package_quantity)
            : 1,
      is_generic: body.is_generic !== undefined ? body.is_generic : current.is_generic !== false,
      is_active: body.is_active !== undefined ? body.is_active : current.is_active !== false,
      category: body.category !== undefined ? body.category : (current.category as string | null),
      description: body.description !== undefined ? body.description : (current.description as string | null),
      days_supply:
        body.days_supply !== undefined
          ? body.days_supply
          : current.days_supply != null
            ? Number(current.days_supply)
            : 30,
    }

    const validationError = validateMedicationInput(merged)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const ndc = merged.ndc?.trim() ? merged.ndc.replace(/\D/g, "") : null
    if (ndc) {
      const duplicate = await sql("SELECT id FROM medications WHERE ndc = $1 AND id != $2 LIMIT 1", [ndc, id])
      if (duplicate.length > 0) {
        return NextResponse.json({ error: "A medication with this NDC already exists" }, { status: 409 })
      }
    }

    const { perUnit, ourPrice, typicalRetail, daysSupply } = derivePricingFields(merged)
    const packageQty = merged.package_quantity && merged.package_quantity > 0 ? merged.package_quantity : 1

    const rows = await sql(
      `UPDATE medications SET
        name = $1,
        generic_name = $2,
        brand_name = $3,
        strength = $4,
        dosage_form = $5,
        ndc = $6,
        per_unit_cost = $7,
        acquisition_cost = $8,
        our_price = $9,
        typical_retail_price = $10,
        package_quantity = $11,
        is_generic = $12,
        is_active = $13,
        category = $14,
        description = $15,
        days_supply = $16,
        updated_at = NOW()
      WHERE id = $17
      RETURNING ${SELECT_FIELDS}`,
      [
        merged.name.trim(),
        merged.generic_name?.trim() || null,
        merged.brand_name?.trim() || null,
        merged.strength?.trim() || null,
        merged.dosage_form?.trim().toUpperCase() || "TABLET",
        ndc,
        perUnit,
        merged.acquisition_cost ?? null,
        ourPrice,
        typicalRetail,
        packageQty,
        merged.is_generic !== false,
        merged.is_active !== false,
        merged.category?.trim() || null,
        merged.description?.trim() || null,
        daysSupply,
        id,
      ]
    )

    return NextResponse.json({ medication: rows[0] })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update medication"
    if (message.includes("duplicate") || message.includes("unique")) {
      return NextResponse.json({ error: "A medication with this NDC already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const rows = await sql(
      `UPDATE medications SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id`,
      [id]
    )
    if (rows.length === 0) {
      return NextResponse.json({ error: "Medication not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to deactivate medication"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
