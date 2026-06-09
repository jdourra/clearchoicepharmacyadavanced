-- IV mobile therapy booking requests
-- Run against Neon Postgres: psql $DATABASE_URL -f scripts/017_create_iv_booking.sql

CREATE TABLE IF NOT EXISTS iv_booking_requests (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service_address TEXT NOT NULL,
  service_city TEXT NOT NULL,
  service_state TEXT NOT NULL,
  service_zip TEXT NOT NULL,
  preferred_date TEXT,
  preferred_time_window TEXT NOT NULL,
  selected_package TEXT NOT NULL,
  selected_package_title TEXT,
  selected_boosters JSONB DEFAULT '[]'::jsonb,
  estimated_total NUMERIC,
  allergies TEXT,
  current_medications TEXT,
  pregnant_or_breastfeeding BOOLEAN DEFAULT FALSE,
  kidney_disease TEXT,
  heart_condition TEXT,
  additional_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending_provider_review',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_iv_booking_email ON iv_booking_requests (email);
CREATE INDEX IF NOT EXISTS idx_iv_booking_status ON iv_booking_requests (status);
CREATE INDEX IF NOT EXISTS idx_iv_booking_created_at ON iv_booking_requests (created_at DESC);
