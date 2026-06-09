"use client"

import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Plus, Minus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Medication } from "@/lib/medications-database"

interface CartItem {
  id: string
  medication_id: string
  quantity: number
  price: number
  medication: Medication
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const cart = sessionStorage.getItem("cart")
    if (cart) {
      const items = JSON.parse(cart)
      setCartItems(items)
    }
    setLoading(false)
  }, [])

  const updateQuantity = (itemId: string, newQty: number) => {
    const item = cartItems.find((i) => i.id === itemId)
    if (!item || !item.medication) return

    const minQty = item.medication.days_supply ? 1 : 30
    const maxQty = item.medication.days_supply ? 3 : 90

    if (newQty < minQty || newQty > maxQty) return

    const perUnitCost = item.medication.per_unit_cost
    const newPrice = perUnitCost * newQty * 1.15 + 5

    const updated = cartItems.map((i) => (i.id === itemId ? { ...i, quantity: newQty, price: newPrice } : i))

    setCartItems(updated)
    sessionStorage.setItem("cart", JSON.stringify(updated))
  }

  const removeItem = (itemId: string) => {
    const updated = cartItems.filter((item) => item.id !== itemId)
    setCartItems(updated)
    sessionStorage.setItem("cart", JSON.stringify(updated))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0)
  const total = subtotal

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 py-12 flex items-center justify-center">
          <p>Loading cart...</p>
        </main>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 py-12">
          <div className="container max-w-4xl mx-auto px-4">
            <Card className="p-12 text-center">
              <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
              <p className="text-sm text-muted-foreground mb-8">Start shopping to add medications to your cart</p>
              <Button asChild>
                <Link href="/">Search Medications</Link>
              </Button>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 py-8 md:py-12">
        <div className="container max-w-5xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Shopping Cart</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="p-5">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{item.medication.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {item.medication.strength} {item.medication.form}
                      </p>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center border rounded-lg">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.medication.days_supply ? item.quantity - 1 : item.quantity - 30,
                              )
                            }
                            disabled={item.quantity <= (item.medication.days_supply ? 1 : 30)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const val = Number.parseInt(e.target.value) || item.quantity
                              updateQuantity(item.id, val)
                            }}
                            className="w-16 h-8 text-center border-0 focus-visible:ring-0"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.medication.days_supply ? item.quantity + 1 : item.quantity + 30,
                              )
                            }
                            disabled={item.quantity >= (item.medication.days_supply ? 3 : 90)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {item.quantity} {item.medication.form.toLowerCase()}
                          {item.quantity !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary mb-2">${item.price.toFixed(2)}</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div>
              <Card className="p-6 sticky top-20">
                <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Subtotal ({cartItems.length} item{cartItems.length !== 1 ? "s" : ""}):
                    </span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-bold">Total:</span>
                    <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>

                <Button size="lg" className="w-full mb-4" onClick={() => router.push("/checkout")}>
                  Proceed to Checkout
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="w-full mb-4 bg-transparent"
                  onClick={() => router.push("/")}
                >
                  Continue Shopping
                </Button>

                <div className="text-xs text-muted-foreground space-y-2 pt-4 border-t">
                  <p className="font-semibold">Cash payment only</p>
                  <p>Upload prescription or have your doctor e-prescribe.</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
