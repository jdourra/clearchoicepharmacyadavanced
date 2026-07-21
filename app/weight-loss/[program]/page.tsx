import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { WeightLossProductDetail } from "@/components/weight-loss-product-detail"
import { getWeightLossProgram, getWeightLossKitQuote } from "@/lib/weight-loss-catalog"
import {
  WEIGHT_LOSS_PRODUCT_CONTENT,
  WEIGHT_LOSS_PRODUCT_SLUGS,
  getWeightLossFromPrice,
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
  const fromPrice = getWeightLossFromPrice(program)
  const title = getWeightLossProductPageTitle(program)
  const description =
    slug === "semaglutide"
      ? `Compounded Semaglutide from $${fromPrice}/mo on quarterly starter kits. All-in 30-day kit: physician review, 4 weekly injections, supplies & Michigan shipping. Clear Choice Pharmacy, Novi.`
      : `Compounded Tirzepatide from $${fromPrice}/mo on quarterly starter kits. Dual GLP-1/GIP therapy with physician review, supplies & Michigan shipping. Clear Choice Pharmacy, Novi.`

  return {
    title,
    description,
    keywords:
      slug === "semaglutide"
        ? ["semaglutide", "semaglutide cost", "ozempic", "wegovy", "GLP-1", "weight loss injections", "medical weight loss"]
        : ["tirzepatide", "tirzepatide cost", "zepbound", "mounjaro", "GLP-1", "weight loss injections", "medical weight loss"],
    alternates: {
      canonical: `${SITE_URL}/weight-loss/${slug}`,
    },
    openGraph: {
      title,
      description,
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
  const fromPrice = getWeightLossFromPrice(program)
  const highPrice = Math.max(...program.doseTiers.map((t) => t.monthlyKitPrice))

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
    offers: {
      "@type": "AggregateOffer",
      lowPrice: fromPrice,
      highPrice,
      priceCurrency: "USD",
      offerCount: program.doseTiers.length * 2,
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/weight-loss/${slug}`,
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
    },
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
