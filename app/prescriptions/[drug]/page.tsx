import type { Metadata } from "next"
import { notFound, permanentRedirect } from "next/navigation"
import { CashPayEdTabletPage } from "@/components/cash-pay-ed-tablet-page"
import {
  CASH_PAY_ED_TABLET_SLUGS,
  getCashPayEdTablet,
  resolveCashPayEdTabletSlug,
} from "@/lib/cash-pay-ed-tablets"
import { SITE_URL, buildFaqJsonLd } from "@/lib/clinical-seo"

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

  // Canonicalize brand aliases (/prescriptions/cialis → /prescriptions/tadalafil)
  if (drug.toLowerCase() !== resolved) {
    permanentRedirect(`/prescriptions/${resolved}`)
  }

  const guide = getCashPayEdTablet(resolved)!
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: guide.h1,
    description: guide.metaDescription,
    url: `${SITE_URL}${guide.path}`,
    about: {
      "@type": "Drug",
      name: guide.genericName,
      alternateName: guide.brandReference,
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd(guide.faqs)) }}
      />
      <CashPayEdTabletPage guide={guide} />
    </>
  )
}
