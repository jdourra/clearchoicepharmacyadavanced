-- Add acquisition_cost column to medications table for cash-pay pricing
ALTER TABLE medications 
ADD COLUMN IF NOT EXISTS acquisition_cost NUMERIC(10, 2) DEFAULT 5.00;

-- Update some medications with realistic acquisition costs
-- These are example costs - in production, these would come from drug price APIs
UPDATE medications SET acquisition_cost = 0.05 WHERE name ILIKE '%lisinopril%';
UPDATE medications SET acquisition_cost = 0.08 WHERE name ILIKE '%metformin%';
UPDATE medications SET acquisition_cost = 0.12 WHERE name ILIKE '%amlodipine%';
UPDATE medications SET acquisition_cost = 0.10 WHERE name ILIKE '%atorvastatin%';
UPDATE medications SET acquisition_cost = 0.15 WHERE name ILIKE '%omeprazole%';
UPDATE medications SET acquisition_cost = 0.06 WHERE name ILIKE '%losartan%';
UPDATE medications SET acquisition_cost = 0.09 WHERE name ILIKE '%levothyroxine%';
UPDATE medications SET acquisition_cost = 0.11 WHERE name ILIKE '%simvastatin%';
UPDATE medications SET acquisition_cost = 0.07 WHERE name ILIKE '%gabapentin%';
UPDATE medications SET acquisition_cost = 0.13 WHERE name ILIKE '%sertraline%';

-- Set default for any remaining null values
UPDATE medications SET acquisition_cost = 5.00 WHERE acquisition_cost IS NULL;

-- Add comment to explain the column
COMMENT ON COLUMN medications.acquisition_cost IS 'Cost per unit (pill/tablet) that pharmacy pays to acquire the medication';
