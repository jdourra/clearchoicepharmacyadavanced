export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://clearchoicepharmacy.com"

export const HOME_TITLE =
  "Clear Choice Pharmacy | Michigan Prescriptions, Weight Loss, IV & Men's Health | Novi, MI"

export const HOME_DESCRIPTION =
  "Michigan patients only. Clear Choice Pharmacy in Novi, MI offers low-cost cash-pay prescriptions, GLP-1 weight loss, ED medications and TRT, mobile IV rejuvenation across Metro Detroit, and specialty pharmacy care with prior authorization support."

/** Primary service pages — used for JSON-LD navigation hints and consistent SEO labels. */
export const SITE_NAV_LINKS = [
  { name: "Weight Loss & GLP-1", path: "/weight-loss" },
  { name: "ED Medications & TRT", path: "/mens-health" },
  { name: "IV Rejuvenation", path: "/iv-rejuvenation" },
  { name: "Specialty Pharmacy", path: "/specialty-pharmacy" },
  { name: "Low-Cost Prescriptions", path: "/prescriptions" },
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

/** Site-wide keywords focused on Michigan / Metro Detroit intent. */
export const SITE_KEYWORDS = [
  "Clear Choice Pharmacy Novi MI",
  "Michigan cash pay pharmacy",
  "cheap prescriptions Novi MI",
  "low cost pharmacy Michigan",
  "pharmacy without insurance Michigan",
  "cash pay prescriptions Metro Detroit",
  "transparent pharmacy pricing Novi",
  "generic drugs Novi Michigan",
  "prescription price comparison Michigan",
  "Michigan patients only pharmacy",
  "specialty pharmacy Novi MI",
  "specialty medications Michigan",
  "prior authorization pharmacy Michigan",
  "copay assistance Novi MI",
  "GLP-1 weight loss Michigan",
  "Semaglutide Novi MI",
  "Tirzepatide Metro Detroit",
  "medical weight loss Novi Michigan",
  "ED troches Michigan",
  "compounded ED pharmacy Novi",
  "TRT pharmacy Michigan",
  "testosterone replacement therapy Novi MI",
  "men's health pharmacy Michigan",
  "mobile IV therapy Metro Detroit",
  "IV hydration Novi MI",
  "NAD+ IV therapy Michigan",
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
    question: "Do you serve patients outside Michigan?",
    answer:
      "Not at this time. Clear Choice Pharmacy is currently licensed to dispense only to Michigan patients. We are expanding with a telehealth partner and will update eligibility when multi-state coverage is available.",
  },
  {
    question: "Why choose sublingual troches over regular ED pills?",
    answer:
      "Troches absorb through the oral mucosa, often working in half the time of swallowed tablets. Because they bypass the digestive tract, they are not affected by food or heavy meals.",
  },
  {
    question: "Does Clear Choice Pharmacy offer TRT in Michigan?",
    answer:
      "Yes. For Michigan patients, we offer physician-supervised testosterone replacement therapy (TRT) with injectable testosterone cypionate, topical cream, and enclomiphene options. Programs include telehealth review, pharmacy fulfillment in Novi, and transparent cash-pay pricing from $109/mo on quarterly billing.",
  },
  {
    question: "How much does TRT cost at Clear Choice Pharmacy?",
    answer:
      "Injectable testosterone cypionate starts at $129/mo or $109/mo on quarterly billing. Topical testosterone cream starts at $149/mo ($129/mo quarterly). Enclomiphene oral therapy starts at $99/mo ($79/mo quarterly). Pricing includes physician review, medication, supplies, and Michigan shipping or pickup.",
  },
  {
    question: "Do you offer combination troches for premature ejaculation?",
    answer:
      "Yes. PE support can be added as an optional enhancement when you checkout with Sildenafil, Tadalafil, or our dual combination troche—pairing PDE5 support with PE-focused adjunct ingredients tailored by your physician.",
  },
  {
    question: "Which ED troche formulations do you offer?",
    answer:
      "You can select from three compounded troche options during intake: Sildenafil, Tadalafil, and Sildenafil + Tadalafil combination. Optional add-ons for Oxytocin, Apomorphine, and PE support are available at checkout.",
  },
  {
    question: "Can you combine Sildenafil and Tadalafil?",
    answer:
      "Yes. Our compounding pharmacy in Novi, MI can create dual-action combination troches with tailored strengths that are not available at retail chains.",
  },
  {
    question: "Is the consultation private?",
    answer:
      "Absolutely. The online consultation is confidential, and your medication is prepared and delivered discreetly through Clear Choice Pharmacy for Michigan patients.",
  },
  {
    question: "Do you offer ED compounding in Novi and Metro Detroit?",
    answer:
      "Yes. Clear Choice Pharmacy compounds custom sublingual ED troches for Michigan patients in Novi, Northville, Farmington Hills, Wixom, South Lyon, Livonia, Canton, Plymouth, Ann Arbor, Troy, and the greater Metro Detroit area.",
  },
]

