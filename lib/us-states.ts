/** U.S. states and the GLP-1 video-visit states from the clinician network. */

export type UsState = {
  code: string
  name: string
}

export const US_STATES: UsState[] = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
]

/**
 * Not offered until the state telemedicine registration is on file.
 * Alaska, Mississippi, and New Jersey.
 */
export const INTAKE_UNAVAILABLE_STATE_CODES = new Set(["AK", "MS", "NJ"])

/** States a patient can select for a weight-loss, hormone, or ED intake. */
export const TELEHEALTH_STATES = US_STATES.filter(
  (state) => !INTAKE_UNAVAILABLE_STATE_CODES.has(state.code)
)

/**
 * States that require a live video visit before a weight-loss, hormone, or ED consult.
 * Mississippi and New Jersey stay in this set for existing records. New intakes in those
 * states are already rejected by INTAKE_UNAVAILABLE_STATE_CODES.
 */
export const SYNC_VISIT_STATE_CODES = new Set([
  "AR",
  "DC",
  "GA",
  "ID",
  "KS",
  "MS",
  "NJ",
  "NM",
  "RI",
  "SD",
  "VT",
  "VA",
  "WV",
  "WI",
])

const BY_CODE = new Map(US_STATES.map((state) => [state.code, state]))
const BY_NAME = new Map(US_STATES.map((state) => [state.name.toLowerCase(), state]))

export function parseUsState(value: unknown): UsState | null {
  if (value == null) return null
  const text = String(value).trim()
  if (!text) return null
  const byCode = BY_CODE.get(text.toUpperCase())
  if (byCode) return byCode
  return BY_NAME.get(text.toLowerCase()) ?? null
}

export function requiresSyncVisit(value: unknown): boolean {
  const state = parseUsState(value)
  return state != null && SYNC_VISIT_STATE_CODES.has(state.code)
}

function stateListLabel(state: UsState): string {
  return state.code === "DC" ? "the District of Columbia" : state.name
}

/** Offered states where a live video visit is required. Paused states are omitted. */
export function offeredSyncVisitStateNames(): string[] {
  return US_STATES.filter(
    (state) => SYNC_VISIT_STATE_CODES.has(state.code) && !INTAKE_UNAVAILABLE_STATE_CODES.has(state.code)
  ).map(stateListLabel)
}

export const LIVE_VIDEO_VISIT_NOTE = (() => {
  const names = offeredSyncVisitStateNames()
  const list = names.length > 1 ? `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}` : names.join("")
  return `${list} require a live video visit for weight loss, hormone therapy, and ED medication.`
})()

/** Any offered U.S. state or the District of Columbia. Does not allow territories or paused states. */
export function requireUsState(value: unknown, fieldLabel = "State"): string | null {
  if (value == null || String(value).trim() === "") {
    return `${fieldLabel} is required.`
  }
  const state = parseUsState(value)
  if (!state) {
    return `${fieldLabel} must be a U.S. state or the District of Columbia.`
  }
  if (INTAKE_UNAVAILABLE_STATE_CODES.has(state.code)) {
    return `${state.name} is not currently available for weight loss, hormone therapy, or ED intakes.`
  }
  return null
}
