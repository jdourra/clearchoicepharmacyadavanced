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

function readStripeValue(keys: readonly string[], prefix: "sk_" | "pk_"): string | undefined {
  for (const key of keys) {
    const value = normalizeEnvValue(process.env[key], key)
    if (value?.startsWith(prefix)) return value
  }
  return undefined
}

export function getStripeSecretKey(): string | undefined {
  return readStripeValue(SECRET_ENV_KEYS, "sk_")
}

export function getStripePublishableKey(): string | undefined {
  return readStripeValue(PUBLISHABLE_ENV_KEYS, "pk_")
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
    configured: Boolean(secretEnvKey && publishableEnvKey),
    hasSecretKey: Boolean(secretEnvKey),
    hasPublishableKey: Boolean(publishableEnvKey),
    secretEnvKey,
    publishableEnvKey,
    issues,
  }
}
