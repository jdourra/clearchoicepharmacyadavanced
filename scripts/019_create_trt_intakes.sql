-- TRT intake submissions for men's health testosterone programs
-- Run against Neon Postgres: node scripts/run-migrations.mjs 019

CREATE TABLE IF NOT EXISTS trt_intake (
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
  symptoms JSONB DEFAULT '[]'::jsonb,
  treatment_goals JSONB DEFAULT '[]'::jsonb,
  prior_trt_experience TEXT,
  has_recent_labs TEXT,
  prostate_cancer BOOLEAN DEFAULT FALSE,
  breast_cancer BOOLEAN DEFAULT FALSE,
  polycythemia BOOLEAN DEFAULT FALSE,
  severe_sleep_apnea BOOLEAN DEFAULT FALSE,
  uncontrolled_heart_failure BOOLEAN DEFAULT FALSE,
  fertility_priority BOOLEAN DEFAULT FALSE,
  hypertension TEXT,
  sleep_apnea TEXT,
  cardiovascular_disease TEXT,
  diabetes TEXT,
  liver_disease TEXT,
  kidney_disease TEXT,
  current_medications TEXT,
  allergies TEXT,
  additional_concerns TEXT,
  selected_program TEXT,
  selected_billing_plan TEXT,
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_zip TEXT,
  status TEXT NOT NULL DEFAULT 'pending_review',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trt_intake_email ON trt_intake (email);
CREATE INDEX IF NOT EXISTS idx_trt_intake_status ON trt_intake (status);
CREATE INDEX IF NOT EXISTS idx_trt_intake_created_at ON trt_intake (created_at DESC);
