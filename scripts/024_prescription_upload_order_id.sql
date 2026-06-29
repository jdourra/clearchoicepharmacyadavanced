ALTER TABLE prescription_uploads ADD COLUMN IF NOT EXISTS order_id TEXT REFERENCES orders(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_prescription_uploads_order_id ON prescription_uploads(order_id);
