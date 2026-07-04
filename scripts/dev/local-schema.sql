-- Local development schema for Clear Choice Pharmacy
-- ---------------------------------------------------
-- This schema is ONLY for local development against a plain PostgreSQL
-- instance fronted by the Neon-compatible HTTP proxy (scripts/dev/neon-local-proxy.mjs).
--
-- It mirrors the columns the *current* application code expects (which have
-- diverged from the historical scripts/0xx_*.sql migration files), and omits the
-- Supabase-style RLS policies (auth.uid()) that do not exist in vanilla Postgres.
-- The app connects as a superuser locally, so RLS is not needed.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS prescription_uploads CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS medications CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS staff_users CASCADE;
DROP TABLE IF EXISTS pricing_settings CASCADE;

-- ── Auth: sessions (custom cookie auth) ──────────────────────────────
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('patient', 'staff', 'admin')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Patients ─────────────────────────────────────────────────────────
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT,
  phone TEXT,
  date_of_birth DATE,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Staff users ──────────────────────────────────────────────────────
CREATE TABLE staff_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'tech' CHECK (role IN ('admin', 'pharmacist', 'tech')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_login TIMESTAMPTZ
);

-- ── Medications (columns match app/api/drugs + app/api/prices + detail) ─
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  generic_name TEXT,
  brand_name TEXT,
  strength TEXT,
  dosage_form TEXT,
  ndc TEXT,
  acquisition_cost NUMERIC(12, 4),
  our_price NUMERIC(12, 2),
  typical_retail_price NUMERIC(12, 2),
  per_unit_cost NUMERIC(12, 6),
  package_quantity INTEGER,
  is_generic BOOLEAN DEFAULT true,
  days_supply INTEGER,
  category TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_medications_name ON medications (LOWER(name));

-- ── Orders / items (kept minimal for checkout demos) ─────────────────
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending_rx',
  delivery_method TEXT DEFAULT 'pickup',
  delivery_fee NUMERIC(10, 2) DEFAULT 0,
  subtotal NUMERIC(10, 2) DEFAULT 0,
  total NUMERIC(10, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  medication_id UUID,
  drug_name TEXT,
  strength TEXT,
  quantity INTEGER DEFAULT 30,
  price_at_purchase NUMERIC(10, 2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Pricing settings (single-row config) ─────────────────────────────
CREATE TABLE pricing_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispensing_fee NUMERIC(10, 2) NOT NULL DEFAULT 5.00,
  markup_percentage NUMERIC(5, 2) NOT NULL DEFAULT 15.00,
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 5.00,
  show_price_breakdown BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO pricing_settings (dispensing_fee, markup_percentage, delivery_fee)
VALUES (5.00, 15.00, 5.00);

-- Default admin staff account for local dev (password: admin123)
INSERT INTO staff_users (email, password_hash, full_name, role)
VALUES ('admin@clearchoice.com', crypt('admin123', gen_salt('bf')), 'Admin User', 'admin');

-- ── Seed a representative catalog of common medications ───────────────
INSERT INTO medications (name, generic_name, strength, dosage_form, ndc, acquisition_cost, per_unit_cost, package_quantity, is_generic, category) VALUES
  ('Atorvastatin Calcium', 'atorvastatin', '10 MG', 'TABLET', '65862002099', 15.42, 0.01542, 1000, true, 'cardiovascular'),
  ('Atorvastatin Calcium', 'atorvastatin', '20 MG', 'TABLET', '65862002199', 17.64, 0.01764, 1000, true, 'cardiovascular'),
  ('Atorvastatin Calcium', 'atorvastatin', '40 MG', 'TABLET', '65862002299', 20.09, 0.02009, 1000, true, 'cardiovascular'),
  ('Atorvastatin Calcium', 'atorvastatin', '80 MG', 'TABLET', '65862002399', 27.97, 0.02797, 1000, true, 'cardiovascular'),
  ('Lisinopril', 'lisinopril', '5 MG', 'TABLET', '65862000499', 18.25, 0.01825, 1000, true, 'cardiovascular'),
  ('Lisinopril', 'lisinopril', '10 MG', 'TABLET', '65862000599', 18.42, 0.01842, 1000, true, 'cardiovascular'),
  ('Lisinopril', 'lisinopril', '20 MG', 'TABLET', '65862000699', 19.80, 0.01980, 1000, true, 'cardiovascular'),
  ('Lisinopril', 'lisinopril', '40 MG', 'TABLET', '65862000799', 21.84, 0.02184, 1000, true, 'cardiovascular'),
  ('Metformin HCl', 'metformin', '500 MG', 'TABLET', '65862000199', 9.44, 0.00944, 1000, true, 'diabetes'),
  ('Metformin HCl', 'metformin', '850 MG', 'TABLET', '65862000299', 13.56, 0.01356, 1000, true, 'diabetes'),
  ('Metformin HCl', 'metformin', '1000 MG', 'TABLET', '65862000399', 15.68, 0.01568, 1000, true, 'diabetes'),
  ('Amlodipine Besylate', 'amlodipine', '2.5 MG', 'TABLET', '65862001499', 8.05, 0.00805, 1000, true, 'cardiovascular'),
  ('Amlodipine Besylate', 'amlodipine', '5 MG', 'TABLET', '65862001599', 8.05, 0.00805, 1000, true, 'cardiovascular'),
  ('Amlodipine Besylate', 'amlodipine', '10 MG', 'TABLET', '65862001699', 8.61, 0.00861, 1000, true, 'cardiovascular'),
  ('Losartan Potassium', 'losartan', '25 MG', 'TABLET', '31722070010', 9.72, 0.00972, 1000, true, 'cardiovascular'),
  ('Losartan Potassium', 'losartan', '50 MG', 'TABLET', '31722070110', 14.03, 0.01403, 1000, true, 'cardiovascular'),
  ('Losartan Potassium', 'losartan', '100 MG', 'TABLET', '31722070210', 23.36, 0.02336, 1000, true, 'cardiovascular'),
  ('Omeprazole', 'omeprazole', '20 MG', 'CAPSULE', '65862009901', 19.71, 0.01971, 1000, true, 'gastrointestinal'),
  ('Omeprazole', 'omeprazole', '40 MG', 'CAPSULE', '65862010001', 28.77, 0.02877, 1000, true, 'gastrointestinal'),
  ('Levothyroxine Sodium', 'levothyroxine', '50 MCG', 'TABLET', '65862009301', 16.94, 0.01694, 1000, true, 'endocrine'),
  ('Levothyroxine Sodium', 'levothyroxine', '100 MCG', 'TABLET', '65862009401', 17.35, 0.01735, 1000, true, 'endocrine'),
  ('Gabapentin', 'gabapentin', '100 MG', 'CAPSULE', '65862004801', 10.74, 0.01074, 1000, true, 'neurology'),
  ('Gabapentin', 'gabapentin', '300 MG', 'CAPSULE', '65862004901', 14.67, 0.01467, 1000, true, 'neurology'),
  ('Gabapentin', 'gabapentin', '600 MG', 'TABLET', '65862009101', 21.71, 0.02171, 1000, true, 'neurology'),
  ('Albuterol Sulfate HFA', 'albuterol', '90 MCG', 'INHALER', '59310058718', 9.75, 9.75000, 1, true, 'respiratory');
