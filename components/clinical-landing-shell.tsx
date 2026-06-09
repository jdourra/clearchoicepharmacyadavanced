"use client"

import Link from "next/link"
import {
  Activity,
  ArrowRight,
  DollarSign,
  FileCheck,
  FlaskConical,
  Heart,
  HeartHandshake,
  Lock,
  Phone,
  Scale,
  Shield,
  Sparkles,
  type LucideIcon,
} from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

export type ServiceIconName =
  | "flask-conical"
  | "heart"
  | "lock"
  | "shield"
  | "sparkles"
  | "scale"
  | "activity"
  | "file-check"
  | "heart-handshake"
  | "dollar-sign"
  | "phone"

const SERVICE_ICONS: Record<ServiceIconName, LucideIcon> = {
  "flask-conical": FlaskConical,
  heart: Heart,
  lock: Lock,
  shield: Shield,
  sparkles: Sparkles,
  scale: Scale,
  activity: Activity,
  "file-check": FileCheck,
  "heart-handshake": HeartHandshake,
  "dollar-sign": DollarSign,
  phone: Phone,
}

function ServiceIcon({ name, className }: { name: ServiceIconName; className?: string }) {
  const Icon = SERVICE_ICONS[name]
  return <Icon className={className} />
}

type ClinicalLandingShellProps = {
  children: React.ReactNode
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}

