import "server-only"
import { createHash, randomBytes } from "node:crypto"
import { sql } from "@/lib/db"
import { sendPatientEmail } from "@/lib/ses-mail"
import { CONTACT_EMAIL, SITE_URL } from "@/lib/site-config"
import { PHARMACY_PHONE_DISPLAY } from "@/lib/phone"

const RESET_TTL_MS = 60 * 60 * 1000

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

export async function ensurePasswordResetTable(): Promise<void> {
  await sql(
    `CREATE TABLE IF NOT EXISTS patient_password_resets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      patient_id TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
    []
  )
  await sql(
    `CREATE INDEX IF NOT EXISTS idx_patient_password_resets_patient
     ON patient_password_resets (patient_id, created_at DESC)`,
    []
  ).catch(() => [])
}

export async function requestPatientPasswordReset(email: string): Promise<void> {
  const normalized = email.trim().toLowerCase()
  if (!normalized || !normalized.includes("@")) {
    throw new Error("Enter the email on your account.")
  }

  await ensurePasswordResetTable()

  const patients = await sql(
    `SELECT id, first_name, email FROM patients WHERE LOWER(email) = $1 LIMIT 1`,
    [normalized]
  )
  if (patients.length === 0) return

  const patient = patients[0] as { id: string; first_name: string | null; email: string }
  const recent = await sql(
    `SELECT id FROM patient_password_resets
     WHERE patient_id = $1 AND used_at IS NULL AND created_at > NOW() - INTERVAL '2 minutes'
     LIMIT 1`,
    [String(patient.id)]
  )
  if (recent.length > 0) return

  const token = randomBytes(32).toString("hex")
  const tokenHash = hashToken(token)
  const expiresAt = new Date(Date.now() + RESET_TTL_MS).toISOString()

  await sql(
    `UPDATE patient_password_resets SET used_at = NOW()
     WHERE patient_id = $1 AND used_at IS NULL`,
    [String(patient.id)]
  )
  await sql(
    `INSERT INTO patient_password_resets (patient_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [String(patient.id), tokenHash, expiresAt]
  )

  const resetUrl = `${SITE_URL.replace(/\/$/, "")}/auth/reset-password?token=${token}`
  const greeting = patient.first_name?.trim() ? `Hi ${patient.first_name.trim()},` : "Hi,"
  const text = `${greeting}

We received a request to reset the password for your Clear Choice Pharmacy account.

Choose a new password: ${resetUrl}

This link expires in 1 hour. If you did not ask for this, you can ignore this email.

— Clear Choice Pharmacy
${CONTACT_EMAIL}
${PHARMACY_PHONE_DISPLAY}`

  const html = `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">
  <p>${greeting}</p>
  <p>We received a request to reset the password for your Clear Choice Pharmacy account.</p>
  <p style="margin: 24px 0;">
    <a href="${resetUrl}" style="display: inline-block; background: #0d9488; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: 600;">Choose a new password</a>
  </p>
  <p>This link expires in 1 hour. If you did not ask for this, you can ignore this email.</p>
  <p style="margin-top: 32px; color: #666; font-size: 14px;">
    — Clear Choice Pharmacy<br>
    <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a><br>
    ${PHARMACY_PHONE_DISPLAY}
  </p>
</body>
</html>`

  const sent = await sendPatientEmail({
    to: patient.email,
    subject: "Reset your Clear Choice Pharmacy password",
    text,
    html,
  })
  if (!sent.success) {
    await sql(`DELETE FROM patient_password_resets WHERE token_hash = $1`, [tokenHash]).catch(() => [])
    throw new Error(sent.error || "Could not send the reset email.")
  }
}

export async function resetPatientPassword(token: string, newPassword: string): Promise<void> {
  const raw = token.trim()
  if (!raw) throw new Error("This reset link is invalid or has expired.")
  if (newPassword.length < 8) throw new Error("Password must be at least 8 characters.")

  await ensurePasswordResetTable()

  const tokenHash = hashToken(raw)
  const rows = await sql(
    `SELECT id, patient_id
     FROM patient_password_resets
     WHERE token_hash = $1
       AND used_at IS NULL
       AND expires_at > NOW()
     LIMIT 1`,
    [tokenHash]
  )
  const reset = rows[0] as { id: string; patient_id: string } | undefined
  if (!reset) throw new Error("This reset link is invalid or has expired.")

  const updated = await sql(
    `UPDATE patients
     SET password_hash = crypt($1, gen_salt('bf'))
     WHERE id::text = $2
     RETURNING id`,
    [newPassword, reset.patient_id]
  )
  if (updated.length === 0) throw new Error("This reset link is invalid or has expired.")

  await sql(`UPDATE patient_password_resets SET used_at = NOW() WHERE id = $1`, [reset.id])
  await sql(
    `UPDATE patient_password_resets SET used_at = NOW()
     WHERE patient_id = $1 AND used_at IS NULL`,
    [reset.patient_id]
  )
}
