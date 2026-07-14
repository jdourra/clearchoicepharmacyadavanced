import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { LearnArticle } from "@/lib/learn-types"
import { getRelatedLearnArticles } from "@/lib/learn-articles"
import { PRIMARY_PHYSICIAN } from "@/lib/clinical-provider"
import { SITE_URL, buildFaqJsonLd } from "@/lib/clinical-seo"

function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function LearnArticleView({ article }: { article: LearnArticle }) {
  const related = getRelatedLearnArticles(article)
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      "@type": "Person",
      name: PRIMARY_PHYSICIAN.name,
    },
    publisher: {
      "@type": "Organization",
      name: "Clear Choice Pharmacy",
      url: SITE_URL,
    },
    mainEntityOfPage: `${SITE_URL}/learn/${article.slug}`,
    keywords: article.keywords.join(", "),
  }
  const faqJsonLd = buildFaqJsonLd(article.faqs)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <main className="flex-1">
        <article className="py-10 md:py-14">
          <div className="container max-w-3xl mx-auto px-4">
            <div className="mb-8">
              <Link href="/learn" className="text-sm text-primary hover:underline">
                ← All Learn articles
              </Link>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{article.categoryLabel}</Badge>
                <span className="text-sm text-muted-foreground">{article.readingMinutes} min read</span>
              </div>
              <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-balance">
                {article.title}
              </h1>
              <p className="mt-3 text-muted-foreground leading-relaxed">{article.description}</p>
              <p className="mt-3 text-sm text-muted-foreground">
                Reviewed for educational publishing · {PRIMARY_PHYSICIAN.name}, {PRIMARY_PHYSICIAN.credentials} · Updated{" "}
                {formatDate(article.updatedAt)}
              </p>
            </div>

            <div className="space-y-4 mb-10">
              {article.intro.map((paragraph) => (
                <p key={paragraph.slice(0, 48)} className="text-base leading-relaxed text-foreground/90">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="rounded-xl border bg-muted/30 p-5 mb-10">
              <p className="font-semibold mb-2">Ready to take the next step?</p>
              <p className="text-sm text-muted-foreground mb-4">
                Michigan patients can review current pricing and start a secure clinical intake.
              </p>
              <Button asChild>
                <Link href={article.serviceHref}>
                  {article.serviceCta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="space-y-10">
              {article.sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="text-2xl font-bold tracking-tight mb-3">{section.heading}</h2>
                  <div className="space-y-3">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph.slice(0, 48)} className="leading-relaxed text-foreground/90">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  {section.bullets && section.bullets.length > 0 && (
                    <ul className="mt-4 space-y-2 list-disc pl-5 text-foreground/90">
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>

            <section className="mt-12">
              <h2 className="text-2xl font-bold tracking-tight mb-4">Frequently asked questions</h2>
              <Accordion type="single" collapsible className="w-full">
                {article.faqs.map((faq, index) => (
                  <AccordionItem key={faq.question} value={`faq-${index}`}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>

            <div className="mt-10 rounded-xl border p-5 bg-primary/5">
              <p className="font-semibold mb-2">{article.serviceCta}</p>
              <p className="text-sm text-muted-foreground mb-4">
                Clear Choice Pharmacy · Novi, MI · Michigan patients only for dispensing and clinical programs.
              </p>
              <Button asChild>
                <Link href={article.serviceHref}>
                  Continue to service page
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {related.length > 0 && (
              <section className="mt-12">
                <h2 className="text-xl font-bold mb-4">Related articles</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {related.map((item) => (
                    <Card key={item.slug}>
                      <CardHeader className="pb-2">
                        <Badge variant="outline" className="w-fit mb-2">
                          {item.categoryLabel}
                        </Badge>
                        <CardTitle className="text-base leading-snug">
                          <Link href={`/learn/${item.slug}`} className="hover:text-primary">
                            {item.title}
                          </Link>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            <p className="mt-10 text-xs text-muted-foreground leading-relaxed border-t pt-6">
              {article.disclaimer}
            </p>
          </div>
        </article>
      </main>

      <SiteFooter />
    </div>
  )
}
