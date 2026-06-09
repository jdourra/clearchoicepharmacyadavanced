-- Partner-ready fields for IV booking workflow
-- Run: psql $DATABASE_URL -f scripts/018_iv_booking_partner_fields.sql

ALTER TABLE iv_booking_requests
  ALTER COLUMN status SET DEFAULT 'pending_provider_review';

UPDATE iv_booking_requests
SET status = 'pending_provider_review'
WHERE status = 'pending_dispatch';

ALTER TABLE iv_booking_requests ADD COLUMN IF NOT EXISTS partner_name TEXT;
ALTER TABLE iv_booking_requests ADD COLUMN IF NOT EXISTS partner_case_id TEXT;
ALTER TABLE iv_booking_requests ADD COLUMN IF NOT EXISTS partner_status TEXT;
ALTER TABLE iv_booking_requests ADD COLUMN IF NOT EXISTS intake_payload JSONB;
ALTER TABLE iv_booking_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_iv_booking_partner_case ON iv_booking_requests (partner_case_id);
