/** Order status values allowed in the database and admin UI. */
export const ORDER_STATUSES = [
  "pending",
  "pending_rx",
  "processing",
  "ready",
  "shipped",
  "delivered",
  "completed",
  "problem",
  "cancelled",
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

/** Statuses shown in the admin process dropdown (pharmacy workflow). */
export const ADMIN_ORDER_STATUS_OPTIONS = [
  "pending",
  "processing",
  "ready",
  "shipped",
  "delivered",
  "cancelled",
] as const
