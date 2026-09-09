-- Snapshot kit count / supply label on weight-loss intakes for audit.
-- New quarterly plan = 3 kits (90 days). Existing quarterly rows are backfilled as 2 kits (60 days).
-- Run: psql $DATABASE_URL -f scripts/038_weight_loss_billing_kit_count.sql

ALTER TABLE weight_loss_intake
  ADD COLUMN IF NOT EXISTS billing_kit_count INTEGER,
  ADD COLUMN IF NOT EXISTS billing_supply_label TEXT;

COMMENT ON COLUMN weight_loss_intake.billing_kit_count IS
  'Kits included at order time (1=monthly, 2=legacy 60-day quarterly, 3=90-day quarterly). Used for charge, Rx qty, refill timing, and audit.';

COMMENT ON COLUMN weight_loss_intake.billing_supply_label IS
  'Human-readable supply snapshot at order time (e.g. 60-day (2-kit) supply).';

-- Existing quarterly intakes were sold under the 2-kit / 60-day plan.
UPDATE weight_loss_intake
SET
  billing_kit_count = 2,
  billing_supply_label = '60-day (2-kit) supply'
WHERE selected_billing_plan = 'quarterly'
  AND billing_kit_count IS NULL;

UPDATE weight_loss_intake
SET
  billing_kit_count = 1,
  billing_supply_label = '1-month (30-day kit)'
WHERE (selected_billing_plan IS NULL OR selected_billing_plan = 'monthly')
  AND billing_kit_count IS NULL;

CREATE INDEX IF NOT EXISTS idx_weight_loss_intake_billing_kit_count
  ON weight_loss_intake (billing_kit_count, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_weight_loss_intake_created_at_billing
  ON weight_loss_intake (created_at DESC)
  WHERE selected_billing_plan = 'quarterly';

-- Audit example (retrieve legacy 2-kit quarterly by date):
-- SELECT id, created_at, first_name, last_name, email, selected_program,
--        selected_billing_plan, billing_kit_count, billing_supply_label, payment_status, status
-- FROM weight_loss_intake
-- WHERE billing_kit_count = 2
--   AND created_at >= '2025-01-01'
--   AND created_at <  '2026-09-10'
-- ORDER BY created_at DESC;
