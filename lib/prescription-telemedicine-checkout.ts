/** Session storage key for checkout context when patient chooses telemedicine at cash-pay checkout. */
export const TELEMEDICINE_CHECKOUT_CONTEXT_KEY = "telemedicine_checkout_context"

export type TelemedicineCheckoutContext = {
  delivery_method: string
  subtotal: number
  telemedicine_fee: number
  delivery_fee: number
  total: number
  notes?: string
}

export function readTelemedicineCheckoutContext(): TelemedicineCheckoutContext | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.sessionStorage.getItem(TELEMEDICINE_CHECKOUT_CONTEXT_KEY)
    if (!raw) return null
    return JSON.parse(raw) as TelemedicineCheckoutContext
  } catch {
    return null
  }
}

export function clearTelemedicineCheckoutContext(): void {
  if (typeof window === "undefined") return
  window.sessionStorage.removeItem(TELEMEDICINE_CHECKOUT_CONTEXT_KEY)
}
