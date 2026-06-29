ALTER TABLE messages ADD COLUMN IF NOT EXISTS order_id TEXT REFERENCES orders(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_messages_recipient_patient ON messages(recipient_id) WHERE recipient_type = 'patient';
