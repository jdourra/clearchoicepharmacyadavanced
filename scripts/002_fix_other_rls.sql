-- Fix RLS policies on other tables to prevent recursion

-- Orders policies
DROP POLICY IF EXISTS "Staff can view all orders" ON orders;
CREATE POLICY "Staff can view all orders"
  ON orders FOR SELECT
  USING (
    patient_id = auth.uid()
    OR
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('staff', 'admin', 'pharmacist')
  );

DROP POLICY IF EXISTS "Staff can update orders" ON orders;
CREATE POLICY "Staff can update orders"
  ON orders FOR UPDATE
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('staff', 'admin', 'pharmacist')
  );

-- Prescriptions policies  
DROP POLICY IF EXISTS "Staff can view all prescriptions" ON prescriptions;
CREATE POLICY "Staff can view all prescriptions"
  ON prescriptions FOR SELECT
  USING (
    patient_id = auth.uid()
    OR
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('staff', 'admin', 'pharmacist')
  );

DROP POLICY IF EXISTS "Staff can update prescriptions" ON prescriptions;
CREATE POLICY "Staff can update prescriptions"
  ON prescriptions FOR UPDATE
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('staff', 'admin', 'pharmacist')
  );

-- Patient insurance policies
DROP POLICY IF EXISTS "Staff can view all patient insurance" ON patient_insurance;
CREATE POLICY "Staff can view all patient insurance"
  ON patient_insurance FOR SELECT
  USING (
    patient_id = auth.uid()
    OR
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('staff', 'admin', 'pharmacist')
  );

-- Medication pricing - allow staff to modify
DROP POLICY IF EXISTS "Only staff can modify pricing" ON medication_pricing;
CREATE POLICY "Staff can modify pricing"
  ON medication_pricing FOR ALL
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('staff', 'admin', 'pharmacist')
  );

-- Insurance plans - allow staff/admin to modify
DROP POLICY IF EXISTS "Only admins can modify insurance plans" ON insurance_plans;
CREATE POLICY "Admins can modify insurance plans"
  ON insurance_plans FOR ALL
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin')
  );

-- Price history - staff can insert
DROP POLICY IF EXISTS "Only staff can add price history" ON price_history;
CREATE POLICY "Staff can add price history"
  ON price_history FOR INSERT
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('staff', 'admin', 'pharmacist')
  );
