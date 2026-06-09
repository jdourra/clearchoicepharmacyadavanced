-- Add supplier pricing table to track real costs from Prescription Supply
CREATE TABLE IF NOT EXISTS supplier_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id uuid REFERENCES medications(id) ON DELETE CASCADE,
  ndc_code text,
  strength text NOT NULL,
  package_size integer NOT NULL,
  acquisition_cost_per_unit numeric(10, 4) NOT NULL,
  supplier_name text DEFAULT 'Prescription Supply',
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_supplier_prices_medication ON supplier_prices(medication_id);
CREATE INDEX IF NOT EXISTS idx_supplier_prices_ndc ON supplier_prices(ndc_code);
CREATE INDEX IF NOT EXISTS idx_supplier_prices_updated ON supplier_prices(last_updated);

-- Enable RLS
ALTER TABLE supplier_prices ENABLE ROW LEVEL SECURITY;

-- Public can view prices
CREATE POLICY "Supplier prices are public"
  ON supplier_prices FOR SELECT
  USING (true);

-- Only authenticated users can manage supplier prices
CREATE POLICY "Authenticated users can manage supplier prices"
  ON supplier_prices FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Add some sample supplier prices from Prescription Supply
INSERT INTO supplier_prices (medication_id, ndc_code, strength, package_size, acquisition_cost_per_unit, supplier_name)
SELECT 
  id,
  '00000-0000-00',
  strength,
  100,
  CASE 
    WHEN name ILIKE '%lisinopril%' THEN 0.08
    WHEN name ILIKE '%metformin%' THEN 0.12
    WHEN name ILIKE '%amlodipine%' THEN 0.15
    WHEN name ILIKE '%atorvastatin%' THEN 0.18
    WHEN name ILIKE '%omeprazole%' THEN 0.10
    ELSE 0.20
  END,
  'Prescription Supply'
FROM medications
WHERE strength IS NOT NULL
ON CONFLICT DO NOTHING;
