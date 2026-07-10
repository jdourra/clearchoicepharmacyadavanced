/** Michigan-only dispensing eligibility until multi-state telehealth partner is live. */

export const MICHIGAN_STATE_CODE = "MI"
export const MICHIGAN_STATE_NAME = "Michigan"

export const MICHIGAN_ONLY_MESSAGE =
  "Clear Choice Pharmacy can currently dispense only to patients in Michigan. We are expanding with a telehealth partner soon. If you live outside Michigan, please use a pharmacy licensed in your state."

export const MICHIGAN_ONLY_SHORT =
  "Michigan patients only — we cannot fill or ship prescriptions outside Michigan at this time."

const MICHIGAN_ALIASES = new Set([
  "mi",
  "michigan",
  "mich",
  "state of michigan",
])

/** True when the value clearly means Michigan (code or full name). */
export function isMichiganState(value: unknown): boolean {
  if (value == null) return false
  const normalized = String(value)
    .trim()
    .toLowerCase()
    .replace(/[.,]/g, "")
    .replace(/\s+/g, " ")
  if (!normalized) return false
  return MICHIGAN_ALIASES.has(normalized)
}

/** Returns an error message when state is missing or not Michigan; otherwise null. */
export function requireMichiganState(
  value: unknown,
  fieldLabel = "State"
): string | null {
  if (value == null || String(value).trim() === "") {
    return `${fieldLabel} is required. ${MICHIGAN_ONLY_SHORT}`
  }
  if (!isMichiganState(value)) {
    return MICHIGAN_ONLY_MESSAGE
  }
  return null
}

/** Canonical display value for forms locked to Michigan. */
export function michiganStateDisplay(format: "name" | "code" = "name"): string {
  return format === "code" ? MICHIGAN_STATE_CODE : MICHIGAN_STATE_NAME
}
