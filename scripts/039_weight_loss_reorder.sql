-- Marks a weight-loss intake that was created from a patient portal reorder.
ALTER TABLE weight_loss_intake
  ADD COLUMN IF NOT EXISTS reorder_of_id TEXT;

CREATE INDEX IF NOT EXISTS idx_weight_loss_intake_reorder_of
  ON weight_loss_intake (reorder_of_id)
  WHERE reorder_of_id IS NOT NULL;
