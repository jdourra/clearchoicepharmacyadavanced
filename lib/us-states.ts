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

/** GLP-1 states that require a live video visit before the consult is created. */
export const SYNC_VISIT_STATE_CODES = new Set([
  "AR",
  "DC",
  "KS",
  "MS",
  "NJ",
  "NM",
  "RI",
  "WV",
  "VA",
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

/** Any U.S. state or the District of Columbia. Does not allow territories. */
export function requireUsState(value: unknown, fieldLabel = "State"): string | null {
  if (value == null || String(value).trim() === "") {
    return `${fieldLabel} is required.`
  }
  if (!parseUsState(value)) {
    return `${fieldLabel} must be a U.S. state or the District of Columbia.`
  }
  return null
}
