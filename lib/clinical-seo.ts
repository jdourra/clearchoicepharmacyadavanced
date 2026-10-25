import { weightLossHowYouPay } from "@/lib/weight-loss-catalog"

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://clearchoicepharmacy.com"

export const HOME_TITLE =
  "Semaglutide & Tirzepatide Weight Loss in Michigan | Clear Choice Pharmacy"

export const HOME_DESCRIPTION =
  "Provider-guided Semaglutide and Tirzepatide weight management in Michigan. Compounded kits after clinician review, fulfilled by Clear Choice Pharmacy in Westland. Transparent cash-pay pricing for qualifying patients."

/** Primary service pages — used for JSON-LD navigation hints and consistent SEO labels. */
export const SITE_NAV_LINKS = [
  { name: "Semaglutide & Tirzepatide Weight Loss", path: "/weight-loss" },
  { name: "GLP-1 Weight Management", path: "/weight-loss/glp-1" },
  { name: "Semaglutide Kits", path: "/weight-loss/semaglutide" },
  { name: "Tirzepatide Kits", path: "/weight-loss/tirzepatide" },
  { name: "Weight Loss Medications", path: "/weight-loss/medications" },
  { name: "Weight Loss FAQ", path: "/weight-loss/faq" },
  { name: "Low Cost Prescription Drugs", path: "/prescriptions" },
  { name: "Compounding", path: "/compounding" },
  { name: "Specialty Pharmacy", path: "/specialty-pharmacy" },
  { name: "Tadalafil & Sildenafil", path: "/mens-health" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
  { name: "Learn", path: "/learn" },
] as const

export function buildSiteNavigationJsonLd() {
  return SITE_NAV_LINKS.map((link) => ({
    "@type": "WebPage" as const,
    name: link.name,
    url: `${SITE_URL}${link.path}`,
  }))
}

export type BreadcrumbItem = { name: string; path: string }

/** BreadcrumbList JSON-LD for weight-loss cluster and trust pages. */
export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.path.startsWith("http") ? item.path : `${SITE_URL}${item.path}`,
    })),
  }
}

export { PHARMACY_PHONE_E164 as PHARMACY_PHONE } from "@/lib/phone"
import { PHARMACY_PHONE_E164 as PHARMACY_PHONE } from "@/lib/phone"

export const PHARMACY_ADDRESS = {
  "@type": "PostalAddress" as const,
  streetAddress: "8276 N Merriman Rd",
  addressLocality: "Westland",
  addressRegion: "MI",
  postalCode: "48185",
  addressCountry: "US",
}

/** Cities and region served — used in JSON-LD for local clinical SEO (Michigan only). */
export const AREA_SERVED = [
  { "@type": "State" as const, name: "Michigan" },
  { "@type": "AdministrativeArea" as const, name: "Metro Detroit" },
  { "@type": "City" as const, name: "Westland", containedInPlace: { "@type": "State" as const, name: "Michigan" } },
  { "@type": "City" as const, name: "Novi", containedInPlace: { "@type": "State" as const, name: "Michigan" } },
  { "@type": "City" as const, name: "Northville", containedInPlace: { "@type": "State" as const, name: "Michigan" } },
  { "@type": "City" as const, name: "Farmington Hills", containedInPlace: { "@type": "State" as const, name: "Michigan" } },
  { "@type": "City" as const, name: "Wixom", containedInPlace: { "@type": "State" as const, name: "Michigan" } },
  { "@type": "City" as const, name: "South Lyon", containedInPlace: { "@type": "State" as const, name: "Michigan" } },
  { "@type": "City" as const, name: "Livonia", containedInPlace: { "@type": "State" as const, name: "Michigan" } },
  { "@type": "City" as const, name: "Canton", containedInPlace: { "@type": "State" as const, name: "Michigan" } },
  { "@type": "City" as const, name: "Plymouth", containedInPlace: { "@type": "State" as const, name: "Michigan" } },
  { "@type": "City" as const, name: "Ann Arbor", containedInPlace: { "@type": "State" as const, name: "Michigan" } },
  { "@type": "City" as const, name: "Troy", containedInPlace: { "@type": "State" as const, name: "Michigan" } },
  { "@type": "City" as const, name: "West Bloomfield", containedInPlace: { "@type": "State" as const, name: "Michigan" } },
  { "@type": "City" as const, name: "Commerce Township", containedInPlace: { "@type": "State" as const, name: "Michigan" } },
]

