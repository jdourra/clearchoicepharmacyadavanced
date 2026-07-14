import type { MetadataRoute } from "next"
import { IV_PACKAGE_IDS } from "@/lib/iv-catalog"
import { VIAL_PRODUCT_IDS } from "@/lib/rejuvenation-vial-catalog"
import { getLearnArticles } from "@/lib/learn-articles"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://clearchoicepharmacy.com"
  const now = new Date()

  const learnPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/learn`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.86,
    },
    ...getLearnArticles().map((article) => ({
      url: `${baseUrl}/learn/${article.slug}`,
      lastModified: new Date(article.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ]

  const ivPackagePages: MetadataRoute.Sitemap = IV_PACKAGE_IDS.map((id) => ({
    url: `${baseUrl}/iv-rejuvenation/packages/${id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.88,
  }))

  const vialProductPages: MetadataRoute.Sitemap = VIAL_PRODUCT_IDS.map((id) => ({
    url: `${baseUrl}/iv-rejuvenation/vials/${id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.88,
  }))

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/prescriptions`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/medications`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.88,
    },
    {
      url: `${baseUrl}/specialty-pharmacy`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/specialty-pharmacy/start`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.84,
    },
    {
      url: `${baseUrl}/mens-health`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/mens-health/start`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/mens-health/trt/start`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/mens-health/ed/sildenafil-fast`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.88,
    },
    {
      url: `${baseUrl}/mens-health/ed/tadalafil-daily`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.88,
    },
    {
      url: `${baseUrl}/mens-health/ed/combination-troche`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.88,
    },
    {
      url: `${baseUrl}/mens-health/trt/testosterone-cypionate`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.88,
    },
    {
      url: `${baseUrl}/mens-health/trt/testosterone-cream`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.88,
    },
    {
      url: `${baseUrl}/mens-health/trt/enclomiphene`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.88,
    },
    {
      url: `${baseUrl}/weight-loss`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/weight-loss/semaglutide`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.88,
    },
    {
      url: `${baseUrl}/weight-loss/tirzepatide`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.88,
    },
    {
      url: `${baseUrl}/weight-loss/start`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/iv-rejuvenation`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/iv-rejuvenation/book`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/iv-rejuvenation/vials/start`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/auth/sign-up`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ]

  let medicationPages: MetadataRoute.Sitemap = []

  try {
    if (!process.env.DATABASE_URL) {
      return [...staticPages, ...learnPages, ...ivPackagePages, ...vialProductPages]
    }

    const { sql } = await import("@/lib/db")
    const medications = await sql(
      "SELECT id, updated_at FROM medications WHERE is_active IS NOT FALSE ORDER BY name ASC LIMIT 2500",
      []
    )
    medicationPages = medications.map((med: { id: string; updated_at?: string }) => ({
      url: `${baseUrl}/medications/${med.id}`,
      lastModified: med.updated_at ? new Date(med.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))
  } catch (error) {
    console.error("[sitemap] Failed to load medications from database:", error)
  }

  return [...staticPages, ...learnPages, ...ivPackagePages, ...vialProductPages, ...medicationPages]
}
