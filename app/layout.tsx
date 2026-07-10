import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "react-hot-toast"
import {
  HOME_DESCRIPTION,
  HOME_TITLE,
  SITE_KEYWORDS,
  SITE_URL,
  buildSiteNavigationJsonLd,
} from "@/lib/clinical-seo"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: HOME_TITLE,
    template: "%s | Clear Choice Pharmacy",
  },
  description: HOME_DESCRIPTION,
  keywords: [...SITE_KEYWORDS],
  generator: "Clear Choice Pharmacy",
  applicationName: "Clear Choice Pharmacy",
  referrer: "origin-when-cross-origin",
  authors: [{ name: "Clear Choice Pharmacy" }],
  creator: "Clear Choice Pharmacy",
  publisher: "Clear Choice Pharmacy",
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Clear Choice Pharmacy",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Clear Choice Pharmacy — prescriptions, weight loss, IV therapy, and men's health in Novi, MI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.svg",
    shortcut: "/icon.svg",
  },
  category: "health",
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { other: { "google-site-verification": process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pharmacyJsonLd = {
    "@context": "https://schema.org",
    "@type": "Pharmacy",
    name: "Clear Choice Pharmacy",
    alternateName: "Clear Choice Rx",
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    image: `${SITE_URL}/og-image.jpg`,
    description: HOME_DESCRIPTION,
    telephone: "+1-248-987-6182",
    faxNumber: "+1-248-987-4963",
    address: {
      "@type": "PostalAddress",
      streetAddress: "40890 Grand River Ave",
      addressLocality: "Novi",
      addressRegion: "MI",
      postalCode: "48375",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 42.4806,
      longitude: -83.4755,
    },
    areaServed: [
      { "@type": "State", name: "Michigan" },
      { "@type": "City", name: "Novi" },
      { "@type": "City", name: "Northville" },
      { "@type": "City", name: "Farmington Hills" },
      { "@type": "City", name: "Wixom" },
      { "@type": "City", name: "South Lyon" },
    ],
    priceRange: "$",
    currenciesAccepted: "USD",
    paymentAccepted: "Cash, Credit Card, Debit Card",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "10:00",
        closes: "14:00",
      },
    ],
    sameAs: [],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Clear Choice Pharmacy Services",
      itemListElement: [
        {
          "@type": "OfferCatalog",
          name: "Low-Cost Prescriptions",
          description:
            "Transparent cash-pay prescription pricing — Drug Cost + 15% + $5 dispensing fee. No insurance required.",
          url: `${SITE_URL}/prescriptions`,
        },
        {
          "@type": "OfferCatalog",
          name: "Weight Loss & GLP-1",
          description: "Medical weight management with Semaglutide and Tirzepatide GLP-1 therapies",
          url: `${SITE_URL}/weight-loss`,
        },
        {
          "@type": "OfferCatalog",
          name: "ED Medications & TRT",
          description: "Custom sublingual ED troches and physician-supervised testosterone replacement therapy",
          url: `${SITE_URL}/mens-health`,
        },
        {
          "@type": "OfferCatalog",
          name: "IV Rejuvenation",
          description: "Mobile IV therapy and physician-reviewed rejuvenation vials in Metro Detroit",
          url: `${SITE_URL}/iv-rejuvenation`,
        },
        {
          "@type": "OfferCatalog",
          name: "Specialty Pharmacy",
          description:
            "Specialty medications with all major insurances accepted, in-house prior authorizations, and copay assistance",
          url: `${SITE_URL}/specialty-pharmacy`,
        },
      ],
    },
  }

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Clear Choice Pharmacy",
    alternateName: "Clear Choice Rx",
    url: SITE_URL,
    description: HOME_DESCRIPTION,
    hasPart: buildSiteNavigationJsonLd(),
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/medications?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Clear Choice Pharmacy",
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-248-987-6182",
      contactType: "customer service",
      areaServed: "US",
      availableLanguage: "English",
    },
  }

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(pharmacyJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM Information" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Analytics />
        <Toaster position="top-center" />
</body>
    </html>
  )
}
