"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { DollarSign } from "lucide-react"

type PricingData = {
  id: string
  quantity: number
  base_price: number
  copay_price: number | null
  insurance_plan_id: string | null
  insurance_plans: {
    provider_name: string
    plan_name: string
    tier: string
  } | null
}

export function PricingComparison({
  pricing,
  medicationId,
  isAuthenticated,
}: {
  pricing: PricingData[]
  medicationId: string
  isAuthenticated: boolean
}) {
  // Group pricing by quantity
  const pricingByQuantity = pricing.reduce(
    (acc, price) => {
      if (!acc[price.quantity]) {
        acc[price.quantity] = []
      }
      acc[price.quantity].push(price)
      return acc
    },
    {} as Record<number, PricingData[]>,
  )

  const quantities = Object.keys(pricingByQuantity)
    .map(Number)
    .sort((a, b) => a - b)
  const [selectedQuantity, setSelectedQuantity] = useState(quantities[0])

  const currentPricing = pricingByQuantity[selectedQuantity] || []
  const cashPrice = currentPricing.find((p) => !p.insurance_plan_id)
  const insurancePrices = currentPricing.filter((p) => p.insurance_plan_id)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Transparent Pricing</h2>
        <p className="text-muted-foreground">Compare cash prices and insurance copays for different quantities</p>
      </div>

      <Tabs value={selectedQuantity.toString()} onValueChange={(v) => setSelectedQuantity(Number(v))}>
        <TabsList className="grid w-full grid-cols-3">
          {quantities.map((qty) => (
            <TabsTrigger key={qty} value={qty.toString()}>
              {qty} Day Supply
            </TabsTrigger>
          ))}
        </TabsList>

        {quantities.map((qty) => (
          <TabsContent key={qty} value={qty.toString()} className="space-y-6">
            {/* Cash Price */}
            {cashPrice && (
              <Card className="border-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Cash Price (No Insurance)</CardTitle>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
                      Best for uninsured
                    </Badge>
                  </div>
                  <CardDescription>Pay out of pocket without using insurance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2 mb-4">
                    <DollarSign className="h-6 w-6 text-primary" />
                    <span className="text-4xl font-bold">${cashPrice.base_price.toFixed(2)}</span>
                    <span className="text-muted-foreground">for {qty} days</span>
                  </div>
                  {isAuthenticated ? (
                    <Button asChild className="w-full">
                      <Link href={`/prescriptions/submit?medication=${medicationId}&quantity=${qty}`}>
                        Submit Prescription
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild variant="outline" className="w-full bg-transparent">
                      <Link href="/auth/sign-up">Sign up to submit prescription</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Insurance Prices */}
            <div>
              <h3 className="text-lg font-semibold mb-3">With Insurance Coverage</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {insurancePrices.map((price) => (
                  <Card key={price.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{price.insurance_plans?.provider_name}</CardTitle>
                      <CardDescription>
                        {price.insurance_plans?.plan_name}
                        <Badge variant="secondary" className="ml-2 capitalize">
                          {price.insurance_plans?.tier}
                        </Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold">${price.copay_price?.toFixed(2)}</span>
                          <span className="text-sm text-muted-foreground">copay</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Cash price: ${price.base_price.toFixed(2)}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
