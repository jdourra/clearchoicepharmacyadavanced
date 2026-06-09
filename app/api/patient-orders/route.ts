import { NextResponse } from "next/server"
import { orders } from "@/lib/auth"
import { getUserIdFromRequest } from "@/lib/server-session"

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request)
    const { items, total_amount, delivery_method, notes } = await request.json()
    const orderItems = (items || []).map((item: any) => ({
      drug_name: item.medication_name || item.drug_name || "Unknown",
      quantity: item.quantity || 1,
      price: item.unit_price || item.price || 0,
    }))
    const order = await orders.createOrder(userId, orderItems, total_amount || 0, delivery_method || "pickup", notes || "")
    return NextResponse.json({ order })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request)
    if (!userId) return NextResponse.json({ orders: [] })
    const userOrders = await orders.getOrdersForPatient(userId)
    return NextResponse.json({ orders: userOrders })
  } catch {
    return NextResponse.json({ orders: [] })
  }
}