export function ClinicalLandingShell({ children, jsonLd }: ClinicalLandingShellProps) {
  const scripts = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {scripts.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}

type PremiumHeroProps = {
  badge: string
  headline: string
  subheadline: string
  description?: string
  highlight?: string
  primaryCta: { label: string; href: string; external?: boolean }
  secondaryCta?: { label: string; href: string; external?: boolean; scrollTo?: string }
}

export function PremiumHero({
  badge,
  headline,
  subheadline,
  description,
  highlight,
  primaryCta,
  secondaryCta,
}: PremiumHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_45%)]" />
      <div className="container relative max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl">
          <Badge className="mb-6 bg-sky-500/20 text-sky-100 border-sky-400/30 hover:bg-sky-500/20">
            {badge}
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance mb-4">
            {headline}
          </h1>
          <p className="text-lg md:text-xl text-sky-100 font-medium mb-4">{subheadline}</p>
          {description && (
            <p className="text-base md:text-lg text-slate-200 leading-relaxed mb-8 max-w-2xl">{description}</p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button
              asChild
              size="lg"
              className="bg-sky-500 hover:bg-sky-400 text-white border-0 shadow-lg shadow-sky-500/25"
            >
              {primaryCta.external ? (
                <a href={primaryCta.href} target="_blank" rel="noopener noreferrer">
                  {primaryCta.label}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              ) : (
                <Link href={primaryCta.href}>
                  {primaryCta.label}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              )}
            </Button>
            {secondaryCta && (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white"
              >
                {secondaryCta.scrollTo ? (
                  <a href={secondaryCta.scrollTo}>{secondaryCta.label}</a>
                ) : secondaryCta.external ? (
                  <a href={secondaryCta.href} target="_blank" rel="noopener noreferrer">
                    {secondaryCta.label}
                  </a>
                ) : (
                  <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
                )}
              </Button>
            )}
          </div>
          {highlight && (
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm text-sky-100">
              {highlight}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

type TrustItem = {
  icon: ServiceIconName
  title: string
  description: string
}

export function TrustRibbon({ items }: { items: TrustItem[] }) {
  return (
    <section className="border-b bg-slate-50">
      <div className="container max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.title} className="flex gap-4 items-start">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600">
                <ServiceIcon name={item.icon} className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">{item.title}</p>
                <p className="text-sm text-slate-600 mt-1">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

type SectionIntroProps = {
  eyebrow: string
  title: string
  description?: string
  className?: string
}

export function SectionIntro({ eyebrow, title, description, className }: SectionIntroProps) {
  return (
    <div className={cn("max-w-2xl mb-10", className)}>
      <p className="text-sm font-semibold uppercase tracking-wide text-sky-600 mb-3">{eyebrow}</p>
      <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-balance">{title}</h2>
      {description && <p className="text-slate-600 leading-relaxed">{description}</p>}
    </div>
  )
}

export function ContentSection({
  children,
  className,
  tone = "white",
  id,
}: {
  children: React.ReactNode
  className?: string
  tone?: "white" | "muted"
  id?: string
}) {
  return (
    <section
      id={id}
      className={cn(
        "py-16 md:py-20 px-4 scroll-mt-20",
        tone === "muted" ? "bg-slate-50 border-y border-slate-200" : "bg-white",
        className,
      )}
    >
      <div className="container max-w-6xl mx-auto">{children}</div>
    </section>
  )
}

export function BenefitList({ items }: { items: string[] }) {
  return (
    <div className="grid md:grid-cols-1 gap-4">
      {items.map((item) => {
        const [title, ...rest] = item.split(": ")
        const body = rest.join(": ")
        return (
          <Card key={item} className="border-slate-200 hover:border-sky-300 hover:shadow-md transition-all">
            <CardContent className="p-6 flex gap-4 items-start">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white text-sm font-bold">
                ✓
              </span>
              <div>
                {body ? (
                  <>
                    <p className="font-semibold text-slate-900 mb-1">{title}</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{body}</p>
                  </>
                ) : (
                  <p className="text-sm text-slate-600 leading-relaxed">{item}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

type FeatureItem = {
  icon: ServiceIconName
  title: string
  description: string
}

export function FeatureGrid({ items }: { items: FeatureItem[] }) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {items.map((item) => (
        <Card
          key={item.title}
          className="border-slate-200 bg-white hover:border-sky-300 hover:shadow-lg transition-all"
        >
          <CardHeader>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 mb-3">
              <ServiceIcon name={item.icon} className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg text-slate-900">{item.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

type StepItem = {
  step: number
  title: string
  description: string
}

export function ProcessSteps({ title, subtitle, steps }: { title: string; subtitle: string; steps: StepItem[] }) {
  return (
    <ContentSection tone="muted">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{title}</h2>
        <p className="text-slate-600">{subtitle}</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {steps.map((item) => (
          <div key={item.step} className="text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-sky-500 text-white text-xl font-bold mb-5">
              {item.step}
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">{item.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
    </ContentSection>
  )
}

type FaqItem = {
  question: string
  answer: string
}

export function FaqSection({ title, subtitle, items }: { title: string; subtitle: string; items: FaqItem[] }) {
  return (
    <ContentSection tone="muted">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{title}</h2>
          <p className="text-slate-600">{subtitle}</p>
        </div>
        <Accordion type="single" collapsible className="rounded-xl border bg-white px-6">
          {items.map((faq) => (
            <AccordionItem key={faq.question} value={faq.question}>
              <AccordionTrigger className="text-base font-semibold text-slate-900 hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 leading-relaxed">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </ContentSection>
  )
}

type PremiumCtaProps = {
  icon?: ServiceIconName
  title: string
  description: string
  primaryCta: { label: string; href: string; external?: boolean }
  secondaryCta?: { label: string; href: string; external?: boolean }
}

export function PremiumCta({ icon, title, description, primaryCta, secondaryCta }: PremiumCtaProps) {
  return (
    <section className="py-16 bg-gradient-to-r from-slate-900 to-sky-950 text-white">
      <div className="container max-w-3xl mx-auto px-4 text-center">
        {icon && <ServiceIcon name={icon} className="h-10 w-10 text-sky-400 mx-auto mb-4" />}
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
        <p className="text-lg text-slate-200 mb-8 opacity-90">{description}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/25"
          >
            {primaryCta.external ? (
              <a href={primaryCta.href} target="_blank" rel="noopener noreferrer">
                {primaryCta.label}
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            ) : (
              <Link href={primaryCta.href}>
                {primaryCta.label}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            )}
          </Button>
          {secondaryCta && (
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white"
            >
              {secondaryCta.external ? (
                <a href={secondaryCta.href} target="_blank" rel="noopener noreferrer">
                  {secondaryCta.label}
                </a>
              ) : (
                <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
              )}
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}

export function PremiumDisclaimer({ children }: { children: React.ReactNode }) {
  return (
    <section className="py-8 md:py-10 px-4 bg-slate-50 border-t border-slate-200">
      <div className="container max-w-4xl mx-auto">
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{children}</p>
      </div>
    </section>
  )
}
