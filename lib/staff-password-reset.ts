import "server-only"
import { createHash, randomBytes } from "node:crypto"
import { sql } from "@/lib/db"
import { sendPatientEmail } from "@/lib/ses-mail"
import { CONTACT_EMAIL, SITE_URL } from "@/lib/site-config"
import { PHARMACY_PHONE_DISPLAY } from "@/lib/phone"
import { isClinicianRole } from "@/lib/staff-roles"

const RESET_TTL_MS = 60 * 60 * 1000

export type StaffResetPortal = "admin" | "doctor"

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    if (char === "&") return "&amp;"
    if (char === "<") return "&lt;"
    if (char === ">") return "&gt;"
    if (char === '"') return "&quot;"
    return "&#39;"
  })
}

function portalMatchesRole(portal: StaffResetPortal, role: string | null | undefined): boolean {
  if (portal === "doctor") return isClinicianRole(role)
  return role === "admin"
}

function portalLabel(portal: StaffResetPortal): string {
  return portal === "doctor" ? "clinician portal" : "admin dashboard"
}

export async function ensureStaffPasswordResetTable(): Promise<void> {
  await sql(
    `CREATE TABLE IF NOT EXISTS staff_password_resets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      staff_id TEXT NOT NULL,
      portal TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
    []
  )
  await sql(
    `CREATE INDEX IF NOT EXISTS idx_staff_password_resets_staff
     ON staff_password_resets (staff_id, created_at DESC)`,
    []
  ).catch(() => [])
}

export async function requestStaffPasswordReset(email: string, portal: StaffResetPortal): Promise<void> {
  const normalized = email.trim().toLowerCase()
  if (!normalized || !normalized.includes("@")) {
    throw new Error("Enter the email on your account.")
  }

  await ensureStaffPasswordResetTable()

  const users = await sql(
    `SELECT id, email, full_name, role
     FROM staff_users
     WHERE LOWER(email) = $1 AND is_active = true
     LIMIT 1`,
    [normalized]
  )
  const staff = users[0] as
    | { id: string; email: string; full_name: string | null; role: string | null }
    | undefined
  if (!staff || !portalMatchesRole(portal, staff.role)) return

  const recent = await sql(
    `SELECT id FROM staff_password_resets
     WHERE staff_id = $1 AND used_at IS NULL AND created_at > NOW() - INTERVAL '2 minutes'
     LIMIT 1`,
    [String(staff.id)]
  )
  if (recent.length > 0) return

  const token = randomBytes(32).toString("hex")
  const tokenHash = hashToken(token)
  const expiresAt = new Date(Date.now() + RESET_TTL_MS).toISOString()

  await sql(
    `UPDATE staff_password_resets SET used_at = NOW()
     WHERE staff_id = $1 AND used_at IS NULL`,
    [String(staff.id)]
  )
  await sql(
    `INSERT INTO staff_password_resets (staff_id, portal, token_hash, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [String(staff.id), portal, tokenHash, expiresAt]
  )

  const resetUrl = `${SITE_URL.replace(/\/$/, "")}/${portal}/reset-password?token=${token}`
  const name = staff.full_name?.trim()
  const greeting = name ? `Hi ${name},` : "Hi,"
  const place = portalLabel(portal)
  const text = `${greeting}

We received a request to reset the password for your Clear Choice Pharmacy ${place}.

Choose a new password: ${resetUrl}

This link expires in 1 hour and works once. If you did not ask for this, you can ignore this email.

— Clear Choice Pharmacy
${CONTACT_EMAIL}
${PHARMACY_PHONE_DISPLAY}`

  const html = `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">
  <p>${escapeHtml(greeting)}</p>
  <p>We received a request to reset the password for your Clear Choice Pharmacy ${place}.</p>
  <p style="margin: 24px 0;">
    <a href="${resetUrl}" style="display: inline-block; background: #0d9488; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: 600;">Choose a new password</a>
  </p>
  <p>This link expires in 1 hour and works once. If you did not ask for this, you can ignore this email.</p>
  <p style="margin-top: 32px; color: #666; font-size: 14px;">
    — Clear Choice Pharmacy<br>
    <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a><br>
    ${PHARMACY_PHONE_DISPLAY}
  </p>
</body>
</html>`

  const sent = await sendPatientEmail({
    to: staff.email,
    subject:
      portal === "doctor"
        ? "Reset your Clear Choice clinician password"
        : "Reset your Clear Choice admin password",
    text,
    html,
  })
  if (!sent.success) {
    await sql(`DELETE FROM staff_password_resets WHERE token_hash = $1`, [tokenHash]).catch(() => [])
    throw new Error(sent.error || "Could not send the reset email.")
  }
}

export async function resetStaffPassword(token: string, newPassword: string): Promise<StaffResetPortal> {
  const raw = token.trim()
  if (!raw) throw new Error("This reset link is invalid or has expired.")
  if (newPassword.length < 8) throw new Error("Password must be at least 8 characters.")
  if (newPassword.length > 128) throw new Error("Password is too long.")

  await ensureStaffPasswordResetTable()

  const tokenHash = hashToken(raw)
  const rows = await sql(
    `SELECT id, staff_id, portal
     FROM staff_password_resets
     WHERE token_hash = $1
       AND used_at IS NULL
       AND expires_at > NOW()
     LIMIT 1`,
    [tokenHash]
  )
  const reset = rows[0] as { id: string; staff_id: string; portal: string } | undefined
  if (!reset || (reset.portal !== "admin" && reset.portal !== "doctor")) {
    throw new Error("This reset link is invalid or has expired.")
  }

  const updated = await sql(
    `UPDATE staff_users
     SET password_hash = crypt($1, gen_salt('bf'))
     WHERE id::text = $2 AND is_active = true
     RETURNING id`,
    [newPassword, reset.staff_id]
  )
  if (updated.length === 0) throw new Error("This reset link is invalid or has expired.")

  await sql(`UPDATE staff_password_resets SET used_at = NOW() WHERE id = $1`, [reset.id])
  await sql(
    `UPDATE staff_password_resets SET used_at = NOW()
     WHERE staff_id = $1 AND used_at IS NULL`,
    [reset.staff_id]
  )

  return reset.portal
}
