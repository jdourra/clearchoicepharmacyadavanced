// Shared types that can be safely imported in both server and client components.
// Do NOT add any server-only imports here.

export interface User {
  id: string
  email: string
  name: string
  created_at: string
}

export interface StaffUser {
  id: string
  email: string
  full_name: string
  role: string
}

export interface OrderItem {
  drug_name: string
  quantity: number
  price: number
}

export interface Order {
  id: string
  order_number: string
  patient_id: string
  items: OrderItem[]
  total_amount: number
  status: string
  payment_status: string
  notes?: string
  created_at: string
}

export interface Message {
  id: string
  sender_type: string
  sender_id: string
  recipient_type: string
  recipient_id: string | null
  subject: string | null
  body: string
  is_read: boolean
  created_at: string
}
