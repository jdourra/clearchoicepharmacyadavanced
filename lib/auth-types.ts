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
  payment_method?: string | null
  payment_preference?: string | null
  stripe_payment_intent_id?: string | null
  stripe_checkout_session_id?: string | null
  prescription_method?: string | null
  notes?: string
  created_at: string
}

export interface PatientProfileSummary {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  dob: string | null
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  state: string | null
  zip: string | null
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
  order_id?: string | null
  created_at: string
}
