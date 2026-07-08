-- Track one-time check-in email for patients who signed up without placing an order
ALTER TABLE patients ADD COLUMN IF NOT EXISTS signup_followup_sent_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_patients_signup_followup
  ON patients (created_at)
  WHERE signup_followup_sent_at IS NULL;
