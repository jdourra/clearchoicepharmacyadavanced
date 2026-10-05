-- Clinician SOAP note saved when weight-loss therapy is approved.
ALTER TABLE weight_loss_intake
  ADD COLUMN IF NOT EXISTS clinician_chart_note TEXT;
