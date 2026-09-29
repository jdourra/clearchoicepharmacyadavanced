-- One-time links for patients who forgot their portal password.
CREATE TABLE IF NOT EXISTS patient_password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patient_password_resets_patient
  ON patient_password_resets (patient_id, created_at DESC);
