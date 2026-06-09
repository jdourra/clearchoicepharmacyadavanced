import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, TrendingDown, Shield, DollarSign } from "lucide-react"
import type { Metadata } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://clearchoicepharmacy.com"

export const metadata: Metadata = {
  title: "Prescription Drug Prices Comparison | Transparent Pharmacy Pricing Formula",
  description:
    "Compare prescription drug prices at Clear Choice Pharmacy. Our transparent pricing formula: Drug Cost + 15% + $5. Save up to 80% on cheap prescription medications. No insurance needed. Pay cash for prescriptions and save money.",
  alternates: {
    canonical: `${SITE_URL}/pricing`,
  },
  openGraph: {
    title: "Prescription Drug Prices Comparison - Save Up to 80%",
    description:
      "See exactly how we price affordable prescription drugs. Transparent formula: Drug Cost + 15% + $5. Compare and save on discounted prescription medications.",
    url: `${SITE_URL}/pricing`,
    type: "website",
  },
}

export default function PricingTransparencyPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How much do cheap prescription medications cost at Clear Choice Pharmacy?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our pricing formula is simple: Drug Cost + 15% markup + $5 dispensing fee. For example, a 30-day supply of Lisinopril 10mg costs just $8.45 compared to $30.00 at typical retail pharmacies. We offer some of the cheapest prescription medications available.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need insurance to buy affordable prescription drugs at Clear Choice Pharmacy?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No insurance is needed. Clear Choice Pharmacy is a cash-pay pharmacy. Our prices are often lower than insurance copays, making us one of the best options for buying cheap generic drugs without insurance.",
        },
      },
      {
        "@type": "Question",
        name: "How can I compare prescription drug prices?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Use our online medication search tool to instantly compare prescription drug prices. Simply type your medication name and see our transparent pricing breakdown alongside estimated retail pharmacy prices. We show you exactly what the drug costs us and what you pay.",
        },
      },
      {
        "@type": "Question",
        name: "How much can I save on prescription drugs?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Patients save up to 80% compared to typical retail pharmacy prices. With over 1,600 discounted prescription medications available, Clear Choice Pharmacy is one of the best options for saving money on prescriptions.",
        },
      },
      {
        "@type": "Question",
        name: "Can I buy generic drugs online through Clear Choice Pharmacy?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, you can browse and price generic drugs online at Clear Choice Pharmacy. Search our catalog of 1,600+ cheap generic drugs online, see instant pricing, and place your order for pickup or delivery at our Novi, MI location.",
        },
      },
      {
        "@type": "Question",
        name: "What makes Clear Choice Pharmacy different from other low cost pharmacies?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We eliminate PBM (Pharmacy Benefit Manager) middlemen and show you exactly what your medication costs. Our simple formula of Drug Cost + 15% + $5 means complete transparency. No hidden fees, no surprises, and some of the lowest prescription drug prices available.",
        },
      },
      {
        "@type": "Question",
        name: "Who benefits from paying cash for prescriptions?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Uninsured patients, those with high-deductible health plans, Medicare Part D donut hole patients, and anyone seeking transparent prescription drug pricing. Our cash-pay prices are often cheaper than insurance copays.",
        },
      },
    ],
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Pricing",
        item: `${SITE_URL}/pricing`,
      },
    ],
  }

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <SiteHeader />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">How Our Pricing Works</h1>
              <p className="text-xl text-muted-foreground text-balance">
                Simple, honest pricing. Major savings on your prescriptions.
              </p>
            </div>

            {/* The Formula */}
            <Card className="mb-12 border-2 border-primary">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">Our Pricing Formula</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-primary/5 rounded-xl p-8 text-center">
                  <div className="text-3xl md:text-4xl font-bold mb-4">(Drug Cost × 1.15) + $5.00</div>
                  <p className="text-lg text-muted-foreground">That's it. That's our entire pricing model.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-2">Drug Cost</div>
                    <p className="text-sm text-muted-foreground">What we pay for the medication from wholesalers</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-2">15% Markup</div>
                    <p className="text-sm text-muted-foreground">Covers our operating costs and keeps the lights on</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-2">$5 Fee</div>
                    <p className="text-sm text-muted-foreground">Flat dispensing fee to prepare your prescription</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Example calculation */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Example: Lisinopril 10mg
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Drug cost (30 tablets):</span>
                    <span className="font-semibold">$3.00</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">15% markup ($3.00 × 0.15):</span>
                    <span className="font-semibold">$0.45</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Dispensing fee:</span>
                    <span className="font-semibold">$5.00</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between items-center">
                    <span className="text-lg font-bold">Your Price:</span>
                    <span className="text-2xl font-bold text-primary">$8.45</span>
                  </div>
                  <div className="bg-accent/10 rounded-lg p-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span>Typical retail pharmacy price:</span>
                      <span className="line-through text-muted-foreground">$30.00</span>
                    </div>
                    <div
                      className="flex justify-between items-center mt-2 font-bold"
                      style={{ color: "var(--savings-green)" }}
                    >
                      <span>You save:</span>
                      <span>$21.55 (72%)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardHeader className="text-center">
                  <DollarSign className="h-10 w-10 text-primary mx-auto mb-2" />
                  <CardTitle className="text-3xl">1,600+</CardTitle>
                  <p className="text-sm text-muted-foreground">Medications with transparent pricing</p>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <TrendingDown className="h-10 w-10 text-primary mx-auto mb-2" />
                  <CardTitle className="text-3xl">Up to 80%</CardTitle>
                  <p className="text-sm text-muted-foreground">Savings vs retail pharmacies</p>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <Shield className="h-10 w-10 text-primary mx-auto mb-2" />
                  <CardTitle className="text-3xl">$0</CardTitle>
                  <p className="text-sm text-muted-foreground">Hidden fees or surprises</p>
                </CardHeader>
              </Card>
            </div>

            {/* Why cash pay */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Why Cash-Pay Only?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">No PBM Middlemen</h3>
                  <p className="text-muted-foreground text-sm">
                    Pharmacy Benefit Managers (PBMs) add layers of costs and complexity. By eliminating them, we pass
                    massive savings directly to you.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Often Cheaper Than Insurance</h3>
                  <p className="text-muted-foreground text-sm">
                    If you're uninsured or have a high deductible, our cash prices are often lower than insurance
                    copays. You might be surprised how much you can save.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">No Insurance Hassles</h3>
                  <p className="text-muted-foreground text-sm">
                    No prior authorizations. No formulary restrictions. No waiting for insurance approval. Just simple,
                    straightforward pricing.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Complete Transparency</h3>
                  <p className="text-muted-foreground text-sm">
                    We show you exactly what the drug costs us, what we add, and what you pay. Every single time. No
                    secrets, no surprises.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Who this helps */}
            <Card>
              <CardHeader>
                <CardTitle>Who Benefits Most?</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    <p className="text-sm">
                      <span className="font-semibold">Uninsured patients:</span> Get affordable medications without
                      insurance
                    </p>
                  </li>
                  <li className="flex gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    <p className="text-sm">
                      <span className="font-semibold">High-deductible plans:</span> Save money while meeting your
                      deductible
                    </p>
                  </li>
                  <li className="flex gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    <p className="text-sm">
                      <span className="font-semibold">Medicare Part D gap:</span> Avoid the donut hole with transparent
                      cash pricing
                    </p>
                  </li>
                  <li className="flex gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    <p className="text-sm">
                      <span className="font-semibold">Anyone seeking transparency:</span> Know your price before you buy
                    </p>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
