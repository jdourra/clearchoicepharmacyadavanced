/**
 * Verify Stripe keys from .env.local
 *
 * Usage: npm run stripe:verify
 */

import { readFileSync, existsSync } from "fs"
import { join } from "path"
import Stripe from "stripe"

function loadEnvLocal() {
  const envPath = join(process.cwd(), ".env.local")
  if (!existsSync(envPath)) return

  const content = readFileSync(envPath, "utf8")
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}

function pickSecretKey() {
  for (const key of ["STRIPE_SECRET_KEY", "Stripe_Secret_key", "STRIPE_SECRET"]) {
    const value = process.env[key]?.trim()
    if (value?.startsWith("sk_")) return { key, value }
  }
  return null
}

function pickPublishableKey() {
  for (const key of [
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "STRIPE_PUBLISHABLE_KEY",
    "Stripe_Publishable_Key",
  ]) {
    const value = process.env[key]?.trim()
    if (value?.startsWith("pk_")) return { key, value }
  }
  return null
}

async function main() {
  loadEnvLocal()

  const secret = pickSecretKey()
  const publishable = pickPublishableKey()

  if (!secret) {
    console.error("Missing STRIPE_SECRET_KEY in .env.local (should start with sk_)")
    process.exit(1)
  }

  if (!publishable) {
    console.error("Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env.local (should start with pk_)")
    process.exit(1)
  }

  console.log(`Secret key env: ${secret.key}`)
  console.log(`Publishable key env: ${publishable.key}`)

  const stripe = new Stripe(secret.value)
  const intent = await stripe.paymentIntents.create({
    amount: 100,
    currency: "usd",
    capture_method: "manual",
    automatic_payment_methods: { enabled: true },
    metadata: { verify: "clearchoice-stripe-verify" },
  })

  if (!intent.client_secret) {
    throw new Error("Stripe did not return a client secret")
  }

  await stripe.paymentIntents.cancel(intent.id)

  console.log("Stripe OK — payment hold API can be created and cancelled.")
  console.log("Add the same keys to Vercel → Environment Variables → Production and Preview, then redeploy.")
}

main().catch((error) => {
  console.error("Stripe verify failed:", error instanceof Error ? error.message : error)
  process.exit(1)
})
