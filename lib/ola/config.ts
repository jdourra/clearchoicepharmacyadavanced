import "server-only"

export type OlaPharmacyDetails = {
  name: string
  address: string
  phone: string
}

export type OlaConfig = {
  baseUrl: string
  authToken: string
  secretToken: string
  tenant: string
  syncServiceId: string
  pharmacy: OlaPharmacyDetails | null
}

function trimmed(name: string): string {
  return process.env[name]?.trim() || ""
}

/** Credentials are present. Does not mean intakes should be sent. */
export function getOlaConfig(): OlaConfig | null {
  const authToken = trimmed("OLA_AUTH_TOKEN")
  const secretToken = trimmed("OLA_SECRET_TOKEN")
  if (!authToken || !secretToken) return null

  const name = trimmed("OLA_PHARMACY_NAME")
  const address = trimmed("OLA_PHARMACY_ADDRESS")
  const phone = trimmed("OLA_PHARMACY_PHONE")

  return {
    baseUrl: (trimmed("OLA_API_BASE_URL") || "https://new-dev-api.ola-digital-int.com").replace(/\/$/, ""),
    authToken,
    secretToken,
    tenant: trimmed("OLA_TENANT") || "truecare",
    syncServiceId: trimmed("OLA_SYNC_SERVICE_ID") || "2738",
    pharmacy: name && address && phone ? { name, address, phone } : null,
  }
}

export function isOlaConfigured(): boolean {
  return getOlaConfig() != null
}

/** Explicit opt-in so staging credentials on the server do not send every intake. */
export function isOlaHandoffEnabled(): boolean {
  return trimmed("OLA_HANDOFF_ENABLED") === "true" && isOlaConfigured()
}

export type OlaServiceSelection = {
  serviceKey: string
  scheduleType: "subscription" | "one-time"
}

/**
 * Monthly semaglutide has a staging key. 3-month supplies and tirzepatide
 * stay queued until their own keys are set. Do not reuse the monthly key.
 */
export function weightLossOlaService(
  program: string,
  billingPlan: string
): OlaServiceSelection | null {
  const quarterly = billingPlan === "quarterly"
  const scheduleType = quarterly ? "one-time" : "subscription"

  if (program === "semaglutide") {
    const serviceKey = quarterly
      ? trimmed("OLA_SERVICE_KEY_SEMAGLUTIDE_3_MONTH")
      : trimmed("OLA_SERVICE_KEY_SEMAGLUTIDE") || "truecare-semaglutide-injection"
    return serviceKey ? { serviceKey, scheduleType } : null
  }

  if (program === "tirzepatide") {
    const serviceKey = quarterly
      ? trimmed("OLA_SERVICE_KEY_TIRZEPATIDE_3_MONTH")
      : trimmed("OLA_SERVICE_KEY_TIRZEPATIDE")
    return serviceKey ? { serviceKey, scheduleType } : null
  }

  return null
}