/** Short keyword list — rely on titles, H1s, and content rather than keyword stuffing. */
export const SITE_KEYWORDS = [
  "Semaglutide weight loss Michigan",
  "Tirzepatide weight loss Michigan",
  "Semaglutide Michigan",
  "Tirzepatide Michigan",
  "medical weight loss Michigan",
  "compounded Semaglutide Novi",
  "compounded Tirzepatide Novi",
  "weight loss pharmacy Michigan",
  "GLP-1 pharmacy Michigan",
  "Clear Choice Pharmacy Westland",
]

export type FaqItem = { question: string; answer: string }

export function buildFaqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }
}

export function pharmacyProviderSchema() {
  return {
    "@type": "Pharmacy" as const,
    name: "Clear Choice Pharmacy",
    telephone: PHARMACY_PHONE,
    address: PHARMACY_ADDRESS,
    areaServed: AREA_SERVED,
  }
}

export const MENS_HEALTH_FAQS: FaqItem[] = [
  {
    question: "Do you offer Tadalafil and Sildenafil?",
    answer:
      "Yes. Sildenafil, tadalafil, and a dual combination are available after a clinician licensed in your state reviews your intake. If approved, a pharmacy licensed to dispense in your state fills the prescription. Pricing starts from $39/mo for Sildenafil and $49/mo for Tadalafil on quarterly billing.",
  },
  {
    question: "Is Tadalafil the same as Cialis?",
    answer:
      "Tadalafil is the active ingredient in brand-name Cialis. We compound custom Tadalafil troches pursuant to a provider prescription. We do not sell brand-name Cialis tablets through the men's health program.",
  },
  {
    question: "Is Sildenafil the same as Viagra?",
    answer:
      "Sildenafil is the active ingredient in brand-name Viagra. Our men's health program offers compounded Sildenafil troches designed for faster sublingual absorption after physician review.",
  },
  {
    question: "Why choose sublingual troches over regular ED pills?",
    answer:
      "Troches absorb through the oral mucosa, often working in half the time of swallowed tablets. Because they bypass the digestive tract, they are not affected by food or heavy meals.",
  },
  {
    question: "Can you combine Sildenafil and Tadalafil?",
    answer:
      "Yes. A licensed pharmacy can prepare a dual-action combination with strengths that are not available as a single retail tablet, after a clinician licensed in your state approves it.",
  },
  {
    question: "Do you serve patients outside Michigan?",
    answer:
      "Yes for weight loss, hormone therapy, and ED medication. A clinician licensed in your state reviews the intake, and a pharmacy licensed to dispense in your state fills an approved prescription. Prescriptions that Clear Choice Pharmacy dispenses itself remain limited to Michigan patients. A few states require a live video visit.",
  },
  {
    question: "Is the consultation private?",
    answer:
      "Yes. The online consultation is confidential. Approved ED medication is filled by a pharmacy licensed to dispense in your state and shipped discreetly.",
  },
]

