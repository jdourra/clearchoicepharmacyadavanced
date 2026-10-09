import "server-only"
import { normalizeEnvValue } from "@/lib/s3-env"

const SECRET_ENV_KEYS = [
  "STRIPE_SECRET_KEY",
  "Stripe_Secret_key",
  "STRIPE_SECRET",
] as const

const PUBLISHABLE_ENV_KEYS = [
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_PUBLISHABLE_KEY",
  "Stripe_Publishable_Key",
] as const

function readStripeValues(keys: readonly string[], prefix: "sk_" | "pk_"): string[] {
  const values: string[] = []
  for (const key of keys) {
    const value = normalizeEnvValue(process.env[key], key)
    if (value?.startsWith(prefix)) values.push(value)
  }
  return values
}

/** Live and test keys from one Stripe account share a long prefix. The rest of each key is different. */
export function sameStripeAccount(left: string, right: string): boolean {
  const leftMatch = left.match(/^(?:pk|sk)_(live|test)_(.+)$/)
  const rightMatch = right.match(/^(?:pk|sk)_(live|test)_(.+)$/)
  if (!leftMatch || !rightMatch || leftMatch[1] !== rightMatch[1]) return false
  const leftBody = leftMatch[2]
  const rightBody = rightMatch[2]
  let shared = 0
  const max = Math.min(leftBody.length, rightBody.length)
  while (shared < max && leftBody[shared] === rightBody[shared]) shared++
  return shared >= 16
}

export function getStripePublishableKey(): string | undefined {
  return readStripeValues(PUBLISHABLE_ENV_KEYS, "pk_")[0]
}

export function getStripeSecretKey(): string | undefined {
  const secrets = readStripeValues(SECRET_ENV_KEYS, "sk_")
  const publishable = getStripePublishableKey()
  if (!publishable) return secrets[0]
  return secrets.find((secret) => sameStripeAccount(secret, publishable))
}

export function stripeKeysMismatch(): boolean {
  const publishable = getStripePublishableKey()
  const secrets = readStripeValues(SECRET_ENV_KEYS, "sk_")
  return Boolean(publishable && secrets.length > 0 && !getStripeSecretKey())
}

export function isStripeConfigured(): boolean {
  return Boolean(getStripeSecretKey())
}

export function stripeConfigStatus(): {
  configured: boolean
  hasSecretKey: boolean
  hasPublishableKey: boolean
  secretEnvKey: string | null
  publishableEnvKey: string | null
  issues: string[]
} {
  const issues: string[] = []
  let secretEnvKey: string | null = null
  let publishableEnvKey: string | null = null

  for (const key of SECRET_ENV_KEYS) {
    const value = normalizeEnvValue(process.env[key], key)
    if (value?.startsWith("sk_")) {
      secretEnvKey = key
      break
    }
    if (value && !value.startsWith("sk_")) {
      issues.push(`${key} should start with sk_ — check for typos or extra characters.`)
    }
  }

  for (const key of PUBLISHABLE_ENV_KEYS) {
    const value = normalizeEnvValue(process.env[key], key)
    if (value?.startsWith("pk_")) {
      publishableEnvKey = key
      break
    }
    if (value && !value.startsWith("pk_")) {
      issues.push(`${key} should start with pk_ — check for typos or extra characters.`)
    }
  }

  if (!secretEnvKey) {
    issues.push("Missing STRIPE_SECRET_KEY in server environment (Vercel → Production + Preview).")
  }
  if (!publishableEnvKey) {
    issues.push("Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (Vercel → Production + Preview).")
  }
  if (stripeKeysMismatch()) {
    issues.push(
      "STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY are from different Stripe accounts or different modes (test vs live). Paste both keys from the same account."
    )
  }

  const rawSecret = process.env.STRIPE_SECRET_KEY
  if (rawSecret?.includes("STRIPE_SECRET_KEY=")) {
    issues.push("STRIPE_SECRET_KEY value contains 'STRIPE_SECRET_KEY=' — paste only the sk_... key.")
  }

  const rawPublishable = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  if (rawPublishable?.includes("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=")) {
    issues.push(
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY value contains the variable name — paste only the pk_... key."
    )
  }

  return {
    configured: Boolean(getStripeSecretKey() && publishableEnvKey),
    hasSecretKey: Boolean(secretEnvKey),
    hasPublishableKey: Boolean(publishableEnvKey),
    secretEnvKey,
    publishableEnvKey,
    issues,
  }
}
