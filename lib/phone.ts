/** US phone display / input helpers — always (xxx) xxx-xxxx for 10-digit numbers. */

export const PHARMACY_PHONE_DISPLAY = "(248) 987-6182"
export const PHARMACY_FAX_DISPLAY = "(248) 987-4963"
/** E.164 for tel: links and schema.org */
export const PHARMACY_PHONE_E164 = "+12489876182"
export const PHARMACY_FAX_E164 = "+12489874963"
export const PHARMACY_PHONE_TEL_HREF = `tel:${PHARMACY_PHONE_E164}`

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "")
}

/**
 * Format as (xxx) xxx-xxxx while typing.
 * Strips a leading country code 1 when 11 digits are present.
 * Accepts raw digits (xxxxxxxxxx), dashed, or partially typed input.
 */
export function formatPhoneInput(value: string): string {
  let d = digitsOnly(value)
  if (d.length === 11 && d.startsWith("1")) d = d.slice(1)
  d = d.slice(0, 10)
  if (d.length === 0) return ""
  if (d.length <= 3) return `(${d}`
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
}

/** Always returns (xxx) xxx-xxxx when 10 digits are present; otherwise best-effort format. */
export function formatPhoneDisplay(value: string | null | undefined): string {
  if (value == null || value === "") return ""
  let d = digitsOnly(String(value))
  if (d.length === 11 && d.startsWith("1")) d = d.slice(1)
  if (d.length === 10) {
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
  }
  return formatPhoneInput(String(value)) || String(value)
}

/** Build a tel: href from any phone string. */
export function phoneTelHref(value: string | null | undefined): string {
  let d = digitsOnly(String(value ?? ""))
  if (d.length === 11 && d.startsWith("1")) d = d.slice(1)
  if (d.length === 10) return `tel:+1${d}`
  if (d.length > 0) return `tel:${d}`
  return "tel:"
}
