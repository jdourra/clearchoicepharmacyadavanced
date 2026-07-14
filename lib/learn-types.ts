export type LearnCategory =
  | "weight-loss"
  | "mens-health"
  | "iv-therapy"
  | "prescriptions"
  | "specialty"

export type LearnSection = {
  heading: string
  paragraphs: string[]
  bullets?: string[]
}

export type LearnFaq = {
  question: string
  answer: string
}

export type LearnArticle = {
  slug: string
  title: string
  description: string
  keywords: string[]
  category: LearnCategory
  categoryLabel: string
  publishedAt: string
  updatedAt: string
  readingMinutes: number
  primaryKeyword: string
  serviceHref: string
  serviceCta: string
  relatedSlugs: string[]
  intro: string[]
  sections: LearnSection[]
  faqs: LearnFaq[]
  disclaimer: string
}

export const LEARN_CATEGORY_LABELS: Record<LearnCategory, string> = {
  "weight-loss": "Weight Loss",
  "mens-health": "Men's Health",
  "iv-therapy": "IV Therapy",
  prescriptions: "Prescriptions",
  specialty: "Specialty Pharmacy",
}
