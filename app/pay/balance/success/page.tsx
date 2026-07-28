import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Payment received | Clear Choice Pharmacy",
  robots: { index: false, follow: false },
}

export default async function BalancePaySuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ request?: string }>
}) {
  const { request } = await searchParams

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-2" />
          <CardTitle>Payment received</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center text-sm text-muted-foreground">
          <p>
            Thank you. Your payment to Clear Choice Pharmacy was submitted successfully.
            {request ? ` Reference: ${request}` : null}
          </p>
          <p>A receipt may also appear on your card statement from Stripe.</p>
          <Button asChild className="w-full">
            <Link href="/">Return to Clear Choice Pharmacy</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
