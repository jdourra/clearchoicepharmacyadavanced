-- Refill reminder tracking for orders and clinical intakes
-- Run against Neon Postgres: psql $DATABASE_URL -f scripts/036_refill_reminders.sql

ALTER TABLE orders ADD COLUMN IF NOT EXISTS supply_cycle_started_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refill_reminder_sent_at TIMESTAMPTZ;

ALTER TABLE weight_loss_intake ADD COLUMN IF NOT EXISTS supply_cycle_started_at TIMESTAMPTZ;
ALTER TABLE weight_loss_intake ADD COLUMN IF NOT EXISTS refill_reminder_sent_at TIMESTAMPTZ;

ALTER TABLE patient_intake ADD COLUMN IF NOT EXISTS supply_cycle_started_at TIMESTAMPTZ;
ALTER TABLE patient_intake ADD COLUMN IF NOT EXISTS refill_reminder_sent_at TIMESTAMPTZ;

ALTER TABLE trt_intake ADD COLUMN IF NOT EXISTS supply_cycle_started_at TIMESTAMPTZ;
ALTER TABLE trt_intake ADD COLUMN IF NOT EXISTS refill_reminder_sent_at TIMESTAMPTZ;

-- Backfill fulfillment dates for existing paid/shipped records
UPDATE orders
SET supply_cycle_started_at = COALESCE(supply_cycle_started_at, updated_at)
WHERE status IN ('shipped', 'delivered', 'completed')
  AND payment_status = 'paid'
  AND supply_cycle_started_at IS NULL;

UPDATE weight_loss_intake
SET supply_cycle_started_at = COALESCE(supply_cycle_started_at, updated_at)
WHERE payment_status IN ('captured', 'paid_in_person')
  AND status NOT IN ('denied', 'cancelled', 'pending_provider_review')
  AND supply_cycle_started_at IS NULL;

UPDATE patient_intake
SET supply_cycle_started_at = COALESCE(supply_cycle_started_at, updated_at)
WHERE payment_status IN ('captured', 'paid_in_person')
  AND status NOT IN ('denied', 'cancelled', 'pending_provider_review')
  AND supply_cycle_started_at IS NULL;

UPDATE trt_intake
SET supply_cycle_started_at = COALESCE(supply_cycle_started_at, updated_at)
WHERE payment_status IN ('captured', 'paid_in_person')
  AND status NOT IN ('denied', 'cancelled', 'pending_provider_review')
  AND supply_cycle_started_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_orders_refill_reminder
  ON orders (supply_cycle_started_at)
  WHERE refill_reminder_sent_at IS NULL AND status IN ('shipped', 'delivered', 'completed');

CREATE INDEX IF NOT EXISTS idx_weight_loss_intake_refill_reminder
  ON weight_loss_intake (supply_cycle_started_at)
  WHERE refill_reminder_sent_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_patient_intake_refill_reminder
  ON patient_intake (supply_cycle_started_at)
  WHERE refill_reminder_sent_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_trt_intake_refill_reminder
  ON trt_intake (supply_cycle_started_at)
  WHERE refill_reminder_sent_at IS NULL;
