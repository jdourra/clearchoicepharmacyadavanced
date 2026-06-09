-- Fix medications RLS policies to work with existing schema

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view active medications" ON medications;
DROP POLICY IF EXISTS "Anyone can view medications" ON medications;
DROP POLICY IF EXISTS "Only staff can modify medications" ON medications;

-- Recreate without recursion
-- Policy 1: Anyone can view medications (no auth required for browsing)
CREATE POLICY "Public can view medications"
  ON medications FOR SELECT
  USING (true);

-- Policy 2: Only staff can modify (check role from profiles without recursion)
CREATE POLICY "Staff can modify medications"
  ON medications FOR ALL
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('staff', 'admin', 'pharmacist')
  );
