import "server-only"
import { sql } from "@/lib/db"
import { cookies } from "next/headers"

// Re-export types so existing server-side imports still work
export type { User, StaffUser, OrderItem, Order, Message } from "@/lib/auth-types"

// Import types for local use
import type { User, StaffUser, OrderItem, Order, Message, PatientProfileSummary } from "@/lib/auth-types"

// ─── Session helpers ─────────────────────────────────────

const SESSION_COOKIE = "session_id"
const STAFF_SESSION_COOKIE = "staff_session_id"

async function createSessionRow(userId: string, userType: "patient" | "staff" | "admin"): Promise<string> {
  const sessionId = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  await sql(
    "INSERT INTO sessions (id, user_id, user_type, expires_at) VALUES ($1, $2, $3, $4)",
    [sessionId, userId, userType, expiresAt]
  )
  return sessionId
}

async function getSession(sessionId: string) {
  const rows = await sql(
    "SELECT * FROM sessions WHERE id = $1 AND expires_at > now()",
    [sessionId]
  )
  return rows[0] || null
}

async function deleteSession(sessionId: string) {
  await sql("DELETE FROM sessions WHERE id = $1", [sessionId])
}

// Cleanup expired sessions periodically (fire-and-forget, non-blocking)
async function cleanupExpiredSessions() {
  try {
    await sql("DELETE FROM sessions WHERE expires_at < now()", [])
  } catch {
    // Silently ignore cleanup errors — not critical
  }
}

// Cookie helper
function buildCookieHeader(name: string, value: string, maxAge: number): string {
  return [
    `${name}=${value}`,
    "Path=/",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ].join("; ")
}

function buildDeleteCookieHeader(name: string): string {
  return `${name}=; Path=/; SameSite=Lax; Max-Age=0`
}

// ─── Patient auth ────────────────────────────────────────

export const auth = {
  async signUp(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone?: string,
    dob?: string,
    address?: string,
    city?: string,
    state?: string,
    zip?: string,
  ): Promise<{ user: User; sessionId: string }> {
    const existing = await sql("SELECT id FROM patients WHERE email = $1", [email.toLowerCase()])
    if (existing.length > 0) throw new Error("Email already registered")

    const rows = await sql(
      `INSERT INTO patients (email, password_hash, first_name, last_name, phone, date_of_birth, address_line1, city, state, zip_code)
       VALUES ($1, crypt($2, gen_salt('bf')), $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, email, first_name, last_name, created_at`,
      [email.toLowerCase(), password, firstName, lastName, phone || null, dob || null, address || null, city || null, state || null, zip || null]
    )
    const patient = rows[0]
    const sessionId = await createSessionRow(patient.id, "patient")

    return {
      user: { id: patient.id, email: patient.email, name: `${patient.first_name} ${patient.last_name}`.trim(), created_at: patient.created_at },
      sessionId,
    }
  },

  async signIn(email: string, password: string): Promise<{ user: User; sessionId: string }> {
    const rows = await sql(
      "SELECT id, email, first_name, last_name, created_at FROM patients WHERE email = $1 AND password_hash = crypt($2, password_hash)",
      [email.toLowerCase(), password]
    )
    if (rows.length === 0) throw new Error("Invalid email or password")

    const patient = rows[0]
    const sessionId = await createSessionRow(patient.id, "patient")

    // Fire-and-forget cleanup of expired sessions
    cleanupExpiredSessions()

    return {
      user: {
        id: patient.id,
        email: patient.email,
        name: `${patient.first_name} ${patient.last_name}`.trim(),
        created_at: patient.created_at,
      },
      sessionId,
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const cookieStore = await cookies()
      const sessionId = cookieStore.get(SESSION_COOKIE)?.value
      if (!sessionId) return null

      const session = await getSession(sessionId)
      if (!session || session.user_type !== "patient") return null

      const rows = await sql(
        "SELECT id, email, first_name, last_name, created_at FROM patients WHERE id = $1",
        [session.user_id]
      )
      if (rows.length === 0) return null
      const p = rows[0]
      return {
        id: p.id,
        email: p.email,
        name: `${p.first_name} ${p.last_name}`.trim(),
        created_at: p.created_at,
      }
    } catch {
      return null
    }
  },

  async signOut() {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value
    if (sessionId) await deleteSession(sessionId)
  },

  SESSION_COOKIE,
  buildCookieHeader: (sessionId: string) => buildCookieHeader(SESSION_COOKIE, sessionId, 30 * 24 * 60 * 60),
  buildDeleteCookieHeader: () => buildDeleteCookieHeader(SESSION_COOKIE),
}

