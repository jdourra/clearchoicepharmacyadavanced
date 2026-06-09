import { NextResponse } from "next/server"
import { orders } from "@/lib/auth"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const order = await orders.getOrderById(id)
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
    return NextResponse.json({ order })
  } catch {
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}
