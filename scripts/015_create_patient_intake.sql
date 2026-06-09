-- Patient intake submissions for men's health ED telehealth flow
-- Run against Neon Postgres: psql $DATABASE_URL -f scripts/015_create_patient_intake.sql

CREATE TABLE IF NOT EXISTS patient_intake (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  date_of_birth TEXT,
  state TEXT,
  address TEXT,
  city TEXT,
  zip_code TEXT,
  systolic_bp TEXT,
  diastolic_bp TEXT,
  heart_rate TEXT,
  last_bp_check TEXT,
  diabetes TEXT,
  hypertension TEXT,
  heart_condition TEXT,
  liver_disease TEXT,
  kidney_disease TEXT,
  vision_problems TEXT,
  current_medications TEXT,
  allergies TEXT,
  selected_product TEXT,
  selected_billing_plan TEXT,
  ed_duration TEXT,
  ed_severity TEXT,
  previous_treatments JSONB DEFAULT '[]'::jsonb,
  treatment_goals JSONB DEFAULT '[]'::jsonb,
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_zip TEXT,
  status TEXT NOT NULL DEFAULT 'pending_review',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patient_intake_email ON patient_intake (email);
CREATE INDEX IF NOT EXISTS idx_patient_intake_status ON patient_intake (status);
CREATE INDEX IF NOT EXISTS idx_patient_intake_created_at ON patient_intake (created_at DESC);
