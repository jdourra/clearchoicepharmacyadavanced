import { NextRequest, NextResponse } from "next/server"
import { staffAuth } from "@/lib/auth"
import { canReviewClinicalIntakesStaff } from "@/lib/staff-roles"
import { sql } from "@/lib/db"

/**
 * Audit / retrieve weight-loss intakes by kit count and date.
 * Example: legacy 2-kit quarterly → GET ?kitCount=2&from=2025-01-01&to=2026-09-10
 */
export async function GET(request: NextRequest) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!canReviewClinicalIntakesStaff(staff)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await sql(
      `ALTER TABLE weight_loss_intake ADD COLUMN IF NOT EXISTS billing_kit_count INTEGER`,
      []
    ).catch(() => [])
    await sql(
      `ALTER TABLE weight_loss_intake ADD COLUMN IF NOT EXISTS billing_supply_label TEXT`,
      []
    ).catch(() => [])

    // Ensure existing quarterly rows without snapshot are marked as legacy 2-kit.
    await sql(
      `UPDATE weight_loss_intake
       SET billing_kit_count = 2,
           billing_supply_label = COALESCE(billing_supply_label, '60-day (2-kit) supply')
       WHERE selected_billing_plan = 'quarterly'
         AND billing_kit_count IS NULL`,
      []
    ).catch(() => [])

    const { searchParams } = new URL(request.url)
    const kitCountRaw = searchParams.get("kitCount")
    const kitCount = kitCountRaw != null ? Number(kitCountRaw) : 2
    const from = searchParams.get("from")?.trim() || null
    const to = searchParams.get("to")?.trim() || null
    const limit = Math.min(500, Math.max(1, Number(searchParams.get("limit") || 100)))

    if (!Number.isFinite(kitCount) || kitCount < 1) {
      return NextResponse.json({ error: "kitCount must be a positive number" }, { status: 400 })
    }

    const rows = await sql(
      `SELECT id, created_at, updated_at, first_name, last_name, email, phone,
              selected_program, selected_billing_plan, selected_dose_tier,
              billing_kit_count, billing_supply_label, payment_status, status
       FROM weight_loss_intake
       WHERE billing_kit_count = $1
         AND ($2::timestamptz IS NULL OR created_at >= $2::timestamptz)
         AND ($3::timestamptz IS NULL OR created_at < $3::timestamptz)
       ORDER BY created_at DESC
       LIMIT $4`,
      [kitCount, from, to, limit]
    )

    return NextResponse.json({
      kitCount,
      from,
      to,
      count: rows.length,
      intakes: rows,
      note:
        kitCount === 2
          ? "These intakes were sold as 60-day (2-kit) quarterly supply. New quarterly orders use 3 kits (90 days)."
          : undefined,
    })
  } catch (error) {
    console.error("[admin/weight-loss-billing-audit]", error)
    return NextResponse.json({ error: "Failed to load billing audit" }, { status: 500 })
  }
}
