-- Add columns needed for Excel import and per-unit pricing
ALTER TABLE medications ADD COLUMN IF NOT EXISTS per_unit_cost NUMERIC;
ALTER TABLE medications ADD COLUMN IF NOT EXISTS package_quantity INTEGER DEFAULT 1;
ALTER TABLE medications ADD COLUMN IF NOT EXISTS is_generic BOOLEAN DEFAULT true;
ALTER TABLE medications ADD COLUMN IF NOT EXISTS days_supply INTEGER DEFAULT 30;

-- Add a text search index for fast medication name/generic search
CREATE INDEX IF NOT EXISTS idx_medications_name_trgm ON medications USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_medications_generic_trgm ON medications USING gin (generic_name gin_trgm_ops);
