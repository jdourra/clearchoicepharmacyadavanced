import { sql } from "@/lib/db"

export async function GET() {
  try {
    const data = await sql("SELECT id, name, strength FROM medications LIMIT 5", [])
    const countResult = await sql("SELECT count(*) as total FROM medications", [])

    return Response.json({
      success: true,
      sampleData: data,
      totalCount: Number(countResult[0]?.total || 0),
      message: "Neon database connection working",
    })
  } catch (err: any) {
    console.error("[v0] Database test exception:", err)
    return Response.json({ success: false, error: err.message }, { status: 500 })
  }
}
