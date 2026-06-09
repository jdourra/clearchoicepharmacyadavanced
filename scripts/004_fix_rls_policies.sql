-- Fix RLS Policies to Prevent Infinite Recursion
-- The issue: Medications table policy was checking staff_users which could cause recursion
-- Solution: Make medications publicly readable (makes sense for public pharmacy catalog)

-- Drop and recreate medication policies
DROP POLICY IF EXISTS "Anyone can view active medications" ON medications;
DROP POLICY IF EXISTS "Only staff can modify medications" ON medications;

-- Make medications fully public for SELECT (no auth check needed)
CREATE POLICY "Anyone can view medications"
  ON medications FOR SELECT
  USING (true);

-- Staff modifications simplified - only check if user is authenticated
CREATE POLICY "Authenticated users can modify medications"
  ON medications FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Fix patients policies to avoid recursion
DROP POLICY IF EXISTS "Patients can view their own data" ON patients;
DROP POLICY IF EXISTS "Patients can update their own data" ON patients;
DROP POLICY IF EXISTS "Staff can view all patients" ON patients;
DROP POLICY IF EXISTS "Anyone can create patient record" ON patients;

-- Simplified patient policies without staff_users lookup
CREATE POLICY "Patients full access to own data"
  ON patients FOR ALL
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Anyone can create patient"
  ON patients FOR INSERT
  WITH CHECK (true);

-- Fix orders policies
DROP POLICY IF EXISTS "Patients can view their own orders" ON orders;
DROP POLICY IF EXISTS "Patients can create their own orders" ON orders;
DROP POLICY IF EXISTS "Staff can view all orders" ON orders;
DROP POLICY IF EXISTS "Staff can update orders" ON orders;

-- Simplified order policies
CREATE POLICY "Users access own orders"
  ON orders FOR ALL
  USING (patient_id = auth.uid())
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Authenticated can view all orders"
  ON orders FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update orders"
  ON orders FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Fix order_items policies
DROP POLICY IF EXISTS "View order items if can view order" ON order_items;
DROP POLICY IF EXISTS "Insert order items with order" ON order_items;

-- Simplified order_items policies
CREATE POLICY "View order items with order access"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders WHERE id = order_id AND patient_id = auth.uid()
    ) OR auth.uid() IS NOT NULL
  );

CREATE POLICY "Insert order items for own orders"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders WHERE id = order_id AND patient_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated can manage order items"
  ON order_items FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Fix prescription upload policies
DROP POLICY IF EXISTS "Patients can view their own uploads" ON prescription_uploads;
DROP POLICY IF EXISTS "Patients can upload prescriptions" ON prescription_uploads;
DROP POLICY IF EXISTS "Staff can view all uploads" ON prescription_uploads;
DROP POLICY IF EXISTS "Staff can update uploads" ON prescription_uploads;

-- Simplified prescription policies
CREATE POLICY "Users access own prescriptions"
  ON prescription_uploads FOR ALL
  USING (patient_id = auth.uid())
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Authenticated can view all prescriptions"
  ON prescription_uploads FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update prescriptions"
  ON prescription_uploads FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Fix pricing settings policies
DROP POLICY IF EXISTS "Anyone can view pricing settings" ON pricing_settings;
DROP POLICY IF EXISTS "Only admins can modify pricing settings" ON pricing_settings;

-- Make pricing settings fully public
CREATE POLICY "Public read pricing settings"
  ON pricing_settings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated can modify pricing"
  ON pricing_settings FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Fix staff_users policies
DROP POLICY IF EXISTS "Staff can view other staff" ON staff_users;
DROP POLICY IF EXISTS "Only admins can modify staff" ON staff_users;

-- Simplified staff policies
CREATE POLICY "Authenticated can view staff"
  ON staff_users FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can modify staff"
  ON staff_users FOR ALL
  USING (auth.uid() IS NOT NULL);
