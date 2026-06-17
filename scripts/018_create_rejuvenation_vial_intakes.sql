-- Rejuvenation vial (home injection kit) intake requests
-- Run against Neon Postgres: psql $DATABASE_URL -f scripts/018_create_rejuvenation_vial_intakes.sql

CREATE TABLE IF NOT EXISTS rejuvenation_vial_intakes (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_state TEXT NOT NULL,
  shipping_zip TEXT NOT NULL,
  selected_vial TEXT NOT NULL,
  selected_vial_title TEXT,
  kit_price NUMERIC,
  allergies TEXT,
  current_medications TEXT,
  pregnant_or_breastfeeding BOOLEAN DEFAULT FALSE,
  kidney_disease TEXT,
  heart_condition TEXT,
  additional_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending_provider_review',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vial_intake_email ON rejuvenation_vial_intakes (email);
CREATE INDEX IF NOT EXISTS idx_vial_intake_status ON rejuvenation_vial_intakes (status);
CREATE INDEX IF NOT EXISTS idx_vial_intake_created_at ON rejuvenation_vial_intakes (created_at DESC);
