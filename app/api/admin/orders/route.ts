import { NextResponse } from "next/server"
import { staffAuth, orders } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const staff = await staffAuth.getCurrentStaff(request)
    if (!staff || staff.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { searchParams } = new URL(request.url)
    const limit = Math.min(Number(searchParams.get("limit")) || 200, 500)
    const offset = Number(searchParams.get("offset")) || 0
    const allOrders = await orders.getAllOrders(limit, offset)
    return NextResponse.json({ orders: allOrders })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
