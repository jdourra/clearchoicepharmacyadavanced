import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site-config"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_URL

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/staff/",
          "/dashboard/",
          "/doctor/",
          "/account/",
          "/cart/",
          "/checkout/",
          "/confirmation/",
          "/weight-loss/start",
        ],
      },
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/staff/",
          "/dashboard/",
          "/doctor/",
          "/account/",
          "/cart/",
          "/checkout/",
          "/confirmation/",
          "/weight-loss/start",
        ],
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
      },
      {
        userAgent: "anthropic-ai",
        allow: "/",
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
      },
      {
        userAgent: "Applebot-Extended",
        allow: "/",
      },
      {
        userAgent: "Bytespider",
        allow: "/",
      },
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
      },
      {
        userAgent: "Googlebot",
        allow: "/",
      },
      {
        userAgent: "Bingbot",
        allow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
