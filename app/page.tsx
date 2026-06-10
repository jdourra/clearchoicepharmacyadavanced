"use client"

import Link from "next/link"
import { ArrowRight, DollarSign, Shield, Clock, ShoppingCart } from "lucide-react"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { MedicationAutocomplete } from "@/components/medication-autocomplete"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import {
  calculateTransparentPrice,
  fetchMedicationStrengths,
  getPerUnitCost,
  isUnitBasedForm,
  medicationForm,
  type MedicationSearchResult,
  type PharmacyMedication,
} from "@/lib/pharmacy-medication"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"

export default function HomePage() {
  const router = useRouter()

  const POPULAR_DRUG_QUERIES = [
    "Amlodipine",
    "Lisinopril",
    "Metformin",
    "Atorvastatin",
    "Omeprazole",
    "Levothyroxine",
    "Albuterol",
    "Gabapentin",
  ]

  const [popularMeds, setPopularMeds] = useState<PharmacyMedication[]>([])
  const [selectedMedicationName, setSelectedMedicationName] = useState<string>("")
  const [availableStrengths, setAvailableStrengths] = useState<PharmacyMedication[]>([])
  const [selectedMedication, setSelectedMedication] = useState<PharmacyMedication | null>(null)
  const [quantity, setQuantity] = useState<number>(30)
  const [showPricing, setShowPricing] = useState(false)
  const [loadingStrengths, setLoadingStrengths] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadPopularMedications() {
      const results = await Promise.all(
        POPULAR_DRUG_QUERIES.map(async (query) => {
          const response = await fetch(`/api/drugs?q=${encodeURIComponent(query)}&limit=1`)
          if (!response.ok) return null
          const data = await response.json()
          return data.medications?.[0] ?? null
        })
      )

      if (!cancelled) {
        setPopularMeds(results.filter(Boolean) as PharmacyMedication[])
      }
    }

    loadPopularMedications()
    return () => {
      cancelled = true
    }
  }, [])


  const calculatePrice = (med: PharmacyMedication, qty: number) =>
    calculateTransparentPrice(med, qty).toFixed(2)

  const handleMedicationSelect = async (medication: MedicationSearchResult) => {
    setLoadingStrengths(true)
    setShowPricing(true)
    setSelectedMedicationName(medication.name)

    try {
      const allStrengths = await fetchMedicationStrengths(medication.name)
      setAvailableStrengths(allStrengths)
      setSelectedMedication(allStrengths.length === 1 ? allStrengths[0] : null)
      setQuantity(30)
    } finally {
      setLoadingStrengths(false)
    }

    setTimeout(() => {
      document.getElementById("pricing-calculator")?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  const handleStrengthSelect = (medication: PharmacyMedication) => {
    setSelectedMedication(medication)
    const form = medicationForm(medication)

    if (isUnitBasedForm(form) || medication.days_supply) {
      setQuantity(1)
    } else {
      setQuantity(30)
    }
  }

  const addToCart = () => {
    if (!selectedMedication) {
      toast.error("Please select a medication")
      return
    }

    const totalPrice = Number.parseFloat(calculatePrice(selectedMedication, quantity))

    const cart = JSON.parse(sessionStorage.getItem("cart") || "[]")

    cart.push({
      id: `${selectedMedication.id}-${Date.now()}`,
      medication_id: selectedMedication.id,
      quantity,
      price: totalPrice,
      medication: selectedMedication,
    })

    sessionStorage.setItem("cart", JSON.stringify(cart))
    toast.success("Added to cart!")
    router.push("/cart")
  }

  const selectedForm = selectedMedication ? medicationForm(selectedMedication) : ""
  const effectiveQty =
    selectedMedication && isUnitBasedForm(selectedForm) ? 1 : quantity
  const perUnitCost = selectedMedication ? getPerUnitCost(selectedMedication) : 0
  const drugCost = perUnitCost * effectiveQty
  const markup = drugCost * 0.15
  const dispensingFee = 5.0
  const totalPrice = drugCost + markup + dispensingFee
  const daysSupply = selectedMedication?.days_supply ? quantity * selectedMedication.days_supply : quantity
  const retailBase =
    selectedMedication?.typical_retail_price && Number(selectedMedication.typical_retail_price) > 0
      ? Number(selectedMedication.typical_retail_price)
      : totalPrice * 3.5
  const retailPrice = retailBase
  const savings = retailPrice - totalPrice

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero section */}
        <section className="relative py-16 md:py-24 bg-background">
          <div className="container max-w-4xl mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance mb-4">
                Prescription Medications at <span className="text-primary">True Cost</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground text-balance mb-2">
                No insurance needed. No hidden fees. Major savings on your prescriptions.
              </p>
              <p className="text-base md:text-lg font-semibold text-foreground">
                Drug Cost + 15% + $5 dispensing fee. That's it.
              </p>
            </div>

            <div className="max-w-2xl mx-auto mb-8">
              <MedicationAutocomplete onSelect={handleMedicationSelect} />
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span>Cash pay only</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>No insurance hassles</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Transparent pricing</span>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing calculator */}
        {showPricing && (
          <section id="pricing-calculator" className="py-12 bg-muted/30 border-y">
            <div className="container max-w-6xl mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold">{selectedMedicationName}</h2>

                  {availableStrengths.length > 1 && (
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Select Strength:</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {availableStrengths.map((med) => (
                          <Button
                            key={med.id}
                            variant={selectedMedication?.id === med.id ? "default" : "outline"}
                            onClick={() => handleStrengthSelect(med)}
                            className="h-auto py-3 flex-col items-start"
                          >
                            <div className="font-semibold">{med.strength}</div>
                            <div className="text-xs opacity-80">{medicationForm(med)}</div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedMedication && (
                    <div className="space-y-2">
                      <p className="text-xl text-muted-foreground">
                        {selectedMedication.strength} {medicationForm(selectedMedication)}
                      </p>
                      {selectedMedication.is_generic && <Badge variant="secondary">Generic</Badge>}
                      <p className="text-sm text-muted-foreground font-mono">NDC: {selectedMedication.ndc}</p>
                    </div>
                  )}
                </div>

                {selectedMedication ? (
                  <Card className="p-6">
                    <div className="space-y-6">
                      <div>
                        <div className="text-5xl font-bold text-primary mb-1">${totalPrice.toFixed(2)}</div>
                        <p className="text-sm text-muted-foreground">
                          ${(totalPrice / quantity).toFixed(2)} per{" "}
                          {isUnitBasedForm(selectedForm) ? "unit" : "pill"}
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="quantity" className="text-sm font-medium mb-2 block">
                          Quantity:
                        </Label>
                        <Input
                          id="quantity"
                          type="number"
                          min={selectedMedication.days_supply ? 1 : 30}
                          max={selectedMedication.days_supply ? 3 : 90}
                          value={quantity}
                          onChange={(e) => setQuantity(Number.parseInt(e.target.value) || quantity)}
                          className="text-lg"
                        />
                        <div className="flex gap-2 mt-2">
                          {selectedMedication.days_supply ? (
                            <>
                              <Button variant="outline" size="sm" onClick={() => setQuantity(1)}>
                                1 (30 days)
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => setQuantity(2)}>
                                2 (60 days)
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => setQuantity(3)}>
                                3 (90 days)
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button variant="outline" size="sm" onClick={() => setQuantity(30)}>
                                30
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => setQuantity(60)}>
                                60
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => setQuantity(90)}>
                                90
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                        <div className="font-semibold mb-3">Price Breakdown:</div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Drug Cost ({quantity} {medicationForm(selectedMedication).toLowerCase()}s - {daysSupply} days):
                          </span>
                          <span className="font-medium">${drugCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">15% Markup:</span>
                          <span className="font-medium">${markup.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dispensing Fee:</span>
                          <span className="font-medium">${dispensingFee.toFixed(2)}</span>
                        </div>
                        <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                          <span>Your Total:</span>
                          <span className="text-primary">${totalPrice.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="bg-accent/10 rounded-lg p-4">
                        <div className="text-sm text-muted-foreground mb-1">Typical Retail:</div>
                        <div className="text-lg line-through">${retailPrice.toFixed(2)}</div>
                        <div className="text-xl font-bold mt-1 text-green-600">
                          YOU SAVE ${savings.toFixed(2)} ({Math.round((savings / retailPrice) * 100)}%)
                        </div>
                      </div>

                      <Button size="lg" className="w-full" onClick={addToCart}>
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Add to Cart
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-6 flex items-center justify-center min-h-[400px]">
                    <p className="text-muted-foreground text-center">
                      {loadingStrengths ? "Loading medication strengths..." : "Please select a strength to see pricing"}
                    </p>
                  </Card>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Popular medications */}
        <section className="py-16 bg-muted/30">
          <div className="container max-w-7xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Popular Medications</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
              {popularMeds.map((med) => {
                const form = medicationForm(med)
                const isUnit = isUnitBasedForm(form)
                const price = calculatePrice(med, 30)
                const retailNum =
                  med.typical_retail_price && Number(med.typical_retail_price) > 0
                    ? Number(med.typical_retail_price)
                    : Number.parseFloat(price) * 3.5
                const retail = retailNum.toFixed(2)
                const save = (retailNum - Number.parseFloat(price)).toFixed(2)
                const supplyLabel = isUnit ? `per ${form.toLowerCase()}` : "for 30-day supply"

                return (
                  <Link key={med.id} href={`/medications/${med.id}`}>
                    <Card className="p-5 hover:border-primary hover:shadow-lg transition-all cursor-pointer h-full">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg leading-tight">{med.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {med.strength} {form}
                          </p>
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-primary">${price}</div>
                          <p className="text-xs text-muted-foreground">{supplyLabel}</p>
                        </div>
                        <div className="pt-2 border-t">
                          <p className="text-sm text-muted-foreground line-through">Retail: ${retail}</p>
                          <p className="text-sm font-semibold text-green-600">You save ${save}</p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 bg-background">
          <div className="container max-w-5xl mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How It Works</h2>
              <p className="text-lg text-muted-foreground">Get your medication in three simple steps</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground text-xl font-bold mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Search Your Medication</h3>
                <p className="text-sm text-muted-foreground">
                  Find your prescription and see the real price—no surprises
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground text-xl font-bold mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">Upload Prescription</h3>
                <p className="text-sm text-muted-foreground">Upload a photo or have your doctor e-prescribe to us</p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground text-xl font-bold mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">Pickup or Delivery</h3>
                <p className="text-sm text-muted-foreground">
                  Ready in 24-48 hours for pickup or delivered to your door
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why cash-pay benefits */}
        <section className="py-16 bg-muted/30">
          <div className="container max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Cash Pay?</h2>
              <p className="text-lg text-muted-foreground">
                No insurance? High deductible? We're often cheaper than your copay.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 text-center">
                <h3 className="font-semibold text-lg mb-2">No PBM Middlemen</h3>
                <p className="text-sm text-muted-foreground">
                  We eliminate pharmacy benefit managers and pass savings to you
                </p>
              </Card>
              <Card className="p-6 text-center">
                <h3 className="font-semibold text-lg mb-2">Know Your Price</h3>
                <p className="text-sm text-muted-foreground">See exactly what you'll pay before checkout—every time</p>
              </Card>
              <Card className="p-6 text-center">
                <h3 className="font-semibold text-lg mb-2">Simple Math</h3>
                <p className="text-sm text-muted-foreground">
                  Drug cost + 15% + $5. That's our entire pricing formula.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Save?</h2>
            <p className="text-lg mb-8 opacity-90">
              Join thousands who trust Clear Choice for transparent medication pricing
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary">
                <Link href="/medications">
                  Browse Medications
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                <Link href="/pricing">See Pricing Formula</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* SEO Content: Frequently Asked Questions */}
      <section className="py-16 bg-background border-t">
        <div className="container max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions About Cheap Prescription Medications</h2>
          <div className="grid gap-6 max-w-3xl mx-auto">
            <div>
              <h3 className="font-semibold text-lg mb-2">How do I buy cheap prescription medications at Clear Choice Pharmacy?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Simply search for your medication using our online tool, compare prescription drug prices, and place your order. We offer some of the most affordable prescription drugs available, with savings up to 80% compared to retail pharmacies. No insurance is needed -- just pay cash for your prescriptions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Are your generic drugs as effective as brand-name medications?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Yes. All our cheap generic drugs meet the same FDA standards for quality, safety, and effectiveness as their brand-name counterparts. By buying generic drugs online through Clear Choice Pharmacy, you get the same medication at a fraction of the cost.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Can I use Clear Choice Pharmacy without insurance?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Absolutely. Clear Choice Pharmacy is designed as a pharmacy without insurance hassles. Our cash-pay model eliminates PBM middlemen, giving you access to discounted prescription medications at true wholesale cost plus a small markup and dispensing fee.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">How does your prescription drug prices comparison work?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Our online pharmacy provides instant price comparisons. Search for any medication and see our transparent price breakdown alongside estimated retail prices. Our formula is simple: Drug Cost + 15% + $5 dispensing fee. You always know exactly what you will pay before ordering.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">What are the best ways to save money on prescriptions?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                The best way to save money on prescriptions is to use a low cost pharmacy like Clear Choice. We offer discount prescription drugs by eliminating insurance middlemen, buying directly from wholesalers, and passing the savings to you. Choosing cheap generic drugs over brand names saves even more.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Do you offer online pharmacy discounts for bulk orders?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Yes, ordering a 90-day supply instead of a 30-day supply can significantly reduce your per-pill cost. Our transparent pricing formula means you can see the exact savings for any quantity. We are committed to being the best online pharmacy for cheap prescriptions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Does Clear Choice Pharmacy accept insurance for specialty medications?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Yes. For specialty and high-cost therapies, we accept all major insurance plans. Our in-house Prior Authorization team works with your doctor to expedite clinical approvals, and our clinical advocates help connect you with manufacturer copay assistance programs.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">How can I transfer my specialty prescriptions to Clear Choice Pharmacy?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Call us at (248) 987-6182 or visit our Novi, MI location. We coordinate with your physician and current pharmacy to transfer your specialty care and begin prior authorization and copay support from day one.{" "}
                <Link href="/specialty-pharmacy" className="text-primary hover:underline">
                  Learn more about our specialty pharmacy services
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content: About Section */}
      <section className="py-12 bg-muted/30 border-t">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <h2 className="text-2xl font-bold text-foreground mb-4">About Clear Choice Pharmacy - Your Affordable Prescription Drug Source</h2>
            <p className="leading-relaxed mb-4">
              Clear Choice Pharmacy is a low cost pharmacy located in Novi, Michigan, offering cheap prescription medications at true wholesale cost. As a cash-pay pharmacy, we provide affordable prescription drugs without requiring insurance. Our transparent pricing model -- Drug Cost + 15% + $5 dispensing fee -- ensures you always know what you will pay. No hidden fees, no PBM middlemen, no surprises.
            </p>
            <p className="leading-relaxed mb-4">
              Whether you are looking to buy prescription drugs online, compare prescription drug prices, or find a pharmacy without insurance, Clear Choice Pharmacy has you covered. We carry over 1,600 medications including the most commonly prescribed cheap generic drugs, all available at discount prescription drug prices that can save you up to 80% compared to traditional retail pharmacies.
            </p>
            <p className="leading-relaxed mb-4">
              We also provide specialized pharmacy care for high-cost and specialty therapies. All major insurance plans are accepted, with an in-house Prior Authorization team to expedite clinical approvals and copay assistance support that can reduce out-of-pocket costs to as low as $0. Visit our{" "}
              <Link href="/specialty-pharmacy" className="text-primary hover:underline">
                specialty pharmacy page
              </Link>{" "}
              to learn more about transferring your specialty care.
            </p>
            <p className="leading-relaxed">
              Serving the communities of Novi, Northville, Farmington Hills, Wixom, and South Lyon, Clear Choice Pharmacy is your local source for discounted prescription medications. Pay cash for prescriptions and start saving money today. We are proud to be recognized as one of the best online pharmacies for cheap prescriptions in Michigan.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
