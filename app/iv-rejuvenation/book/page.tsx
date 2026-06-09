import type { Metadata } from "next"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { IvBookingForm } from "@/components/iv-booking-form"
import { Button } from "@/components/ui/button"
import { getIvPackage } from "@/lib/iv-catalog"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://clearchoicepharmacy.com"

export const metadata: Metadata = {
  title: "Book Mobile IV Dispatch | Clear Choice IV & Rejuvenation",
  description:
    "Schedule mobile IV therapy at your home, office, or hotel in Metro Detroit. Select your drip, choose a time window, and request licensed RN dispatch.",
  alternates: { canonical: `${SITE_URL}/iv-rejuvenation/book` },
}

type PageProps = {
  searchParams: Promise<{ package?: string; boosters?: string }>
}

export default async function IvBookPage({ searchParams }: PageProps) {
  const params = await searchParams
  const packageId = params.package || ""
  const boosterIds = params.boosters ? params.boosters.split(",").filter(Boolean) : []
  const selectedPackage = packageId ? getIvPackage(packageId) : null

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-12 lg:py-16">
          <div className="mb-8">
            <p className="text-sm font-medium text-sky-600 mb-2">Clear Choice IV &amp; Rejuvenation</p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">IV Therapy Intake</h1>
            <p className="mt-3 text-slate-600">
              Complete this form for telehealth provider review. Approved prescriptions are sent to Clear Choice
              Pharmacy for compounding before mobile RN dispatch.
            </p>
          </div>

          {!selectedPackage ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
              <p className="text-slate-700 mb-4">Please select an IV package before scheduling.</p>
              <Button asChild className="bg-sky-500 hover:bg-sky-400">
                <Link href="/iv-rejuvenation#iv-menu">Choose Your Drip</Link>
              </Button>
            </div>
          ) : (
            <IvBookingForm packageId={packageId} boosterIds={boosterIds} />
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
