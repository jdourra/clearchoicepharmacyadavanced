import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { CashPayEdTabletPage } from "@/components/cash-pay-ed-tablet-page"
import {
  CASH_PAY_ED_TABLET_ALIAS_SLUGS,
  getCashPayEdTablet,
  resolveCashPayEdTabletSlug,
} from "@/lib/cash-pay-ed-tablets"
import { SITE_URL, buildFaqJsonLd } from "@/lib/clinical-seo"

type PageProps = {
  params: Promise<{ drug: string }>
}

export function generateStaticParams() {
  return CASH_PAY_ED_TABLET_ALIAS_SLUGS.map((drug) => ({ drug }))
}

function buildAliasUrl(slug: string) {
  return `${SITE_URL}/${slug.toLowerCase()}`
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { drug } = await params
  const resolved = resolveCashPayEdTabletSlug(drug)
  if (!resolved) return { title: "Medication Not Found | Clear Choice Pharmacy" }

  const guide = getCashPayEdTablet(resolved)!
  const aliasUrl = buildAliasUrl(drug)

  return {
    title: guide.pageTitle,
    description: guide.metaDescription,
    keywords: guide.keywords,
    alternates: { canonical: aliasUrl },
    openGraph: {
      title: guide.pageTitle,
      description: guide.metaDescription,
      url: aliasUrl,
      type: "website",
    },
  }
}

export default async function CashPayEdAliasPage({ params }: PageProps) {
  const { drug } = await params
  const resolved = resolveCashPayEdTabletSlug(drug)
  if (!resolved) notFound()

  const guide = getCashPayEdTablet(resolved)!
  const aliasUrl = buildAliasUrl(drug)
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: guide.h1,
    description: guide.metaDescription,
    url: aliasUrl,
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
