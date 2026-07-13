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

  return {
    title: getEdProductPageTitle(product),
    description:
      slug === "tadalafil-daily"
        ? `Tadalafil ED troches (Cialis active ingredient) from $${startingPrice}/mo. Up to 36-hour support. Physician review and discreet pharmacy fulfillment.`
        : slug === "sildenafil-fast"
          ? `Sildenafil ED troches (Viagra active ingredient) from $${startingPrice}/mo. Fast-acting sublingual. Physician review and discreet fulfillment.`
          : `Sildenafil + Tadalafil combination ED troches from $${startingPrice}/mo. Dual-action support with physician review.`,
    keywords:
      slug === "tadalafil-daily"
        ? ["tadalafil", "cialis", "ED medication", "erectile dysfunction"]
        : slug === "sildenafil-fast"
          ? ["sildenafil", "viagra", "ED medication", "erectile dysfunction"]
          : ["sildenafil", "tadalafil", "ED medication", "combination troche"],
    alternates: {
      canonical: `${SITE_URL}/mens-health/ed/${slug}`,
    },
    openGraph: {
      title: getEdProductPageTitle(product),
      description: product.description,
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
    offers: product.pricing.map((tier) => ({
      "@type": "Offer",
      price: tier.totalBilled,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      name: `${tier.plan} billing`,
      url: `${SITE_URL}/mens-health/ed/${slug}`,
    })),
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
