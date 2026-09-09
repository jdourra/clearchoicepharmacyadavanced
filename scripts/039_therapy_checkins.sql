-- Therapy check-ins: mid-cycle follow-up before next month / refill.
-- Run: psql $DATABASE_URL -f scripts/039_therapy_checkins.sql

CREATE TABLE IF NOT EXISTS therapy_checkins (
  id TEXT PRIMARY KEY,
  patient_id TEXT,
  patient_email TEXT NOT NULL,
  service_type TEXT NOT NULL DEFAULT 'weight_loss',
  intake_id TEXT NOT NULL,
  month_index INTEGER NOT NULL DEFAULT 0,
  month_label TEXT,
  response_token TEXT UNIQUE NOT NULL,
  sent_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  tolerating BOOLEAN,
  weight_lost_lbs NUMERIC,
  side_effects TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_therapy_checkins_intake
  ON therapy_checkins (intake_id, month_index);

CREATE INDEX IF NOT EXISTS idx_therapy_checkins_patient
  ON therapy_checkins (patient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_therapy_checkins_email
  ON therapy_checkins (LOWER(patient_email));

CREATE INDEX IF NOT EXISTS idx_therapy_checkins_token
  ON therapy_checkins (response_token)
  WHERE responded_at IS NULL;
