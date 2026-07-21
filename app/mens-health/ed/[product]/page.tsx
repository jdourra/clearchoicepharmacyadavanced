import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { EdProductDetail } from "@/components/ed-product-detail"
import { ED_PRODUCT_CONTENT, getEdProductPageTitle } from "@/lib/ed-product-content"
import {
  ED_PRODUCT_IDS,
  getEdStartingMonthlyPrice,
  getEdTrocheProduct,
  isEdProductId,
} from "@/lib/ed-troche-catalog"
import { SITE_URL } from "@/lib/clinical-seo"

type PageProps = {
  params: Promise<{ product: string }>
}

export function generateStaticParams() {
  return ED_PRODUCT_IDS.map((product) => ({ product }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { product: slug } = await params
  if (!isEdProductId(slug)) {
    return { title: "Product Not Found | Clear Choice Pharmacy" }
  }

  const product = getEdTrocheProduct(slug)!
  const startingPrice = getEdStartingMonthlyPrice(product)
  const title = getEdProductPageTitle(product)
  const description =
    slug === "tadalafil-daily"
      ? `Tadalafil ED troches (Cialis active ingredient) from $${startingPrice}/mo. Up to 36-hour support. Physician review and discreet pharmacy fulfillment for Michigan patients.`
      : slug === "sildenafil-fast"
        ? `Sildenafil ED troches (Viagra active ingredient) from $${startingPrice}/mo. Fast-acting sublingual. Physician review and discreet fulfillment for Michigan patients.`
        : `Sildenafil + Tadalafil combination ED troches from $${startingPrice}/mo. Dual-action support with physician review for Michigan patients.`

  return {
    title,
    description,
    keywords:
      slug === "tadalafil-daily"
        ? ["tadalafil", "cialis", "ED medication", "erectile dysfunction", "tadalafil cost"]
        : slug === "sildenafil-fast"
          ? ["sildenafil", "viagra", "ED medication", "erectile dysfunction", "sildenafil cost"]
          : ["sildenafil", "tadalafil", "ED medication", "combination troche"],
    alternates: {
      canonical: `${SITE_URL}/mens-health/ed/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/mens-health/ed/${slug}`,
      type: "website",
      images: [{ url: product.image.src, alt: product.image.alt }],
    },
  }
}

export default async function EdProductPage({ params }: PageProps) {
  const { product: slug } = await params
  if (!isEdProductId(slug)) {
    notFound()
  }

  const product = getEdTrocheProduct(slug)
  if (!product) {
    notFound()
  }

  const content = ED_PRODUCT_CONTENT[slug]
  const lowPrice = Math.min(...product.pricing.map((p) => p.pricePerMonth))
  const highPrice = Math.max(...product.pricing.map((p) => p.pricePerMonth))

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: content.homeKitTitle,
    description: product.description,
    image: `${SITE_URL}${product.image.src}`,
    brand: {
      "@type": "Brand",
      name: "Clear Choice Pharmacy",
    },
    offers: {
      "@type": "AggregateOffer",
      lowPrice,
      highPrice,
      priceCurrency: "USD",
      offerCount: product.pricing.length,
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/mens-health/ed/${slug}`,
      offers: product.pricing.map((tier) => ({
        "@type": "Offer",
        price: tier.pricePerMonth,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        name: `${tier.plan} billing`,
        url: `${SITE_URL}/mens-health/ed/${slug}`,
      })),
    },
  }

  return (
    <div className="flex min-h-screen flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <SiteHeader />
      <main className="flex-1 bg-background">
        <EdProductDetail product={product} content={content} />
      </main>
      <SiteFooter />
    </div>
  )
}
