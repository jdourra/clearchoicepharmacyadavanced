import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { RejuvenationVialProductDetail } from "@/components/rejuvenation-vial-product-detail"
import { getVialProductContent, getVialProductPageTitle } from "@/lib/rejuvenation-vial-product-content"
import {
  VIAL_PRODUCT_IDS,
  getRejuvenationVial,
  isVialProductId,
} from "@/lib/rejuvenation-vial-catalog"
import { SITE_URL } from "@/lib/clinical-seo"

type PageProps = {
  params: Promise<{ vial: string }>
}

export function generateStaticParams() {
  return VIAL_PRODUCT_IDS.map((vial) => ({ vial }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { vial: slug } = await params
  if (!isVialProductId(slug)) {
    return { title: "Vial Kit Not Found | Clear Choice Pharmacy" }
  }

  const vial = getRejuvenationVial(slug)!
  return {
    title: getVialProductPageTitle(vial),
    description: `${vial.title} — ${vial.supply}. $${vial.price} per kit with physician review and pharmacy fulfillment.`,
    alternates: { canonical: `${SITE_URL}/iv-rejuvenation/vials/${slug}` },
    openGraph: {
      title: getVialProductPageTitle(vial),
      description: vial.description,
      url: `${SITE_URL}/iv-rejuvenation/vials/${slug}`,
      type: "website",
      images: [{ url: vial.image.src, alt: vial.image.alt }],
    },
  }
}

export default async function RejuvenationVialProductPage({ params }: PageProps) {
  const { vial: slug } = await params
  if (!isVialProductId(slug)) notFound()

  const vial = getRejuvenationVial(slug)
  if (!vial) notFound()

  const content = getVialProductContent(slug, vial)

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: vial.title,
    description: vial.description,
    image: `${SITE_URL}${vial.image.src}`,
    brand: { "@type": "Brand", name: "Clear Choice Pharmacy" },
    offers: {
      "@type": "Offer",
      price: vial.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/iv-rejuvenation/vials/${slug}`,
    },
  }

  return (
    <div className="flex min-h-screen flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <SiteHeader />
      <main className="flex-1 bg-background">
        <RejuvenationVialProductDetail vial={vial} content={content} />
      </main>
      <SiteFooter />
    </div>
  )
}