export const WEIGHT_LOSS_FAQS: FaqItem[] = [
  {
    question: "Is medical weight loss available outside Michigan?",
    answer:
      "Currently no. GLP-1 and medical weight loss programs through Clear Choice Pharmacy are available to qualifying Michigan patients only, with fulfillment from our Novi pharmacy.",
  },
  {
    question: "What is the difference between Semaglutide and Tirzepatide?",
    answer:
      "Semaglutide is a GLP-1 receptor agonist, while Tirzepatide activates both GLP-1 and GIP pathways. Your provider will recommend the option best suited to your clinical profile and goals.",
  },
  {
    question: "Do I need a prescription for GLP-1 weight loss therapy?",
    answer:
      "Yes. GLP-1 therapies require a valid prescription and clinical evaluation. Complete our online intake to begin the provider review process.",
  },
  {
    question: "Is pricing transparent for GLP-1 programs?",
    answer:
      "Yes. Clear Choice Pharmacy offers upfront cash-pay pricing on compounded GLP formulations for Michigan patients—no insurance middlemen or hidden fees.",
  },
  {
    question: "Who is eligible for medical weight loss at Clear Choice Pharmacy?",
    answer:
      "Eligibility is determined by a licensed clinician after your online health review. Programs are available to qualifying Michigan patients in Novi, Metro Detroit, and statewide seeking Semaglutide or Tirzepatide medical weight management.",
  },
  {
    question: "What is the MIC + B12 skinny shot and how does it help with weight loss?",
    answer:
      "The MIC + B12 skinny shot is a lipotropic injection blend containing Methionine, Inositol, Choline (MIC), Vitamin B12, and L-Carnitine. MIC nutrients support liver function and fat mobilization, B12 supports energy and metabolism, and L-Carnitine helps transport fatty acids for fuel. It is commonly used weekly as metabolic support alongside diet, exercise, and GLP-1 therapy.",
  },
  {
    question: "Can I use MIC + B12 with GLP-1 therapy?",
    answer:
      "Many patients use MIC + B12 as complementary metabolic support while on Semaglutide or Tirzepatide. Your provider will review your health profile and confirm whether combining therapies is appropriate for you.",
  },
]

export const IV_REJUVENATION_FAQS: FaqItem[] = [
  {
    question: "What is the difference between mobile IV and rejuvenation vials?",
    answer:
      "Mobile IV therapy is administered by a licensed RN at your home, office, or hotel in Metro Detroit — a $50 travel and dispatch fee applies at checkout. Rejuvenation vials are physician-reviewed injectable homekits prepared by Clear Choice Pharmacy for eligible Michigan patients after telehealth approval.",
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
      "Yes. A licensed telehealth provider reviews each request before treatment. Clinical intakes for Michigan patients are reviewed by Dr. Dourra and affiliated physicians. IV bags are prepared at Clear Choice Pharmacy pursuant to a patient-specific prescription, then administered by registered nurses.",
  },
  {
    question: "What areas do you serve for mobile IV therapy?",
    answer:
      "Clear Choice IV & Rejuvenation dispatches licensed RNs across Metro Detroit, including Novi, Northville, Farmington Hills, Wixom, South Lyon, Livonia, Canton, Plymouth, and nearby communities. Rejuvenation vial homekits are available to Michigan patients after physician approval.",
  },
  {
    question: "Is there a travel fee for mobile IV?",
    answer:
      "Yes. IV drip prices are listed separately from a flat $50 mobile travel and dispatch fee, shown at checkout before you complete your intake.",
  },
]

export const PRESCRIPTIONS_FAQS: FaqItem[] = [
  {
    question: "Can I order prescriptions if I live outside Michigan?",
    answer:
      "Not right now. Clear Choice Pharmacy can currently fill and ship prescriptions only for Michigan patients. Out-of-state patients should use a pharmacy licensed in their state until we expand with our telehealth partner.",
  },
  {
    question: "How do I find low-cost prescription prices in Michigan?",
    answer:
      "Search any medication on our prescriptions page to see transparent cash-pay pricing. Pickup is available in Novi, MI, and delivery is available to eligible Michigan addresses.",
  },
  {
    question: "Do I need insurance for Clear Choice Pharmacy?",
    answer:
      "No. Our low-cost prescription program is cash-pay with upfront pricing—no insurance required. Specialty pharmacy services can also work with major insurance plans for high-cost medications.",
  },
]
