-- Add support for multiple strengths per medication
-- This allows patients to select from different strengths (e.g., 5mg, 10mg, 20mg)

-- Add a base_medication_id to group strengths together
ALTER TABLE medications ADD COLUMN IF NOT EXISTS base_medication_id UUID REFERENCES medications(id);
ALTER TABLE medications ADD COLUMN IF NOT EXISTS is_base BOOLEAN DEFAULT false;

-- Create index for grouping
CREATE INDEX IF NOT EXISTS idx_medications_base_id ON medications(base_medication_id);

-- Add supplier integration fields
ALTER TABLE medications ADD COLUMN IF NOT EXISTS supplier_sku TEXT;
ALTER TABLE medications ADD COLUMN IF NOT EXISTS supplier_last_updated TIMESTAMP WITH TIME ZONE;
ALTER TABLE medications ADD COLUMN IF NOT EXISTS supplier_price_source TEXT; -- e.g., 'manual', 'api', 'csv'

-- Update existing medications to be standalone (no base)
UPDATE medications SET is_base = true WHERE base_medication_id IS NULL;
