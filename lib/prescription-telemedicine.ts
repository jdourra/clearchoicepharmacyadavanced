import type { CartItem } from "@/lib/cart"
import { buildEdProductUrl } from "@/lib/intake-prefill"

export const TELEMEDICINE_VISIT_FEE = 40

const ORAL_ED_DRUG_PATTERN = /sildenafil|tadalafil|vardenafil|avanafil/i
const TROCHE_PATTERN = /troche/i

export function isEdTrocheMedicationText(name: string, form = "", strength = ""): boolean {
  const text = `${name} ${form} ${strength}`.toLowerCase()
  return TROCHE_PATTERN.test(text)
}

export function mapTrocheProductIdFromName(name: string): string {
  const n = name.toLowerCase()
  if (n.includes("sildenafil") && n.includes("tadalafil")) return "combination-troche"
  if (n.includes("tadalafil")) return "tadalafil-daily"
  return "sildenafil-fast"
}

/** PDP URL when a low-cost Rx search targets compounded ED troches; null for oral tablets. */
export function resolveEdTrocheProductUrl(
  name: string,
  form = "",
  strength = ""
): string | null {
  if (!isEdTrocheMedicationText(name, form, strength)) return null
  return buildEdProductUrl(mapTrocheProductIdFromName(name))
}

export type TelemedicineIntakeType = "ed_troche" | "ed_tablet" | "general"

export type TelemedicineIntakeRoute =
  | { type: "ed_troche"; productId: string }
  | { type: "ed_tablet" }
  | { type: "general" }

export type RxDrugClass =
  | "cardiovascular"
  | "cholesterol"
  | "thyroid"
  | "diabetes"
  | "antibiotic"
  | "mental_health"
  | "general"

export function isEdTrocheMedication(item: CartItem): boolean {
  return isEdTrocheMedicationText(
    item.medication.name,
    item.medication.form,
    item.medication.strength
  )
}

export function isOralEdMedication(item: CartItem): boolean {
  if (isEdTrocheMedication(item)) return false
  return ORAL_ED_DRUG_PATTERN.test(item.medication.name)
}

export function mapTrocheProductId(item: CartItem): string {
  return mapTrocheProductIdFromName(item.medication.name)
}

export function resolveTelemedicineIntakeRoute(items: CartItem[]): TelemedicineIntakeRoute {
  const trocheItem = items.find(isEdTrocheMedication)
  if (trocheItem) {
    return { type: "ed_troche", productId: mapTrocheProductId(trocheItem) }
  }
  if (items.some(isOralEdMedication)) {
    return { type: "ed_tablet" }
  }
  return { type: "general" }
}

export function buildTelemedicineIntakeUrl(orderId: string, route: TelemedicineIntakeRoute): string {
  if (route.type === "ed_troche") {
    const params = new URLSearchParams({ orderId, product: route.productId })
    return `/mens-health/start?${params.toString()}`
  }
  const params = new URLSearchParams({
    orderId,
    type: route.type === "ed_tablet" ? "ed_tablet" : "general",
  })
  return `/prescriptions/telemedicine-intake?${params.toString()}`
}

export function getMedicationDrugClass(name: string): RxDrugClass {
  const n = name.toLowerCase()
  if (/lisinopril|amlodipine|losartan|metoprolol|hydrochlorothiazide|atenolol|carvedilol|valsartan|olmesartan|diltiazem|verapamil|spironolactone|furosemide|clonidine/.test(n)) {
    return "cardiovascular"
  }
  if (/atorvastatin|rosuvastatin|simvastatin|pravastatin|lovastatin|ezetimibe|fenofibrate/.test(n)) {
    return "cholesterol"
  }
  if (/levothyroxine|synthroid|liothyronine|methimazole/.test(n)) {
    return "thyroid"
  }
  if (/metformin|glipizide|glimepiride|pioglitazone|sitagliptin|semaglutide|liraglutide|insulin|jardiance|ozempic/.test(n)) {
    return "diabetes"
  }
  if (/amoxicillin|azithromycin|doxycycline|ciprofloxacin|cephalexin|metronidazole|clindamycin|augmentin|bactrim|penicillin/.test(n)) {
    return "antibiotic"
  }
  if (/sertraline|fluoxetine|escitalopram|citalopram|bupropion|venlafaxine|duloxetine|trazodone|buspirone|alprazolam|lorazepam/.test(n)) {
    return "mental_health"
  }
  return "general"
}

export function collectDrugClassesFromCart(items: CartItem[]): RxDrugClass[] {
  const classes = new Set<RxDrugClass>()
  for (const item of items) {
    classes.add(getMedicationDrugClass(item.medication.name))
  }
  classes.delete("general")
  if (classes.size === 0) return ["general"]
  return Array.from(classes)
}

export function formatCartMedicationLine(item: CartItem): string {
  const parts = [item.medication.name]
  if (item.medication.strength) parts.push(item.medication.strength)
  if (item.medication.form) parts.push(item.medication.form)
  parts.push(`× ${item.quantity}`)
  return parts.join(" ")
}

export function orderItemsToCartLike(
  items: { drug_name: string; quantity: number; price?: number }[]
): CartItem[] {
  return items.map((item, index) => ({
    id: `order-item-${index}`,
    medication_id: "",
    quantity: item.quantity,
    price: item.price ?? 0,
    medication: {
      id: "",
      name: item.drug_name,
      strength: "",
      form: "TABLET",
      ndc: "",
      per_unit_cost: 0,
      is_generic: true,
    },
  }))
}

export function resolveTelemedicineIntakeRouteFromOrderItems(
  items: { drug_name: string; quantity: number; price?: number }[]
): TelemedicineIntakeRoute {
  return resolveTelemedicineIntakeRoute(orderItemsToCartLike(items))
}
