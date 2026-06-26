-- Specialty pharmacy transfer intake submissions
-- Run against Neon Postgres: psql $DATABASE_URL -f scripts/021_create_specialty_intake.sql

CREATE TABLE IF NOT EXISTS specialty_intake (
  id TEXT PRIMARY KEY,
  patient_id TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  date_of_birth TEXT,
  state TEXT,
  address TEXT,
  city TEXT,
  zip_code TEXT,
  selected_medication TEXT,
  medication_other TEXT,
  request_type TEXT,
  insurance_plan_name TEXT,
  insurance_member_id TEXT,
  insurance_group_number TEXT,
  insurance_bin TEXT,
  insurance_pcn TEXT,
  insurance_cardholder_name TEXT,
  prescription_method TEXT,
  transfer_rx_numbers TEXT,
  transfer_pharmacy_name TEXT,
  transfer_pharmacy_phone TEXT,
  doctor_name TEXT,
  doctor_phone TEXT,
  prescription_file_key TEXT,
  diagnosis TEXT,
  currently_on_medication TEXT,
  prior_auth_status TEXT,
  prescriber_name TEXT,
  prescriber_phone TEXT,
  allergies TEXT,
  additional_notes TEXT,
  fulfillment_preference TEXT,
  status TEXT NOT NULL DEFAULT 'pending_review',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_specialty_intake_email ON specialty_intake (email);
CREATE INDEX IF NOT EXISTS idx_specialty_intake_patient_id ON specialty_intake (patient_id);
CREATE INDEX IF NOT EXISTS idx_specialty_intake_status ON specialty_intake (status);
CREATE INDEX IF NOT EXISTS idx_specialty_intake_created_at ON specialty_intake (created_at DESC);
