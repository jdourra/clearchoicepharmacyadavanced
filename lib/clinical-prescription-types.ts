/** Client-safe prescription field types (no Node/PDF imports). */
export type ClinicalRxPayload = {
  medicationName: string
  strength: string
  directions: string
  quantity: string
  refills: number
  clinicianEsignName?: string
}