// ─── Staff auth ──────────────────────────────────────────

function resolveStaffSessionIdFromRequest(request?: Request): string | null {
  if (request) {
    const authHeader = request.headers.get("authorization") || ""
    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7).trim()
      if (token && token !== "null" && token !== "undefined") return token
    }
    const cookieHeader = request.headers.get("cookie") || ""
    const match = cookieHeader.match(/staff_session_id=([^;]+)/)
    if (match?.[1]) return match[1]
  }
  return null
}

export const staffAuth = {
  async signIn(email: string, password: string): Promise<{ staff: StaffUser; sessionId: string }> {
    const rows = await sql(
      "SELECT id, email, full_name, role FROM staff_users WHERE email = $1 AND password_hash = crypt($2, password_hash) AND is_active = true",
      [email.toLowerCase(), password]
    )
    if (rows.length === 0) throw new Error("Invalid email or password")

    const staff = rows[0]
    const sessionId = await createSessionRow(staff.id, staff.role === "admin" ? "admin" : "staff")

    // Fire-and-forget cleanup of expired sessions
    cleanupExpiredSessions()

    return { staff: { id: staff.id, email: staff.email, full_name: staff.full_name, role: staff.role }, sessionId }
  },

  async getCurrentStaff(request?: Request): Promise<StaffUser | null> {
    try {
      let sessionId = resolveStaffSessionIdFromRequest(request)

      if (!sessionId) {
        const cookieStore = await cookies()
        sessionId = cookieStore.get(STAFF_SESSION_COOKIE)?.value ?? null
      }

      if (!sessionId) return null

      const session = await getSession(sessionId)
      if (!session || (session.user_type !== "staff" && session.user_type !== "admin")) return null

      const rows = await sql(
        "SELECT id, email, full_name, role FROM staff_users WHERE id = $1 AND is_active = true",
        [session.user_id]
      )
      return rows[0] || null
    } catch {
      return null
    }
  },

  async signOut() {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(STAFF_SESSION_COOKIE)?.value
    if (sessionId) await deleteSession(sessionId)
  },

  STAFF_SESSION_COOKIE,
  buildCookieHeader: (sessionId: string) => buildCookieHeader(STAFF_SESSION_COOKIE, sessionId, 30 * 24 * 60 * 60),
  buildDeleteCookieHeader: () => buildDeleteCookieHeader(STAFF_SESSION_COOKIE),
}

// ─── Admin auth ──────────────────────────────────────────

export const admin = {
  async signIn(email: string, password: string): Promise<{ success: boolean; sessionId?: string }> {
    const result = await staffAuth.signIn(email, password)
    if (result.staff.role !== "admin") throw new Error("Not an admin")
    return { success: true, sessionId: result.sessionId }
  },

  async isLoggedIn(request?: Request): Promise<boolean> {
    const staff = await staffAuth.getCurrentStaff(request)
    return staff?.role === "admin"
  },

  async signOut() { await staffAuth.signOut() },

  async getAllUsers(limit = 200, offset = 0): Promise<User[]> {
    const rows = await sql("SELECT id, email, first_name, last_name, created_at FROM patients ORDER BY created_at DESC LIMIT $1 OFFSET $2", [limit, offset])
    return rows.map((p) => ({
      id: p.id, email: p.email, name: `${p.first_name} ${p.last_name}`.trim(), created_at: p.created_at,
    }))
  },

  async getUserById(userId: string): Promise<User | null> {
    const rows = await sql("SELECT id, email, first_name, last_name, created_at FROM patients WHERE id = $1", [userId])
    if (rows.length === 0) return null
    const p = rows[0]
    return { id: p.id, email: p.email, name: `${p.first_name} ${p.last_name}`.trim(), created_at: p.created_at }
  },

  async getPatientProfileById(patientId: string): Promise<PatientProfileSummary | null> {
    const rows = await sql(
      `SELECT id, email, first_name, last_name, phone, date_of_birth,
              address_line1, address_line2, city, state, zip_code
       FROM patients WHERE id = $1`,
      [patientId]
    )
    if (rows.length === 0) return null
    const p = rows[0]
    return {
      id: String(p.id),
      email: String(p.email),
      firstName: String(p.first_name || ""),
      lastName: String(p.last_name || ""),
      phone: p.phone != null ? String(p.phone) : null,
      dob: p.date_of_birth != null ? String(p.date_of_birth) : null,
      addressLine1: p.address_line1 != null ? String(p.address_line1) : null,
      addressLine2: p.address_line2 != null ? String(p.address_line2) : null,
      city: p.city != null ? String(p.city) : null,
      state: p.state != null ? String(p.state) : null,
      zip: p.zip_code != null ? String(p.zip_code) : null,
    }
  },
}

