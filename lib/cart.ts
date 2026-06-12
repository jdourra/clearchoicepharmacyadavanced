export interface CartMedication {
  id: string
  name: string
  strength: string
  form: string
  ndc: string
  per_unit_cost: number
  is_generic: boolean
  days_supply?: number
}

export interface CartItem {
  id: string
  medication_id: string
  quantity: number
  price: number
  medication: CartMedication
}

function inferForm(name: string, strength: string, dosageForm?: string | null): string {
  const form = (dosageForm || "").toUpperCase()
  if (form && form !== "EA") return form

  const text = `${name} ${strength}`.toLowerCase()
  if (/\bcapsule\b|\bcap\b/.test(text)) return "CAPSULE"
  if (/\btablet\b|\btb\b/.test(text)) return "TABLET"
  if (/\bsolution\b|\bsoln\b/.test(text)) return "SOLUTION"
  return "TABLET"
}

export function buildCartItem(input: {
  medication: {
    id: string
    name: string
    strength?: string | null
    dosage_form?: string | null
    ndc?: string | null
    per_unit_cost?: number | string | null
    acquisition_cost?: number | string | null
    package_quantity?: number | null
    is_generic?: boolean | null
    days_supply?: number | null
  }
  quantity: number
  price: number
  perUnitCost?: number
}): CartItem {
  const { medication, quantity, price } = input

  let perUnitCost = input.perUnitCost
  if (perUnitCost == null || perUnitCost <= 0) {
    const fromDb = medication.per_unit_cost != null ? Number(medication.per_unit_cost) : 0
    if (fromDb > 0) {
      perUnitCost = fromDb
    } else if (medication.acquisition_cost != null && medication.package_quantity) {
      perUnitCost = Number(medication.acquisition_cost) / Number(medication.package_quantity)
    } else {
      perUnitCost = Math.max((price - 5) / 1.15 / quantity, 0.01)
    }
  }

  return {
    id: `${medication.id}-${Date.now()}`,
    medication_id: medication.id,
    quantity,
    price,
    medication: {
      id: medication.id,
      name: medication.name,
      strength: medication.strength || "",
      form: inferForm(medication.name, medication.strength || "", medication.dosage_form),
      ndc: medication.ndc || "",
      per_unit_cost: perUnitCost,
      is_generic: medication.is_generic ?? true,
      days_supply: medication.days_supply != null ? Number(medication.days_supply) : undefined,
    },
  }
}

export async function hydrateCartItems(rawItems: unknown[]): Promise<CartItem[]> {
  const hydrated = await Promise.all(
    rawItems.map(async (raw) => {
      const item = raw as Partial<CartItem> & { strength?: string }
      if (item.medication?.name && item.id && item.medication_id && item.quantity != null && item.price != null) {
        return item as CartItem
      }

      if (!item.medication_id || item.quantity == null || item.price == null) return null

      try {
        const response = await fetch(`/api/medications/${item.medication_id}`)
        if (!response.ok) return null
        const medication = await response.json()
        const rebuilt = buildCartItem({
          medication,
          quantity: item.quantity,
          price: item.price,
          perUnitCost: item.medication?.per_unit_cost,
        })
        return { ...rebuilt, id: item.id || rebuilt.id }
      } catch {
        return null
      }
    })
  )

  return hydrated.filter(Boolean) as CartItem[]
}
