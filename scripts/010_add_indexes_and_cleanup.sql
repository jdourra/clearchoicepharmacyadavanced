-- Add indexes to speed up medication queries
CREATE INDEX IF NOT EXISTS idx_medications_name ON medications(name);
CREATE INDEX IF NOT EXISTS idx_medications_generic_name ON medications(generic_name);
CREATE INDEX IF NOT EXISTS idx_medications_ndc ON medications(ndc_code);
CREATE INDEX IF NOT EXISTS idx_medications_is_generic ON medications(is_generic);

-- Ensure RLS is properly configured for medications
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

-- Drop any problematic policies
DROP POLICY IF EXISTS "medications_public_select" ON medications;
DROP POLICY IF EXISTS "Medications are public" ON medications;
DROP POLICY IF EXISTS "Anyone can view profiles" ON medications;

-- Create simple public read policy
CREATE POLICY "public_read_medications"
  ON medications
  FOR SELECT
  USING (true);
