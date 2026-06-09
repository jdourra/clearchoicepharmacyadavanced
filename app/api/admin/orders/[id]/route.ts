import { NextResponse } from "next/server"
import { staffAuth, orders } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const staff = await staffAuth.getCurrentStaff()
    if (!staff || staff.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { id } = await params
    const order = await orders.getOrderById(id)
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
    return NextResponse.json({ order })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const staff = await staffAuth.getCurrentStaff()
    if (!staff || staff.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { id } = await params
    const { status } = await request.json()
    const success = await orders.updateOrderStatus(id, status)
    return NextResponse.json({ success })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
