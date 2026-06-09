import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "react-hot-toast"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://clearchoicepharmacy.com"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Clear Choice Pharmacy | Cheap Prescription Medications - Affordable Cash-Pay Pharmacy in Novi, MI",
    template: "%s | Clear Choice Pharmacy - Affordable Prescriptions",
  },
  description:
    "Buy cheap prescription medications at Clear Choice Pharmacy in Novi, MI. Affordable prescription drugs at true cost with no insurance needed. Save up to 80% on generic drugs. Simple pricing: Drug Cost + 15% + $5 dispensing fee. Compare prescription drug prices and pay cash for prescriptions.",
  keywords: [
    "cheap prescription medications",
    "affordable prescription drugs",
    "discount prescription drugs",
    "buy prescription drugs online",
    "low cost pharmacy",
    "cheap generic drugs",
    "online pharmacy discounts",
    "best online pharmacy for cheap prescriptions",
    "prescription drug prices comparison",
    "pay cash for prescriptions",
    "pharmacy without insurance",
    "discounted prescription medications",
    "buy generic drugs online",
    "online pharmacy low prices",
    "save money on prescriptions",
    "cash pay pharmacy",
    "transparent pharmacy pricing",
    "no insurance pharmacy",
    "Novi MI pharmacy",
    "Michigan cheap pharmacy",
    "prescription drug savings",
    "affordable generic medications",
    "low cost generic drugs",
    "prescription price comparison tool",
    "specialty pharmacy",
    "specialty medications",
    "prior authorization pharmacy",
    "copay assistance programs",
    "specialty pharmacy insurance accepted",
    "high-cost prescription medications",
    "transfer specialty pharmacy",
    "clinical prior authorization",
    "manufacturer copay cards",
    "specialty drug pharmacy Michigan",
  ],
  generator: "v0.app",
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
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Clear Choice Pharmacy",
    title: "Clear Choice Pharmacy | Cheap Prescription Medications - Save Up to 80%",
    description:
      "Buy affordable prescription drugs at true cost. No insurance needed. Cheap generic drugs with transparent pricing. Drug Cost + 15% + $5. Compare prescription drug prices instantly.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Clear Choice Pharmacy - Affordable Prescription Medications at True Cost",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Clear Choice Pharmacy | Cheap Prescription Medications",
    description:
      "Save up to 80% on prescription drugs. No insurance needed. Transparent cash-pay pricing on 1,600+ medications.",
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
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
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
    description:
      "Affordable cash-pay pharmacy offering cheap prescription medications at true cost. No insurance needed. Save up to 80% on generic drugs with our transparent pricing formula: Drug Cost + 15% + $5 dispensing fee.",
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
      name: "Prescription Medications",
      itemListElement: [
        {
          "@type": "OfferCatalog",
          name: "Cheap Generic Drugs",
          description: "Affordable generic prescription medications at true cost pricing",
        },
        {
          "@type": "OfferCatalog",
          name: "Brand Name Medications",
          description: "Discounted brand name prescription drugs",
        },
        {
          "@type": "OfferCatalog",
          name: "Specialty Pharmacy Services",
          description:
            "Specialty and high-cost medication support with all major insurances accepted, in-house prior authorizations, and copay assistance programs",
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
    description:
      "Buy cheap prescription medications online. Affordable prescription drugs at true cost. Compare prescription drug prices and save up to 80% without insurance.",
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
        <link rel="canonical" href={SITE_URL} />
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
