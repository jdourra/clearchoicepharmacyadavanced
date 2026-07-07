import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { IvPackageProductDetail } from "@/components/iv-package-product-detail"
import { getIvProductContent, getIvProductPageTitle } from "@/lib/iv-product-content"
import { IV_PACKAGE_IDS, IV_TRAVEL_FEE, getIvPackage, isIvPackageId } from "@/lib/iv-catalog"
import { SITE_URL } from "@/lib/clinical-seo"

type PageProps = {
  params: Promise<{ package: string }>
}

export function generateStaticParams() {
  return IV_PACKAGE_IDS.map((pkg) => ({ package: pkg }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { package: slug } = await params
  if (!isIvPackageId(slug)) {
    return { title: "IV Package Not Found | Clear Choice Pharmacy" }
  }

  const pkg = getIvPackage(slug)!
  return {
    title: getIvProductPageTitle(pkg),
    description: `${pkg.title} — ${pkg.sessionLabel}. $${pkg.price} per session (+ $${IV_TRAVEL_FEE} dispatch). Pharmacy-formulated mobile IV in Metro Detroit.`,
    alternates: { canonical: `${SITE_URL}/iv-rejuvenation/packages/${slug}` },
    openGraph: {
      title: getIvProductPageTitle(pkg),
      description: pkg.description,
      url: `${SITE_URL}/iv-rejuvenation/packages/${slug}`,
      type: "website",
      images: [{ url: pkg.image.src, alt: pkg.image.alt }],
    },
  }
}

export default async function IvPackageProductPage({ params }: PageProps) {
  const { package: slug } = await params
  if (!isIvPackageId(slug)) notFound()

  const pkg = getIvPackage(slug)
  if (!pkg) notFound()

  const content = getIvProductContent(slug)

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: pkg.title,
    description: pkg.description,
    image: `${SITE_URL}${pkg.image.src}`,
    brand: { "@type": "Brand", name: "Clear Choice Pharmacy" },
    offers: {
      "@type": "Offer",
      price: pkg.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/iv-rejuvenation/packages/${slug}`,
    },
  }

  return (
    <div className="flex min-h-screen flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <SiteHeader />
      <main className="flex-1 bg-background">
        <IvPackageProductDetail pkg={pkg} content={content} />
      </main>
      <SiteFooter />
    </div>
  )
}
