-- Prescription source tracking on cash-pay orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS prescription_method TEXT;

CREATE TABLE IF NOT EXISTS prescription_order_intakes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_id TEXT NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  patient_id TEXT REFERENCES patients(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending_provider_review',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