export const WEIGHT_LOSS_FAQS: FaqItem[] = [
  {
    question: "Do you offer Semaglutide and Tirzepatide for weight management?",
    answer:
      `Yes. ${weightLossHowYouPay()} A licensed doctor reviews the intake. If treatment is approved, a licensed partner pharmacy fills and ships compounded semaglutide or tirzepatide. Clear Choice Pharmacy does not compound or ship these vials. Individual results may vary.`,
  },
  {
    question: "Is compounded Semaglutide the same as Ozempic or Wegovy?",
    answer:
      "Ozempic and Wegovy are brand-name medications that contain semaglutide. Compounded semaglutide in this program is prepared by a licensed partner pharmacy pursuant to a patient-specific prescription. Clear Choice Pharmacy does not compound these vials and does not dispense brand-name Ozempic or Wegovy.",
  },
  {
    question: "Is compounded Tirzepatide the same as Zepbound or Mounjaro?",
    answer:
      "Zepbound and Mounjaro are brand-name medications that contain tirzepatide. Compounded tirzepatide in this program is prepared by a licensed partner pharmacy pursuant to a patient-specific prescription. Clear Choice Pharmacy does not compound these vials and does not dispense brand-name Zepbound or Mounjaro.",
  },
  {
    question: "What is the difference between Semaglutide and Tirzepatide?",
    answer:
      "Semaglutide is a GLP-1 receptor agonist. Tirzepatide activates both GLP-1 and GIP pathways. Your provider recommends the option best suited to your clinical profile and goals.",
  },
  {
    question: "Do I need a prescription for GLP-1 weight loss therapy?",
    answer:
      "Yes. Semaglutide and Tirzepatide require a valid prescription and clinical evaluation. Complete our online intake to begin provider review.",
  },
  {
    question: "How much does provider-guided weight management cost?",
    answer:
      "Compounded semaglutide kits are priced by weekly injection dose from $134–$289 depending on strength and billing plan. Tirzepatide kits range from $149–$319 by weekly dose. Every 30-day kit includes 4 weekly injections, doctor review, supplies, and shipping by a licensed partner pharmacy. Clear Choice Pharmacy does not compound or ship these vials. If a live visit is required, a $25 add-on applies on monthly billing and is waived with the 90-day (3-kit) supply.",
  },
  {
    question: "Who is eligible for provider-guided weight management?",
    answer:
      "Eligibility is determined by a licensed doctor after your online health review. Approval is not guaranteed. If treatment is approved, a licensed partner pharmacy fills and ships the medication.",
  },
]

export const IV_REJUVENATION_FAQS: FaqItem[] = [
  {
    question: "What mobile IV drips do you offer?",
    answer:
      "Clear Choice IV & Rejuvenation offers Myers' Cocktail, NAD+, hydration, immunity, hangover recovery, and other pharmacy-formulated drips administered by licensed RNs across Metro Detroit.",
  },
  {
    question: "What is the difference between mobile IV and rejuvenation vials?",
    answer:
      "Mobile IV therapy is administered by a licensed RN at your home, office, or hotel in Metro Detroit — a $50 travel and dispatch fee applies at checkout. Rejuvenation vials are physician-reviewed injectable homekits for eligible Michigan patients after telehealth approval.",
  },
  {
    question: "Does mobile IV therapy hurt?",
    answer:
      "Most patients experience minimal discomfort. Our licensed RNs use a micro-needle technique for a smooth, professional insertion.",
  },
  {
    question: "How long does a mobile IV drip take?",
    answer:
      "Most IV drips take 45–60 minutes. NAD+ therapy requires a longer, monitored infusion of approximately 2 hours.",
  },
  {
    question: "Is mobile IV therapy safe?",
    answer:
      "Yes. A licensed telehealth provider reviews each request before treatment. IV bags are prepared at Clear Choice Pharmacy pursuant to a patient-specific prescription, then administered by registered nurses.",
  },
  {
    question: "What areas do you serve for mobile IV therapy?",
    answer:
      "We dispatch licensed RNs across Metro Detroit, including Novi, Northville, Farmington Hills, Wixom, South Lyon, Livonia, Canton, Plymouth, and nearby communities.",
  },
  {
    question: "Is there a travel fee for mobile IV?",
    answer:
      "Yes. IV drip prices are listed separately from a flat $50 mobile travel and dispatch fee, shown at checkout before you complete your intake.",
  },
]

export const PRESCRIPTIONS_FAQS: FaqItem[] = [
  {
    question: "How do I find low cost prescription drug prices?",
    answer:
      "Search any medication on our prescriptions page to see transparent cash-pay pricing. Most common meds hover around $5 for a 30-day supply. Formula: Drug Cost + 15% + $5 dispensing fee.",
  },
  {
    question: "Do you offer low cost Cialis or Viagra generics?",
    answer:
      "Yes. We fill cash-pay generic Tadalafil tablets (Cialis active ingredient) and Sildenafil tablets (Viagra active ingredient) with the same Drug Cost + 15% + $5 formula. See /prescriptions/tadalafil and /prescriptions/sildenafil. These are standard tablets—not compounded troches.",
  },
  {
    question: "Do I need insurance?",
    answer:
      "No. Our low-cost prescription program is cash-pay with upfront pricing—no insurance required. Specialty pharmacy services can also work with major insurance plans for high-cost medications.",
  },
  {
    question: "Can I order prescriptions if I live outside Michigan?",
    answer:
      "Not right now. Clear Choice Pharmacy can currently fill and ship prescriptions only for Michigan patients.",
  },
]
