-- Clinical intake for low-cost Rx telemedicine (intake-first, order on physician approval)
CREATE TABLE IF NOT EXISTS prescription_telemedicine_intake (
  id TEXT PRIMARY KEY,
  patient_id TEXT REFERENCES patients(id) ON DELETE SET NULL,
  order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  date_of_birth TEXT,
  state TEXT,
  address TEXT,
  city TEXT,
  zip_code TEXT,
  intake_type TEXT NOT NULL DEFAULT 'general',
  visit_reason TEXT,
  requested_medications JSONB NOT NULL DEFAULT '[]'::jsonb,
  delivery_method TEXT NOT NULL DEFAULT 'pickup',
  subtotal_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  telemedicine_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  order_notes TEXT,
  intake_data JSONB,
  status TEXT NOT NULL DEFAULT 'pending_provider_review',
  stripe_payment_intent_id TEXT,
  id_front_key TEXT,
  id_back_key TEXT,
  partner_name TEXT,
  partner_status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rx_tm_intake_email ON prescription_telemedicine_intake (email);
CREATE INDEX IF NOT EXISTS idx_rx_tm_intake_status ON prescription_telemedicine_intake (status);
CREATE INDEX IF NOT EXISTS idx_rx_tm_intake_created_at ON prescription_telemedicine_intake (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rx_tm_intake_order_id ON prescription_telemedicine_intake (order_id);
