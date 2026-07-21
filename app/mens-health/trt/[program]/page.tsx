import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { TrtProductDetail } from "@/components/trt-product-detail"
import { TRT_PRODUCT_CONTENT, getTrtProductPageTitle } from "@/lib/trt-product-content"
import {
  TRT_PROGRAM_IDS,
  getTrtProgram,
  getTrtStartingMonthlyPrice,
  isTrtProgramId,
} from "@/lib/trt-catalog"
import { SITE_URL } from "@/lib/clinical-seo"

type PageProps = {
  params: Promise<{ program: string }>
}

export function generateStaticParams() {
  return TRT_PROGRAM_IDS.map((program) => ({ program }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { program: slug } = await params
  if (!isTrtProgramId(slug)) {
    return { title: "Program Not Found | Clear Choice Pharmacy" }
  }

  const program = getTrtProgram(slug)!
  const startingPrice = getTrtStartingMonthlyPrice(program)
  const title = getTrtProductPageTitle(program)
  const description = `${program.name} for testosterone replacement therapy (TRT) from $${startingPrice}/mo. Physician supervision, medication, supplies, and Michigan shipping or pickup. Clear Choice Pharmacy, Novi.`

  return {
    title,
    description,
    keywords: [
      "TRT",
      "testosterone replacement therapy",
      "testosterone",
      "TRT cost",
      program.name.toLowerCase(),
      "low testosterone",
    ],
    alternates: {
      canonical: `${SITE_URL}/mens-health/trt/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/mens-health/trt/${slug}`,
      type: "website",
      images: [{ url: program.image.src, alt: program.image.alt }],
    },
  }
}

export default async function TrtProductPage({ params }: PageProps) {
  const { program: slug } = await params
  if (!isTrtProgramId(slug)) {
    notFound()
  }

  const program = getTrtProgram(slug)
  if (!program) {
    notFound()
  }

  const content = TRT_PRODUCT_CONTENT[slug]
  const lowPrice = getTrtStartingMonthlyPrice(program)
  const highPrice = Math.max(...program.pricing.map((p) => p.pricePerMonth))

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: content.homeKitTitle,
    description: program.description,
    image: `${SITE_URL}${program.image.src}`,
    brand: {
      "@type": "Brand",
      name: "Clear Choice Pharmacy",
    },
    offers: {
      "@type": "AggregateOffer",
      lowPrice,
      highPrice,
      priceCurrency: "USD",
      offerCount: program.pricing.length,
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/mens-health/trt/${slug}`,
      offers: program.pricing.map((tier) => ({
        "@type": "Offer",
        price: tier.pricePerMonth,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        name: `${tier.plan} billing`,
        url: `${SITE_URL}/mens-health/trt/${slug}`,
      })),
    },
  }

  return (
    <div className="flex min-h-screen flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <SiteHeader />
      <main className="flex-1 bg-background">
        <TrtProductDetail program={program} content={content} />
      </main>
      <SiteFooter />
    </div>
  )
}
