import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getLearnArticles } from "@/lib/learn-articles"
import { LEARN_CATEGORY_LABELS, type LearnCategory } from "@/lib/learn-types"
import { SITE_URL } from "@/lib/clinical-seo"

export const metadata: Metadata = {
  title: "Learn | Semaglutide, Tirzepatide, ED & Pharmacy Guides",
  description:
    "Educational guides on Semaglutide, Tirzepatide, Tadalafil, Sildenafil, TRT, Myers Cocktail IV, and low cost prescription drugs from Clear Choice Pharmacy in Novi, MI.",
  keywords: [
    "semaglutide",
    "tirzepatide",
    "ozempic",
    "tadalafil",
    "sildenafil",
    "TRT",
    "Myers Cocktail",
    "low cost prescription drugs",
    "medical weight loss guide",
  ],
  alternates: {
    canonical: `${SITE_URL}/learn`,
  },
  openGraph: {
    title: "Learn | Clear Choice Pharmacy Guides",
    description:
      "Patient guides for Semaglutide, Tirzepatide, ED medications, TRT, mobile IV, and cash-pay prescriptions.",
    url: `${SITE_URL}/learn`,
    type: "website",
  },
}

const CATEGORY_ORDER: LearnCategory[] = [
  "weight-loss",
  "mens-health",
  "iv-therapy",
  "prescriptions",
  "specialty",
]

export default function LearnIndexPage() {
  const articles = getLearnArticles()
  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    label: LEARN_CATEGORY_LABELS[category],
    items: articles.filter((article) => article.category === category),
  })).filter((group) => group.items.length > 0)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 py-10 md:py-14">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="max-w-2xl mb-10">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-2">Clear Choice Learn</p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-balance mb-3">
              Guides for Semaglutide, ED Meds, TRT & More
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Practical educational articles for Michigan patients comparing Semaglutide, Tirzepatide, Tadalafil,
              Sildenafil, TRT, mobile IV therapy, and low cost prescription drugs—with clear CTAs to our service pages.
            </p>
          </div>

          <div className="space-y-12">
            {grouped.map((group) => (
              <section key={group.category}>
                <h2 className="text-2xl font-bold mb-4">{group.label}</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {group.items.map((article) => (
                    <Card key={article.slug} className="h-full flex flex-col">
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">{article.categoryLabel}</Badge>
                          <span className="text-xs text-muted-foreground">{article.readingMinutes} min</span>
                        </div>
                        <CardTitle className="text-lg leading-snug">
                          <Link href={`/learn/${article.slug}`} className="hover:text-primary">
                            {article.title}
                          </Link>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col">
                        <p className="text-sm text-muted-foreground leading-relaxed flex-1">{article.description}</p>
                        <Button asChild variant="outline" className="mt-4 w-fit">
                          <Link href={`/learn/${article.slug}`}>
                            Read article
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-14 rounded-xl border bg-muted/30 p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Prefer to shop programs directly?</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Browse Semaglutide, Tirzepatide, ED medications, TRT, IV therapy, and prescriptions.
            </p>
            <Button asChild>
              <Link href="/services">
                View all services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
