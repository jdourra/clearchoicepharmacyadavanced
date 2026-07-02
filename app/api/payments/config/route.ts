import { NextResponse } from "next/server"
import { getStripePublishableKey, isStripeConfigured } from "@/lib/stripe-env"

export async function GET() {
  const publishableKey = getStripePublishableKey()
  return NextResponse.json({
    configured: isStripeConfigured() && Boolean(publishableKey),
    hasSecretKey: isStripeConfigured(),
    hasPublishableKey: Boolean(publishableKey),
    publishableKey: publishableKey ?? null,
  })
}