// ─── Orders ──────────────────────────────────────────────

function mapOrderRow(r: Record<string, unknown>): Order {
  return {
    id: String(r.id),
    order_number: String(r.order_number),
    patient_id: String(r.patient_id),
    items: (r.items as Order["items"])?.[0]?.drug_name ? (r.items as Order["items"]) : [],
    total_amount: Number(r.total_amount),
    status: String(r.status),
    payment_status: String(r.payment_status),
    payment_method: r.payment_method != null ? String(r.payment_method) : null,
    payment_preference: r.payment_preference != null ? String(r.payment_preference) : null,
    stripe_payment_intent_id:
      r.stripe_payment_intent_id != null ? String(r.stripe_payment_intent_id) : null,
    stripe_checkout_session_id:
      r.stripe_checkout_session_id != null ? String(r.stripe_checkout_session_id) : null,
    prescription_method: r.prescription_method != null ? String(r.prescription_method) : null,
    notes: r.notes ? String(r.notes) : "",
    created_at: String(r.created_at),
  }
}

export const orders = {
  async createOrder(
    patientId: string | null,
    items: OrderItem[],
    total: number,
    deliveryMethod: string,
    notes?: string,
    prescriptionMethod?: string | null
  ): Promise<Order | null> {
    // Use crypto for collision-safe order numbers (timestamp + random hex)
    const randomHex = crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase()
    const orderNumber = `CCP-${Date.now().toString(36).toUpperCase()}-${randomHex}`

    const rows = await sql(
      "INSERT INTO orders (patient_id, order_number, status, total_amount, payment_method, payment_status, notes, prescription_method) VALUES ($1, $2, 'pending', $3, $4, 'unpaid', $5, $6) RETURNING *",
      [patientId, orderNumber, total, deliveryMethod, notes || "", prescriptionMethod || null]
    )
    const order = rows[0]

    for (const item of items) {
      await sql(
        "INSERT INTO order_items (order_id, medication_name, quantity, unit_price, total_price) VALUES ($1, $2, $3, $4, $5)",
        [order.id, item.drug_name, item.quantity, item.price, item.price * item.quantity]
      )
    }

    return {
      ...mapOrderRow(order),
      items,
    }
  },

  async getOrdersForPatient(patientId: string): Promise<Order[]> {
    const rows = await sql(
      `SELECT o.*, json_agg(json_build_object('drug_name', oi.medication_name, 'quantity', oi.quantity, 'price', oi.unit_price)) as items
       FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.patient_id = $1 GROUP BY o.id ORDER BY o.created_at DESC`,
      [patientId]
    )
    return rows.map((r) => mapOrderRow(r))
  },

  async getAllOrders(limit = 200, offset = 0): Promise<Order[]> {
    const rows = await sql(
      `SELECT o.*, json_agg(json_build_object('drug_name', oi.medication_name, 'quantity', oi.quantity, 'price', oi.unit_price)) as items
       FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id
       GROUP BY o.id ORDER BY o.created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    )
    return rows.map((r) => mapOrderRow(r))
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    const rows = await sql(
      `SELECT o.*, json_agg(json_build_object('drug_name', oi.medication_name, 'quantity', oi.quantity, 'price', oi.unit_price)) as items
       FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.id = $1 GROUP BY o.id`,
      [orderId]
    )
    if (rows.length === 0) return null
    return mapOrderRow(rows[0])
  },

  async getOrderForPatient(orderId: string, patientId: string): Promise<Order | null> {
    const order = await orders.getOrderById(orderId)
    if (!order || order.patient_id !== patientId) return null
    return order
  },

  async saveCheckoutSession(orderId: string, sessionId: string): Promise<boolean> {
    const rows = await sql(
      "UPDATE orders SET stripe_checkout_session_id = $2, payment_preference = 'pay_now', updated_at = now() WHERE id = $1 RETURNING id",
      [orderId, sessionId]
    )
    return rows.length > 0
  },

  async markOrderPaid(
    orderId: string,
    stripePaymentIntentId: string,
    stripeCheckoutSessionId?: string | null
  ): Promise<boolean> {
    const rows = await sql(
      `UPDATE orders SET
         payment_status = 'paid',
         payment_method = 'stripe',
         payment_preference = 'pay_now',
         stripe_payment_intent_id = $2,
         stripe_checkout_session_id = COALESCE($3, stripe_checkout_session_id),
         updated_at = now()
       WHERE id = $1 AND payment_status != 'paid'
       RETURNING id`,
      [orderId, stripePaymentIntentId, stripeCheckoutSessionId || null]
    )
    return rows.length > 0
  },

  async setPaymentPreference(
    orderId: string,
    preference: "pay_by_phone" | "pay_now"
  ): Promise<boolean> {
    const paymentMethod = preference === "pay_by_phone" ? "phone" : null
    const rows = await sql(
      `UPDATE orders SET
         payment_preference = $2,
         payment_method = COALESCE($3, payment_method),
         updated_at = now()
       WHERE id = $1 RETURNING id`,
      [orderId, preference, paymentMethod]
    )
    return rows.length > 0
  },

  async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    const rows = await sql("UPDATE orders SET status = $1, updated_at = now() WHERE id = $2 RETURNING id", [status, orderId])
    return rows.length > 0
  },

  async updateOrderPrescription(
    orderId: string,
    prescriptionMethod: string,
    notes: string
  ): Promise<boolean> {
    const rows = await sql(
      `UPDATE orders SET prescription_method = $2, notes = $3, updated_at = now() WHERE id = $1 RETURNING id`,
      [orderId, prescriptionMethod, notes]
    )
    return rows.length > 0
  },
}

// ─── Messaging ───────────────────────────────────────────

function normalizeMessageActorType(type: string): string {
  // DB check constraint allows only patient | staff (admin users send as staff).
  if (type === "admin") return "staff"
  return type
}

export const messaging = {
  async sendMessage(
    senderType: string,
    senderId: string,
    recipientType: string,
    recipientId: string | null,
    subject: string | null,
    body: string,
    orderId?: string | null
  ): Promise<Message> {
    const rows = await sql(
      `INSERT INTO messages (sender_type, sender_id, recipient_type, recipient_id, subject, body, order_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        normalizeMessageActorType(senderType),
        senderId,
        normalizeMessageActorType(recipientType),
        recipientId,
        subject,
        body,
        orderId || null,
      ]
    )
    return rows[0] as Message
  },

  async getMessagesForPatient(patientId: string): Promise<Message[]> {
    const rows = await sql(
      `SELECT * FROM messages
       WHERE recipient_id = $1 AND recipient_type = 'patient'
       ORDER BY created_at DESC`,
      [patientId]
    )
    return rows as Message[]
  },

  async getAllMessages(): Promise<Message[]> {
    const rows = await sql("SELECT * FROM messages ORDER BY created_at DESC", [])
    return rows as Message[]
  },

  async markAsRead(messageId: string): Promise<boolean> {
    const rows = await sql("UPDATE messages SET is_read = true WHERE id = $1 RETURNING id", [messageId])
    return rows.length > 0
  },
}
