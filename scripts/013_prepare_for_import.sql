-- Prepare the database for fresh import
-- This clears old data and ensures RLS is off for bulk import

-- Disable RLS temporarily for fast import
ALTER TABLE medications DISABLE ROW LEVEL SECURITY;

-- Clear existing medications
TRUNCATE medications CASCADE;

-- Add index for faster lookups during import
CREATE INDEX IF NOT EXISTS idx_medications_ndc ON medications(ndc_code);
CREATE INDEX IF NOT EXISTS idx_medications_name ON medications(name);

-- Verify table is empty
SELECT COUNT(*) as count FROM medications;
