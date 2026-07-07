import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { WeightLossProductDetail } from "@/components/weight-loss-product-detail"
import { getWeightLossProgram, getWeightLossStartingKitPrice, getWeightLossKitQuote } from "@/lib/weight-loss-catalog"
import {
  WEIGHT_LOSS_PRODUCT_CONTENT,
  WEIGHT_LOSS_PRODUCT_SLUGS,
  getWeightLossProductPageTitle,
  isWeightLossProductSlug,
} from "@/lib/weight-loss-product-content"
import { SITE_URL } from "@/lib/clinical-seo"

type PageProps = {
  params: Promise<{ program: string }>
}

export function generateStaticParams() {
  return WEIGHT_LOSS_PRODUCT_SLUGS.map((program) => ({ program }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { program: slug } = await params
  if (!isWeightLossProductSlug(slug)) {
    return { title: "Program Not Found | Clear Choice Pharmacy" }
  }

  const program = getWeightLossProgram(slug)!
  const content = WEIGHT_LOSS_PRODUCT_CONTENT[slug]
  const startingPrice = getWeightLossStartingKitPrice(program)

  return {
    title: getWeightLossProductPageTitle(program),
    description: `${content.homeKitTitle} — ${content.purpose.slice(0, 100)}… Starting at $${startingPrice} per 30-day kit (4 weekly injections) with physician review and pharmacy fulfillment.`,
    alternates: {
      canonical: `${SITE_URL}/weight-loss/${slug}`,
    },
    openGraph: {
      title: getWeightLossProductPageTitle(program),
      description: program.description,
      url: `${SITE_URL}/weight-loss/${slug}`,
      type: "website",
      images: [{ url: program.image.src, alt: program.image.alt }],
    },
  }
}

export default async function WeightLossProductPage({ params }: PageProps) {
  const { program: slug } = await params
  if (!isWeightLossProductSlug(slug)) {
    notFound()
  }

  const program = getWeightLossProgram(slug)
  if (!program) {
    notFound()
  }

  const content = WEIGHT_LOSS_PRODUCT_CONTENT[slug]

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: content.homeKitTitle,
    description: content.purpose,
    image: `${SITE_URL}${program.image.src}`,
    brand: {
      "@type": "Brand",
      name: "Clear Choice Pharmacy",
    },
    offers: program.doseTiers.flatMap((tier) =>
      (["monthly", "quarterly"] as const).map((plan) => {
        const quote = getWeightLossKitQuote(program, tier.id, plan)!
        return {
          "@type": "Offer",
          price: quote.kitPrice,
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          name: `${tier.name} dose · ${plan === "monthly" ? "30-day kit" : "per kit (quarterly)"}`,
          url: `${SITE_URL}/weight-loss/${slug}`,
        }
      })
    ),
  }

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <SiteHeader />
      <main className="flex-1 bg-background">
        <WeightLossProductDetail program={program} content={content} />
      </main>
      <SiteFooter />
    </div>
  )
}
