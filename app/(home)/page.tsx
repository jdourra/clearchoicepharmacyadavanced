"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, MapPin, ShieldCheck, Stethoscope } from "lucide-react"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="relative isolate overflow-hidden text-white">
          <Image
            src="/images/home-hero-clinical.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[75%_center] sm:object-[right_center]"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-slate-950/92 via-slate-900/78 to-slate-900/35 sm:from-slate-950/88 sm:via-slate-900/65 sm:to-transparent"
            aria-hidden
          />
          <div className="relative container max-w-5xl mx-auto px-4 py-10 sm:py-14 md:py-20 min-h-[min(85vh,640px)] flex flex-col justify-center">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-sky-200 mb-3">
              Clear Choice Pharmacy · Novi, MI
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance max-w-2xl mb-3 sm:mb-4">
              <span className="block text-sky-300">Semaglutide</span>
              <span className="block text-sky-300">&amp; Tirzepatide</span>
              <span className="block mt-1 text-white text-[0.72em] sm:text-[0.78em] font-bold leading-tight">
                Weight Loss in Michigan
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-200 text-balance max-w-xl mb-6 sm:mb-8 leading-relaxed">
              Provider-guided medical weight management with pharmacy-compounded Semaglutide and Tirzepatide kits after
              licensed clinician review—fulfilled from Novi. Individual results may vary.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto max-w-md sm:max-w-none">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto bg-sky-500 hover:bg-sky-400 text-white border-0 shadow-lg shadow-sky-900/30"
              >
                <Link href="/weight-loss">
                  Explore Semaglutide &amp; Tirzepatide
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-white/10 border-white/35 text-white hover:bg-white/20 hover:text-white"
              >
                <Link href="/weight-loss#programs">View kit pricing</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-10 md:py-14 bg-background border-b">
          <div className="container max-w-5xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <Card className="overflow-hidden p-0 border-primary/25 bg-primary/5 flex flex-col">
                <div className="relative aspect-[4/3] w-full bg-muted/40">
                  <Image
                    src="/images/semaglutide-vial.png"
                    alt="Compounded Semaglutide injection vial"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain object-center p-4"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Semaglutide</h2>
                  <p className="text-sm text-muted-foreground mt-3 mb-4 flex-1">
                    Once-weekly therapy for provider-guided weight management. Compounded kits from $134/mo on 60-day
                    starter billing for qualifying Michigan patients after clinician review.
                  </p>
                  <Button asChild size="sm" className="w-fit">
                    <Link href="/weight-loss/semaglutide">
                      View Semaglutide kits
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
              <Card className="overflow-hidden p-0 border-primary/25 bg-primary/5 flex flex-col">
                <div className="relative aspect-[4/3] w-full bg-muted/40">
                  <Image
                    src="/images/tirzepatide-vial.png"
                    alt="Compounded Tirzepatide injection vial"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain object-center p-4"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Tirzepatide</h2>
                  <p className="text-sm text-muted-foreground mt-3 mb-4 flex-1">
                    Dual-pathway support for patients whose clinician recommends Tirzepatide. Kits from $149/mo on
                    60-day starter billing after provider approval.
                  </p>
                  <Button asChild size="sm" className="w-fit">
                    <Link href="/weight-loss/tirzepatide">
                      View Tirzepatide kits
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            </div>
            <p className="text-xs text-muted-foreground">
              Compounded medications are prepared pursuant to a patient-specific prescription. They are not the same as
              FDA-approved brand-name Ozempic, Wegovy, Zepbound, or Mounjaro.{" "}
              <Link href="/weight-loss/medications" className="text-primary hover:underline">
                Compare weight loss medications
              </Link>
              .
            </p>
          </div>
        </section>

        <section className="border-b bg-slate-50">
          <div className="container max-w-5xl mx-auto px-4 py-4 sm:py-5">
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center sm:text-left text-xs sm:text-sm text-slate-600">
              <li className="flex items-center justify-center sm:justify-start gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>Serving Michigan patients from Novi</span>
              </li>
              <li className="flex items-center justify-center sm:justify-start gap-2">
                <Stethoscope className="h-4 w-4 text-primary shrink-0" />
                <span>Licensed clinician review before Rx</span>
              </li>
              <li className="flex items-center justify-center sm:justify-start gap-2">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <span>Pharmacy-compounded · transparent pricing</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-background">
          <div className="container max-w-5xl mx-auto px-4">
            <div className="max-w-3xl mb-10">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-2">Weight management</p>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Why choose Clear Choice Pharmacy for weight management
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Clear Choice Pharmacy helps qualifying Michigan patients access provider-guided Semaglutide and
                Tirzepatide weight management. A licensed clinician reviews your intake before any prescription is
                written. When appropriate, our Novi pharmacy compounds and fulfills patient-specific kits with clear
                cash-pay pricing—no membership fee surprises.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-12">
              <Card className="p-5">
                <h3 className="font-semibold mb-2">How the program works</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Choose a kit, complete a secure intake, and authorize a payment hold. Your clinician reviews
                  eligibility. If approved, payment is captured and your pharmacy prepares your kit.
                </p>
                <Link href="/weight-loss#how-it-works" className="text-sm text-primary hover:underline">
                  See program steps
                </Link>
              </Card>
              <Card className="p-5">
                <h3 className="font-semibold mb-2">Semaglutide &amp; Tirzepatide</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Compare how these therapies support appetite regulation and weight management under clinical
                  supervision—and how compounded options differ from brand-name products.
                </p>
                <Link href="/weight-loss/medications" className="text-sm text-primary hover:underline">
                  Compare medication options
                </Link>
              </Card>
              <Card className="p-5">
                <h3 className="font-semibold mb-2">Who may be a candidate</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Eligibility depends on clinical review—BMI, health history, and contraindications matter. Medication
                  is never automatic without an appropriate evaluation.
                </p>
                <Link href="/weight-loss/faq" className="text-sm text-primary hover:underline">
                  Read weight loss FAQ
                </Link>
              </Card>
            </div>

            <div className="rounded-lg border bg-muted/30 p-6 md:p-8">
              <h2 className="text-xl font-bold mb-3">Michigan service area</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Clear Choice Pharmacy is located at 40890 Grand River Ave in Novi and currently dispenses clinical
                weight management programs to qualifying Michigan patients. We commonly serve patients from Novi,
                Northville, Farmington Hills, Wixom, South Lyon, and greater Metro Detroit.
              </p>
              <Link href="/contact" className="text-sm text-primary hover:underline">
                Contact the pharmacy
              </Link>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-primary text-primary-foreground">
          <div className="container max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to start weight management?</h2>
            <p className="text-sm opacity-90 mb-8 max-w-xl mx-auto">
              Review how provider-guided weight management works, compare Semaglutide and Tirzepatide kits, or call{" "}
              (248) 987-6182 with questions. A clinician must evaluate eligibility before any medication is prescribed.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" variant="secondary">
                <Link href="/weight-loss">
                  Explore Semaglutide &amp; Tirzepatide
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                <Link href="/weight-loss/faq">
                  Weight loss FAQ
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 bg-background border-t">
          <div className="container max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <div className="grid gap-6 max-w-3xl mx-auto">
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Do you offer Semaglutide and Tirzepatide weight loss in Michigan?
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Yes. Clear Choice Pharmacy offers provider-guided weight management with compounded Semaglutide and
                  Tirzepatide for qualifying Michigan patients after clinician review. Individual results may vary.{" "}
                  <Link href="/weight-loss" className="text-primary hover:underline">
                    Explore the medical weight loss program
                  </Link>
                  .
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Is compounded Semaglutide the same as Ozempic?</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  No. Ozempic and Wegovy are FDA-approved brand products that contain Semaglutide. We compound
                  Semaglutide pursuant to a patient-specific prescription when a clinician determines it is appropriate.
                  We do not dispense brand-name Ozempic or Wegovy through this program.{" "}
                  <Link href="/weight-loss/semaglutide" className="text-primary hover:underline">
                    Learn about Semaglutide kits
                  </Link>
                  .
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Who evaluates and who fills the medication?</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  A licensed clinician reviews your intake and decides whether a prescription is appropriate. Clear
                  Choice Pharmacy compounds and fulfills approved prescriptions for Michigan patients.{" "}
                  <Link href="/about" className="text-primary hover:underline">
                    About Clear Choice Pharmacy
                  </Link>
                  .
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">How do Semaglutide and Tirzepatide kits work?</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  After clinician approval, Clear Choice Pharmacy compounds a patient-specific kit with transparent
                  cash-pay pricing. Review dosing, inclusions, and starter options on each program page.{" "}
                  <Link href="/weight-loss/medications" className="text-primary hover:underline">
                    Compare medication options
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-muted/30 border-t">
          <div className="container max-w-5xl mx-auto px-4">
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <h2 className="text-2xl font-bold text-foreground mb-4">About Clear Choice Pharmacy</h2>
              <p className="leading-relaxed mb-4">
                Clear Choice Pharmacy is a Novi, Michigan compounding pharmacy focused on{" "}
                <Link href="/weight-loss" className="text-primary hover:underline">
                  provider-guided Semaglutide and Tirzepatide weight management
                </Link>
                . Kits are prepared after licensed clinician review for qualifying Michigan patients. Individual results
                may vary. This content is informational and does not replace medical advice from your provider.
              </p>
              <p className="leading-relaxed">
                Serving Novi, Northville, Farmington Hills, Wixom, South Lyon, and Metro Detroit communities.{" "}
                <Link href="/contact" className="text-primary hover:underline">
                  Contact us
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
