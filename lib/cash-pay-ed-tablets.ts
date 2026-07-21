/** Cash-pay generic ED tablets (not compounded troches) — low cost Rx funnel. */

export type CashPayEdTabletSlug = "sildenafil" | "tadalafil"

export type CashPayEdTabletGuide = {
  slug: CashPayEdTabletSlug
  genericName: string
  brandReference: string
  searchQuery: string
  path: string
  /** Professional SERP title */
  pageTitle: string
  metaDescription: string
  h1: string
  lead: string
  bullets: string[]
  faqs: { question: string; answer: string }[]
  keywords: string[]
}

export const CASH_PAY_ED_TABLETS: Record<CashPayEdTabletSlug, CashPayEdTabletGuide> = {
  sildenafil: {
    slug: "sildenafil",
    genericName: "Sildenafil",
    brandReference: "Viagra",
    searchQuery: "Sildenafil",
    path: "/prescriptions/sildenafil",
    pageTitle: "Low Cost Sildenafil (Viagra Generic) Tablets | Cash-Pay | Clear Choice Pharmacy",
    metaDescription:
      "Low cost Sildenafil tablets—the generic for Viagra—with transparent cash-pay pricing: Drug Cost + 15% + $5. Look up your strength for Michigan patients at Clear Choice Pharmacy, Novi.",
    h1: "Low Cost Sildenafil Tablets (Viagra Generic)",
    lead: "Cash-pay generic Sildenafil tablets priced with our transparent formula—Drug Cost + 15% + $5 dispensing fee. This page is for standard oral tablets, not compounded troches.",
    bullets: [
      "Generic for brand-name Viagra (same active ingredient: Sildenafil)",
      "Look up your prescribed strength and see the cash price instantly",
      "No insurance required — Michigan patients only",
      "Upload a prescription, have your doctor e-prescribe, or use our $40 telemedicine visit if you need a new Rx",
    ],
    faqs: [
      {
        question: "Is Sildenafil the same as Viagra?",
        answer:
          "Sildenafil is the active ingredient in brand-name Viagra. We dispense generic Sildenafil tablets when prescribed—not brand-name Viagra—at cash-pay pricing.",
      },
      {
        question: "How is the price calculated?",
        answer:
          "Drug Cost + 15% + $5 dispensing fee. Search your strength above to see the exact cash-pay total for your quantity.",
      },
      {
        question: "Do you sell compounded Sildenafil troches here?",
        answer:
          "Troches are a separate clinical program. This page is for cash-pay tablet pricing. Compounded options are listed under Men's Health if your provider recommends them.",
      },
    ],
    keywords: [
      "low cost sildenafil",
      "generic viagra",
      "cheap sildenafil",
      "sildenafil tablets",
      "cash pay sildenafil",
      "low cost viagra generic",
    ],
  },
  tadalafil: {
    slug: "tadalafil",
    genericName: "Tadalafil",
    brandReference: "Cialis",
    searchQuery: "Tadalafil",
    path: "/prescriptions/tadalafil",
    pageTitle: "Low Cost Tadalafil (Cialis Generic) Tablets | Cash-Pay | Clear Choice Pharmacy",
    metaDescription:
      "Low cost Tadalafil tablets—the generic for Cialis—with transparent cash-pay pricing: Drug Cost + 15% + $5. Look up your strength for Michigan patients at Clear Choice Pharmacy, Novi.",
    h1: "Low Cost Tadalafil Tablets (Cialis Generic)",
    lead: "Cash-pay generic Tadalafil tablets priced with our transparent formula—Drug Cost + 15% + $5 dispensing fee. This page is for standard oral tablets, not compounded troches.",
    bullets: [
      "Generic for brand-name Cialis (same active ingredient: Tadalafil)",
      "Look up your prescribed strength and see the cash price instantly",
      "No insurance required — Michigan patients only",
      "Upload a prescription, have your doctor e-prescribe, or use our $40 telemedicine visit if you need a new Rx",
    ],
    faqs: [
      {
        question: "Is Tadalafil the same as Cialis?",
        answer:
          "Tadalafil is the active ingredient in brand-name Cialis. We dispense generic Tadalafil tablets when prescribed—not brand-name Cialis—at cash-pay pricing.",
      },
      {
        question: "How is the price calculated?",
        answer:
          "Drug Cost + 15% + $5 dispensing fee. Search your strength above to see the exact cash-pay total for your quantity.",
      },
      {
        question: "Do you sell compounded Tadalafil troches here?",
        answer:
          "Troches are a separate clinical program. This page is for cash-pay tablet pricing. Compounded options are listed under Men's Health if your provider recommends them.",
      },
    ],
    keywords: [
      "low cost tadalafil",
      "low cost cialis",
      "generic cialis",
      "cheap tadalafil",
      "tadalafil tablets",
      "cash pay tadalafil",
    ],
  },
}

export const CASH_PAY_ED_TABLET_SLUGS: CashPayEdTabletSlug[] = ["sildenafil", "tadalafil"]

/** Map common brand / search slugs to the cash-pay tablet guide. */
const DRUG_ALIASES: Record<string, CashPayEdTabletSlug> = {
  sildenafil: "sildenafil",
  viagra: "sildenafil",
  "generic-viagra": "sildenafil",
  "low-cost-sildenafil": "sildenafil",
  "low-cost-viagra": "sildenafil",
  "cheap-viagra": "sildenafil",
  tadalafil: "tadalafil",
  cialis: "tadalafil",
  "generic-cialis": "tadalafil",
  "low-cost-tadalafil": "tadalafil",
  "low-cost-cialis": "tadalafil",
  "cheap-cialis": "tadalafil",
}

export function isCashPayEdTabletSlug(value: string): value is CashPayEdTabletSlug {
  return CASH_PAY_ED_TABLET_SLUGS.includes(value as CashPayEdTabletSlug)
}

export function resolveCashPayEdTabletSlug(value: string): CashPayEdTabletSlug | undefined {
  const key = value.trim().toLowerCase()
  return DRUG_ALIASES[key]
}

export function getCashPayEdTablet(slug: string): CashPayEdTabletGuide | undefined {
  const resolved = resolveCashPayEdTabletSlug(slug)
  if (!resolved) return undefined
  return CASH_PAY_ED_TABLETS[resolved]
}
