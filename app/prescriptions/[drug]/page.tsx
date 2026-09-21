import type { Metadata } from "next"
import { notFound, permanentRedirect } from "next/navigation"
import {
  CASH_PAY_ED_TABLET_SLUGS,
  getCashPayEdTablet,
  resolveCashPayEdTabletSlug,
} from "@/lib/cash-pay-ed-tablets"
import { SITE_URL } from "@/lib/clinical-seo"

type PageProps = {
  params: Promise<{ drug: string }>
}

export function generateStaticParams() {
  return CASH_PAY_ED_TABLET_SLUGS.map((drug) => ({ drug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { drug } = await params
  const guide = getCashPayEdTablet(drug)
  if (!guide) return { title: "Medication Not Found | Clear Choice Pharmacy" }

  return {
    title: guide.pageTitle,
    description: guide.metaDescription,
    keywords: guide.keywords,
    alternates: { canonical: `${SITE_URL}${guide.path}` },
    openGraph: {
      title: guide.pageTitle,
      description: guide.metaDescription,
      url: `${SITE_URL}${guide.path}`,
      type: "website",
    },
  }
}

export default async function CashPayEdDrugPage({ params }: PageProps) {
  const { drug } = await params
  const resolved = resolveCashPayEdTabletSlug(drug)
  if (!resolved) notFound()

  const guide = getCashPayEdTablet(resolved)!
  permanentRedirect(guide.path)
}
