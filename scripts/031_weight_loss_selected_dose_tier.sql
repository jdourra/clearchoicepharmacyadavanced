-- Persist selected GLP dose tier on weight loss intakes
-- Run against Neon Postgres: psql $DATABASE_URL -f scripts/031_weight_loss_selected_dose_tier.sql

ALTER TABLE weight_loss_intake
  ADD COLUMN IF NOT EXISTS selected_dose_tier TEXT;

COMMENT ON COLUMN weight_loss_intake.selected_dose_tier IS
  'Patient-selected kit dose tier: starter | titration | maintenance';
