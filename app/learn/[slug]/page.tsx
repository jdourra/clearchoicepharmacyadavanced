import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { LearnArticleView } from "@/components/learn-article-view"
import {
  getLearnArticle,
  getLearnArticleSlugs,
} from "@/lib/learn-articles"
import { SITE_URL } from "@/lib/clinical-seo"

type PageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getLearnArticleSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = getLearnArticle(slug)
  if (!article) {
    return { title: "Article Not Found | Clear Choice Pharmacy" }
  }

  return {
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    alternates: {
      canonical: `${SITE_URL}/learn/${article.slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.description,
      url: `${SITE_URL}/learn/${article.slug}`,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
    },
  }
}

export default async function LearnArticlePage({ params }: PageProps) {
  const { slug } = await params
  const article = getLearnArticle(slug)
  if (!article) {
    notFound()
  }

  return <LearnArticleView article={article} />
}
