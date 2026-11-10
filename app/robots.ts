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
          "/iv-rejuvenation",
          "/learn/myers-cocktail-mobile-iv",
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
          "/iv-rejuvenation",
          "/learn/myers-cocktail-mobile-iv",
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
        disallow: ["/iv-rejuvenation", "/learn/myers-cocktail-mobile-iv"],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
