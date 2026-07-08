-- Clear Choice Pharmacy - Neon Database Schema
-- Migrated from Supabase
-- Business Model: Acquisition Cost x 1.15 + $5.00 Dispensing Fee

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist (for fresh start)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS prescription_uploads CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS supplier_prices CASCADE;
DROP TABLE IF EXISTS medications CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS staff_users CASCADE;
DROP TABLE IF EXISTS pricing_settings CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;

-- ============================================
-- Sessions table (custom auth, replaces Supabase Auth)
-- ============================================
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('patient', 'staff', 'admin')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Staff users table
-- ============================================
CREATE TABLE staff_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'tech' CHECK (role IN ('admin', 'pharmacist', 'tech')),
  first_name TEXT,
  last_name TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- Patients table (replaces Supabase auth.users + profiles)
-- ============================================
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  dob DATE,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Medications table
-- ============================================
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drug_name TEXT NOT NULL,
  generic_name TEXT,
  brand_name TEXT,
  strength TEXT NOT NULL,
  form TEXT NOT NULL,
  ndc TEXT UNIQUE,
  acquisition_cost DECIMAL(10, 4) NOT NULL,
  active BOOLEAN DEFAULT true,
  price_locked BOOLEAN DEFAULT false,
  is_generic BOOLEAN DEFAULT true,
  category TEXT,
  description TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Supplier prices table
-- ============================================
CREATE TABLE supplier_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  ndc_code TEXT,
  strength TEXT,
  package_size INTEGER,
  acquisition_cost_per_unit DECIMAL(10, 4),
  supplier_name TEXT DEFAULT 'Prescription Supply',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Orders table
-- ============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending_rx' CHECK (status IN ('pending', 'pending_rx', 'processing', 'ready', 'shipped', 'delivered', 'completed', 'problem', 'cancelled')),
  delivery_method TEXT NOT NULL DEFAULT 'pickup',
  delivery_fee DECIMAL(10, 2) DEFAULT 0.00,
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  notes TEXT,
  ready_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Order items table
-- ============================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  medication_id UUID NOT NULL REFERENCES medications(id),
  drug_name TEXT NOT NULL,
  strength TEXT,
  quantity INTEGER NOT NULL DEFAULT 30,
  price_at_purchase DECIMAL(10, 2) NOT NULL,
  acquisition_cost_at_purchase DECIMAL(10, 4) NOT NULL,
  dispensing_fee DECIMAL(10, 2) NOT NULL DEFAULT 5.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Prescriptions table
-- ============================================
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  medication_id UUID REFERENCES medications(id),
  quantity INTEGER NOT NULL DEFAULT 30,
  refills_remaining INTEGER DEFAULT 0,
  instructions TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'processing', 'ready', 'completed', 'cancelled')),
  prescriber_name TEXT,
  prescriber_npi TEXT,
  ready_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Prescription uploads table
-- ============================================
CREATE TABLE prescription_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  reviewed_by UUID REFERENCES staff_users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- Messages table
-- ============================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('prescription_ready', 'payment_request', 'shipped', 'delivered', 'custom')),
  content TEXT NOT NULL,
  amount DECIMAL(10, 2),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Pricing settings table (single row config)
-- ============================================
CREATE TABLE pricing_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispensing_fee DECIMAL(10, 2) NOT NULL DEFAULT 5.00,
  markup_percentage DECIMAL(5, 2) NOT NULL DEFAULT 15.00,
  delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 5.00,
  show_price_breakdown BOOLEAN DEFAULT true,
  retail_comparison_text TEXT DEFAULT 'Typical retail pharmacies charge 3-5x our cost',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_api_sync TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
CREATE INDEX idx_medications_active ON medications(active);
CREATE INDEX idx_medications_drug_name ON medications(drug_name);
CREATE INDEX idx_medications_ndc ON medications(ndc);
CREATE INDEX idx_medications_generic_name ON medications(generic_name);
CREATE INDEX idx_orders_patient_id ON orders(patient_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_staff_email ON staff_users(email);
CREATE INDEX idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);
CREATE INDEX idx_prescription_uploads_order_id ON prescription_uploads(order_id);
CREATE INDEX idx_messages_patient_id ON messages(patient_id);

-- ============================================
-- Insert default data
-- ============================================

-- Default pricing settings
INSERT INTO pricing_settings (dispensing_fee, markup_percentage, delivery_fee, show_price_breakdown)
VALUES (5.00, 15.00, 5.00, true);

-- Default admin staff user (password: admin123, hashed with bcrypt)
INSERT INTO staff_users (email, password_hash, role, first_name, last_name)
VALUES ('admin@clearchoice.com', '$2b$10$LQv3c1yqBo9/Z.QbJ8q6oOxRADTMSLj7xHy/V7d5aT9OGSsJzPJVe', 'admin', 'Admin', 'User');
