-- Extended telemedicine intake data for cash-pay prescription orders
ALTER TABLE prescription_order_intakes ADD COLUMN IF NOT EXISTS intake_type TEXT;
ALTER TABLE prescription_order_intakes ADD COLUMN IF NOT EXISTS intake_data JSONB;
ALTER TABLE prescription_order_intakes ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;
