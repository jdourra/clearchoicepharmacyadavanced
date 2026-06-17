export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://clearchoicepharmacy.com"

export const PHARMACY_PHONE = "+1-248-987-6182"

export const PHARMACY_ADDRESS = {
  "@type": "PostalAddress" as const,
  streetAddress: "40890 Grand River Ave",
  addressLocality: "Novi",
  addressRegion: "MI",
  postalCode: "48375",
  addressCountry: "US",
}

/** Cities and region served — used in JSON-LD for local clinical SEO */
export const AREA_SERVED = [
  { "@type": "City" as const, name: "Novi", containedInPlace: { "@type": "State" as const, name: "Michigan" } },
  { "@type": "City" as const, name: "Northville", containedInPlace: { "@type": "State" as const, name: "Michigan" } },
  { "@type": "City" as const, name: "Farmington Hills", containedInPlace: { "@type": "State" as const, name: "Michigan" } },
  { "@type": "City" as const, name: "Wixom", containedInPlace: { "@type": "State" as const, name: "Michigan" } },
  { "@type": "City" as const, name: "South Lyon", containedInPlace: { "@type": "State" as const, name: "Michigan" } },
  { "@type": "AdministrativeArea" as const, name: "Metro Detroit" },
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
    question: "Why choose sublingual troches over regular ED pills?",
    answer:
      "Troches absorb through the oral mucosa, often working in half the time of swallowed tablets. Because they bypass the digestive tract, they are not affected by food or heavy meals.",
  },
  {
    question: "Can you combine Sildenafil and Tadalafil?",
    answer:
      "Yes. Our compounding pharmacy can create dual-action combination troches with tailored strengths that are not available at retail chains.",
  },
  {
    question: "Is the consultation private?",
    answer:
      "Absolutely. The online consultation is confidential, and your medication is prepared and delivered discreetly through Clear Choice Pharmacy.",
  },
  {
    question: "Do you offer ED compounding in Novi and Metro Detroit?",
    answer:
      "Yes. Clear Choice Pharmacy compounds custom sublingual ED troches for patients in Novi, Northville, Farmington Hills, Wixom, South Lyon, and the greater Metro Detroit area.",
  },
]

export const WEIGHT_LOSS_FAQS: FaqItem[] = [
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
      "Yes. Clear Choice Pharmacy offers upfront cash-pay pricing on compounded GLP formulations—no insurance middlemen or hidden fees.",
  },
  {
    question: "Who is eligible for medical weight loss at Clear Choice Pharmacy?",
    answer:
      "Eligibility is determined by a licensed clinician after your online health review. Programs are available to qualifying patients in Novi, MI and Metro Detroit seeking Semaglutide or Tirzepatide medical weight management.",
  },
]

export const IV_REJUVENATION_FAQS: FaqItem[] = [
  {
    question: "What is the difference between mobile IV and rejuvenation vials?",
    answer:
      "Mobile IV therapy is administered by a licensed RN at your home, office, or hotel — a $50 travel and dispatch fee applies at checkout. Rejuvenation vials are physician-reviewed injectable homekits shipped to your door for self-injection after telehealth approval.",
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
      "Clear Choice IV & Rejuvenation dispatches licensed RNs across Metro Detroit, including Novi, Northville, Farmington Hills, Wixom, and South Lyon. Rejuvenation vial homekits ship nationwide after physician approval.",
  },
  {
    question: "Is there a travel fee for mobile IV?",
    answer:
      "Yes. IV drip prices are listed separately from a flat $50 mobile travel and dispatch fee, shown at checkout before you complete your intake.",
  },
]
