-- GLP weight loss intake submissions
-- Run against Neon Postgres: psql $DATABASE_URL -f scripts/016_create_weight_loss_intake.sql

CREATE TABLE IF NOT EXISTS weight_loss_intake (
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
  height_inches INTEGER,
  weight_lbs NUMERIC,
  bmi NUMERIC,
  goal_weight_lbs NUMERIC,
  systolic_bp TEXT,
  diastolic_bp TEXT,
  pregnant_or_breastfeeding BOOLEAN DEFAULT FALSE,
  mtc_or_men2_history BOOLEAN DEFAULT FALSE,
  pancreatitis_history BOOLEAN DEFAULT FALSE,
  type1_diabetes BOOLEAN DEFAULT FALSE,
  eating_disorder BOOLEAN DEFAULT FALSE,
  on_other_glp BOOLEAN DEFAULT FALSE,
  type2_diabetes TEXT,
  hypertension TEXT,
  gallbladder_disease TEXT,
  diabetic_retinopathy TEXT,
  bariatric_surgery TEXT,
  sleep_apnea TEXT,
  cardiovascular_disease TEXT,
  current_medications TEXT,
  allergies TEXT,
  selected_program TEXT,
  selected_billing_plan TEXT,
  prior_glp_experience TEXT,
  weight_loss_goals JSONB DEFAULT '[]'::jsonb,
  comorbidities JSONB DEFAULT '[]'::jsonb,
  additional_concerns TEXT,
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_zip TEXT,
  status TEXT NOT NULL DEFAULT 'pending_review',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weight_loss_intake_email ON weight_loss_intake (email);
CREATE INDEX IF NOT EXISTS idx_weight_loss_intake_status ON weight_loss_intake (status);
CREATE INDEX IF NOT EXISTS idx_weight_loss_intake_created_at ON weight_loss_intake (created_at DESC);
