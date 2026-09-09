-- Track one-time Google review request emails for fulfilled patients
-- Run against Neon: psql $DATABASE_URL -f scripts/037_google_review_requests.sql

ALTER TABLE patients ADD COLUMN IF NOT EXISTS google_review_request_sent_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_patients_google_review_request
  ON patients (google_review_request_sent_at)
  WHERE google_review_request_sent_at IS NULL;
