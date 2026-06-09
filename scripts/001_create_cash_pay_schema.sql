-- Clear Choice Pharmacy - Cash-Pay Only Database Schema
-- Business Model: Acquisition Cost × 1.15 + $5.00 Dispensing Fee

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for fresh start)
DROP TABLE IF EXISTS prescription_uploads CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS medications CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS staff_users CASCADE;
DROP TABLE IF EXISTS pricing_settings CASCADE;

-- Medications table with real drug pricing
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  drug_name TEXT NOT NULL,
  generic_name TEXT,
  brand_name TEXT,
  strength TEXT NOT NULL,
  form TEXT NOT NULL, -- tablet, capsule, liquid, etc.
  ndc TEXT UNIQUE, -- National Drug Code
  acquisition_cost DECIMAL(10, 2) NOT NULL, -- Wholesale/acquisition cost
  active BOOLEAN DEFAULT true,
  price_locked BOOLEAN DEFAULT false, -- Prevent API auto-updates
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  category TEXT, -- cardiovascular, diabetes, antibiotics, etc.
  description TEXT
);

-- Patients table
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  dob DATE,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending_rx', -- pending_rx, processing, ready, completed, problem
  delivery_method TEXT NOT NULL, -- pickup, delivery
  delivery_fee DECIMAL(10, 2) DEFAULT 0.00,
  subtotal DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  ready_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  medication_id UUID NOT NULL REFERENCES medications(id),
  quantity INTEGER NOT NULL DEFAULT 30,
  price_at_purchase DECIMAL(10, 2) NOT NULL, -- Frozen selling price
  acquisition_cost_at_purchase DECIMAL(10, 2) NOT NULL, -- Frozen acquisition cost
  dispensing_fee DECIMAL(10, 2) NOT NULL, -- Frozen dispensing fee
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescription uploads table
CREATE TABLE prescription_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  notes TEXT,
  reviewed_by UUID REFERENCES staff_users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Staff users table
CREATE TABLE staff_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'tech', -- admin, pharmacist, tech
  first_name TEXT,
  last_name TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Pricing settings table (single row configuration)
CREATE TABLE pricing_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dispensing_fee DECIMAL(10, 2) NOT NULL DEFAULT 5.00,
  markup_percentage DECIMAL(5, 2) NOT NULL DEFAULT 15.00,
  delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 5.00,
  show_price_breakdown BOOLEAN DEFAULT true,
  retail_comparison_text TEXT DEFAULT 'Typical retail pharmacies charge 3-5× our cost',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_api_sync TIMESTAMP WITH TIME ZONE
);

-- Insert default pricing settings
INSERT INTO pricing_settings (dispensing_fee, markup_percentage, delivery_fee, show_price_breakdown)
VALUES (5.00, 15.00, 5.00, true);

-- Create indexes for performance
CREATE INDEX idx_medications_active ON medications(active);
CREATE INDEX idx_medications_drug_name ON medications(drug_name);
CREATE INDEX idx_medications_ndc ON medications(ndc);
CREATE INDEX idx_orders_patient_id ON orders(patient_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_prescription_uploads_order_id ON prescription_uploads(order_id);
CREATE INDEX idx_prescription_uploads_status ON prescription_uploads(status);

-- Row Level Security (RLS)
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Medications: Everyone can view, only staff can modify
CREATE POLICY "Anyone can view active medications"
  ON medications FOR SELECT
  USING (active = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Only staff can modify medications"
  ON medications FOR ALL
  USING (EXISTS (
    SELECT 1 FROM staff_users WHERE id = auth.uid() AND active = true
  ));

-- Patients: Can view/update their own data, staff can view all
CREATE POLICY "Patients can view their own data"
  ON patients FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Patients can update their own data"
  ON patients FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Staff can view all patients"
  ON patients FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM staff_users WHERE id = auth.uid() AND active = true
  ));

CREATE POLICY "Anyone can create patient record"
  ON patients FOR INSERT
  WITH CHECK (true);

-- Orders: Patients can view their own, staff can view all
CREATE POLICY "Patients can view their own orders"
  ON orders FOR SELECT
  USING (patient_id = auth.uid());

CREATE POLICY "Patients can create their own orders"
  ON orders FOR INSERT
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Staff can view all orders"
  ON orders FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM staff_users WHERE id = auth.uid() AND active = true
  ));

CREATE POLICY "Staff can update orders"
  ON orders FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM staff_users WHERE id = auth.uid() AND active = true
  ));

-- Order items: Follow order permissions
CREATE POLICY "View order items if can view order"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders WHERE id = order_id AND (patient_id = auth.uid() OR EXISTS (
        SELECT 1 FROM staff_users WHERE id = auth.uid() AND active = true
      ))
    )
  );

CREATE POLICY "Insert order items with order"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders WHERE id = order_id AND patient_id = auth.uid()
    )
  );

-- Prescription uploads: Patients and staff access
CREATE POLICY "Patients can view their own uploads"
  ON prescription_uploads FOR SELECT
  USING (patient_id = auth.uid());

CREATE POLICY "Patients can upload prescriptions"
  ON prescription_uploads FOR INSERT
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Staff can view all uploads"
  ON prescription_uploads FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM staff_users WHERE id = auth.uid() AND active = true
  ));

CREATE POLICY "Staff can update uploads"
  ON prescription_uploads FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM staff_users WHERE id = auth.uid() AND active = true
  ));

-- Pricing settings: Everyone can view, only admin can modify
CREATE POLICY "Anyone can view pricing settings"
  ON pricing_settings FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify pricing settings"
  ON pricing_settings FOR ALL
  USING (EXISTS (
    SELECT 1 FROM staff_users WHERE id = auth.uid() AND role = 'admin' AND active = true
  ));

-- Staff users: Staff can view, only admins can modify
CREATE POLICY "Staff can view other staff"
  ON staff_users FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM staff_users WHERE id = auth.uid() AND active = true
  ));

CREATE POLICY "Only admins can modify staff"
  ON staff_users FOR ALL
  USING (EXISTS (
    SELECT 1 FROM staff_users WHERE id = auth.uid() AND role = 'admin' AND active = true
  ));

-- Function to calculate selling price
CREATE OR REPLACE FUNCTION calculate_selling_price(acq_cost DECIMAL, qty INTEGER DEFAULT 30)
RETURNS DECIMAL AS $$
DECLARE
  settings RECORD;
BEGIN
  SELECT dispensing_fee, markup_percentage INTO settings FROM pricing_settings LIMIT 1;
  RETURN ROUND((acq_cost * qty * (1 + settings.markup_percentage / 100)) + settings.dispensing_fee, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to update order totals
CREATE OR REPLACE FUNCTION update_order_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE orders
  SET subtotal = (
    SELECT COALESCE(SUM(price_at_purchase), 0)
    FROM order_items
    WHERE order_id = NEW.order_id
  ),
  total = (
    SELECT COALESCE(SUM(price_at_purchase), 0) + delivery_fee
    FROM order_items
    WHERE order_id = NEW.order_id
  ),
  updated_at = NOW()
  WHERE id = NEW.order_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update order totals when items change
CREATE TRIGGER update_order_totals_trigger
AFTER INSERT OR UPDATE OR DELETE ON order_items
FOR EACH ROW
EXECUTE FUNCTION update_order_totals();
