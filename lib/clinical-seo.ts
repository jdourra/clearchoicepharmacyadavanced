export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://clearchoicepharmacy.com"

export const HOME_TITLE =
  "Clear Choice Pharmacy | Semaglutide, Sildenafil, Tadalafil & Low Cost Prescription Drugs | Novi, MI"

export const HOME_DESCRIPTION =
  "Semaglutide & Tirzepatide weight loss (alternatives patients compare to Ozempic & Wegovy), Sildenafil & Tadalafil ED meds (Viagra & Cialis active ingredients), TRT, mobile IV, and low cost prescription drugs. Clear Choice Pharmacy, Novi, MI — Michigan patients only."

/** Primary service pages — used for JSON-LD navigation hints and consistent SEO labels. */
export const SITE_NAV_LINKS = [
  { name: "Semaglutide & Tirzepatide Weight Loss", path: "/weight-loss" },
  { name: "Tadalafil, Sildenafil & TRT", path: "/mens-health" },
  { name: "Mobile IV Therapy", path: "/iv-rejuvenation" },
  { name: "Specialty Pharmacy", path: "/specialty-pharmacy" },
  { name: "Low Cost Prescription Drugs", path: "/prescriptions" },
  { name: "Learn", path: "/learn" },
  { name: "Our Services", path: "/services" },
] as const

export function buildSiteNavigationJsonLd() {
  return SITE_NAV_LINKS.map((link) => ({
    "@type": "WebPage" as const,
    name: link.name,
    url: `${SITE_URL}${link.path}`,
  }))
}

export const PHARMACY_PHONE = "+1-248-987-6182"

export const PHARMACY_ADDRESS = {
  "@type": "PostalAddress" as const,
  streetAddress: "40890 Grand River Ave",
  addressLocality: "Novi",
  addressRegion: "MI",
  postalCode: "48375",
  addressCountry: "US",
}

/** Cities and region served — used in JSON-LD for local clinical SEO (Michigan only). */
export const AREA_SERVED = [
  { "@type": "State" as const, name: "Michigan" },
  { "@type": "AdministrativeArea" as const, name: "Metro Detroit" },
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

/** High-intent search terms people actually type, with local support. */
export const SITE_KEYWORDS = [
  "semaglutide",
  "tirzepatide",
  "ozempic",
  "wegovy",
  "zepbound",
  "GLP-1",
  "GLP-1 weight loss",
  "medical weight loss",
  "weight loss injections",
  "weight loss clinic",
  "tadalafil",
  "sildenafil",
  "cialis",
  "viagra",
  "ED medication",
  "TRT",
  "testosterone replacement therapy",
  "testosterone cypionate",
  "mobile IV therapy",
  "Myers Cocktail",
  "NAD IV",
  "specialty pharmacy",
  "low cost prescription drugs",
  "cash pay pharmacy",
  "Clear Choice Pharmacy Novi",
  "pharmacy Novi MI",
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
      "Yes. Clear Choice Pharmacy compounds sublingual Tadalafil and Sildenafil troches for qualifying Michigan patients, plus a dual Sildenafil + Tadalafil combination. Pricing starts from $39/mo on quarterly billing for Sildenafil and $49/mo for Tadalafil.",
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
    question: "Does Clear Choice Pharmacy offer TRT?",
    answer:
      "Yes. We offer physician-supervised testosterone replacement therapy (TRT) with injectable testosterone cypionate, topical cream, and enclomiphene. Cash-pay pricing starts from $109/mo on quarterly billing for Michigan patients.",
  },
  {
    question: "How much does TRT cost?",
    answer:
      "Injectable testosterone cypionate starts at $129/mo or $109/mo on quarterly billing. Topical testosterone cream starts at $149/mo ($129/mo quarterly). Enclomiphene starts at $99/mo ($79/mo quarterly). Pricing includes physician review, medication, supplies, and Michigan shipping or pickup.",
  },
  {
    question: "Can you combine Sildenafil and Tadalafil?",
    answer:
      "Yes. Our compounding pharmacy can create dual-action combination troches with tailored strengths that are not available as a single retail tablet.",
  },
  {
    question: "Do you serve patients outside Michigan?",
    answer:
      "Not at this time. Clear Choice Pharmacy is currently licensed to dispense only to Michigan patients.",
  },
  {
    question: "Is the consultation private?",
    answer:
      "Yes. The online consultation is confidential, and medication is prepared and delivered discreetly from our Novi pharmacy.",
  },
]

export const WEIGHT_LOSS_FAQS: FaqItem[] = [
  {
    question: "Do you offer Semaglutide and Tirzepatide for weight loss?",
    answer:
      "Yes. Clear Choice Pharmacy offers physician-reviewed compounded Semaglutide and Tirzepatide programs for qualifying Michigan patients, with transparent cash-pay kit pricing and pharmacy fulfillment from Novi, MI.",
  },
  {
    question: "Is compounded Semaglutide the same as Ozempic or Wegovy?",
    answer:
      "Ozempic and Wegovy are brand-name medications that contain Semaglutide. We compound Semaglutide pursuant to a patient-specific prescription after provider review. We do not dispense brand-name Ozempic or Wegovy through this program. Your clinician determines whether compounded Semaglutide is appropriate for you.",
  },
  {
    question: "Is compounded Tirzepatide the same as Zepbound or Mounjaro?",
    answer:
      "Zepbound and Mounjaro are brand-name medications that contain Tirzepatide. We compound Tirzepatide pursuant to a patient-specific prescription after provider review. We do not dispense brand-name Zepbound or Mounjaro through this program.",
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
    question: "How much does medical weight loss cost?",
    answer:
      "Compounded Semaglutide kits start at $134–$149 depending on dose tier and billing plan. Tirzepatide kits start higher based on dose. Every 30-day kit includes 4 weekly injections, physician review, compounding, supplies, and shipping for Michigan patients.",
  },
  {
    question: "Who is eligible for medical weight loss?",
    answer:
      "Eligibility is determined by a licensed clinician after your online health review. Programs are available to qualifying Michigan patients seeking Semaglutide or Tirzepatide medical weight management.",
  },
  {
    question: "What is the MIC + B12 skinny shot?",
    answer:
      "MIC + B12 is a lipotropic injection blend (Methionine, Inositol, Choline, Vitamin B12, and L-Carnitine) used as metabolic support on its own or alongside Semaglutide or Tirzepatide therapy.",
  },
  {
    question: "Can I use MIC + B12 with GLP-1 therapy?",
    answer:
      "Many patients use MIC + B12 as complementary metabolic support while on Semaglutide or Tirzepatide. Your provider confirms whether combining therapies is appropriate.",
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
