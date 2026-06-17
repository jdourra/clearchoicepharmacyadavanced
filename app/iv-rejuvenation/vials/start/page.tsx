import type { Metadata } from "next"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { RejuvenationVialIntakeForm } from "@/components/rejuvenation-vial-intake-form"
import { Button } from "@/components/ui/button"
import { getRejuvenationVial } from "@/lib/rejuvenation-vial-catalog"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://clearchoicepharmacy.com"

export const metadata: Metadata = {
  title: "Rejuvenation Vial Consultation | Clear Choice IV & Rejuvenation",
  description:
    "Request physician-reviewed injectable vitamin homekits from Clear Choice Pharmacy. B12, NAD+, glutathione, and more — shipped to your door after telehealth approval.",
  alternates: { canonical: `${SITE_URL}/iv-rejuvenation/vials/start` },
}

type PageProps = {
  searchParams: Promise<{ vial?: string }>
}

export default async function RejuvenationVialStartPage({ searchParams }: PageProps) {
  const params = await searchParams
  const vialId = params.vial || ""
  const selectedVial = vialId ? getRejuvenationVial(vialId) : null

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-12 lg:py-16">
          <div className="mb-8">
            <p className="text-sm font-medium text-sky-600 mb-2">Clear Choice IV &amp; Rejuvenation</p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Rejuvenation Vial Intake</h1>
            <p className="mt-3 text-slate-600">
              Complete this form for telehealth provider review. Approved prescriptions are compounded at Clear
              Choice Pharmacy and shipped as a 30-day home injection kit.
            </p>
          </div>

          {!selectedVial ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
              <p className="text-slate-700 mb-4">Please select a rejuvenation vial kit before starting your intake.</p>
              <Button asChild className="bg-sky-500 hover:bg-sky-400">
                <Link href="/iv-rejuvenation#vial-menu">Choose a Vial Kit</Link>
              </Button>
            </div>
          ) : (
            <RejuvenationVialIntakeForm vialId={vialId} />
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
