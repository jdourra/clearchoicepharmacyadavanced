export type QuoteLine = {
  id: string
  medicationId: string
  name: string
  strength: string
  dosageForm: string
  quantity: number
  price: number
  perUnitCost?: number
  isGeneric?: boolean
}

const QUOTE_STORAGE_KEY = "medication-quote"

export function loadSavedQuote(): QuoteLine[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(QUOTE_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveQuote(lines: QuoteLine[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(QUOTE_STORAGE_KEY, JSON.stringify(lines))
}

export function clearSavedQuote() {
  if (typeof window === "undefined") return
  localStorage.removeItem(QUOTE_STORAGE_KEY)
}

export function quoteTotal(lines: QuoteLine[]): number {
  return lines.reduce((sum, line) => sum + line.price, 0)
}
