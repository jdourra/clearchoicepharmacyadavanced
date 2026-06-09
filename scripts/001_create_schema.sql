-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE insurance_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE prescription_status AS ENUM ('submitted', 'processing', 'ready', 'completed', 'cancelled');
CREATE TYPE user_role AS ENUM ('patient', 'pharmacist', 'admin');

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  date_of_birth DATE,
  role user_role DEFAULT 'patient',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insurance plans table
CREATE TABLE IF NOT EXISTS public.insurance_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_name TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  tier insurance_tier NOT NULL,
  copay_generic DECIMAL(10,2),
  copay_brand DECIMAL(10,2),
  deductible DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patient insurance table
CREATE TABLE IF NOT EXISTS public.patient_insurance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  insurance_plan_id UUID REFERENCES public.insurance_plans(id),
  policy_number TEXT,
  group_number TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medications table
CREATE TABLE IF NOT EXISTS public.medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  generic_name TEXT,
  brand_name TEXT,
  strength TEXT,
  form TEXT, -- tablet, capsule, liquid, etc.
  ndc_code TEXT UNIQUE,
  description TEXT,
  typical_dosage TEXT,
  is_generic BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medication pricing table
CREATE TABLE IF NOT EXISTS public.medication_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medication_id UUID REFERENCES public.medications(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  insurance_plan_id UUID REFERENCES public.insurance_plans(id),
  copay_price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(medication_id, quantity, insurance_plan_id)
);

-- Prescriptions table
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  medication_id UUID REFERENCES public.medications(id),
  prescriber_name TEXT NOT NULL,
  prescriber_npi TEXT,
  quantity INTEGER NOT NULL,
  refills_remaining INTEGER DEFAULT 0,
  instructions TEXT,
  status prescription_status DEFAULT 'submitted',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  ready_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  prescription_id UUID REFERENCES public.prescriptions(id),
  total_amount DECIMAL(10,2) NOT NULL,
  insurance_coverage DECIMAL(10,2) DEFAULT 0,
  patient_payment DECIMAL(10,2) NOT NULL,
  payment_status payment_status DEFAULT 'pending',
  payment_method TEXT,
  delivery_address TEXT,
  tracking_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Price history for transparency
CREATE TABLE IF NOT EXISTS public.price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medication_id UUID REFERENCES public.medications(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Staff can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('pharmacist', 'admin')
    )
  );

-- RLS Policies for insurance_plans (public read)
CREATE POLICY "Anyone can view insurance plans"
  ON public.insurance_plans FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify insurance plans"
  ON public.insurance_plans FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for patient_insurance
CREATE POLICY "Patients can view their own insurance"
  ON public.patient_insurance FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients can insert their own insurance"
  ON public.patient_insurance FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can update their own insurance"
  ON public.patient_insurance FOR UPDATE
  USING (auth.uid() = patient_id);

CREATE POLICY "Staff can view all patient insurance"
  ON public.patient_insurance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('pharmacist', 'admin')
    )
  );

-- RLS Policies for medications (public read)
CREATE POLICY "Anyone can view medications"
  ON public.medications FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only staff can modify medications"
  ON public.medications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('pharmacist', 'admin')
    )
  );

-- RLS Policies for medication_pricing (public read)
CREATE POLICY "Anyone can view medication pricing"
  ON public.medication_pricing FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only staff can modify pricing"
  ON public.medication_pricing FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('pharmacist', 'admin')
    )
  );

-- RLS Policies for prescriptions
CREATE POLICY "Patients can view their own prescriptions"
  ON public.prescriptions FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients can create their own prescriptions"
  ON public.prescriptions FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Staff can view all prescriptions"
  ON public.prescriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('pharmacist', 'admin')
    )
  );

CREATE POLICY "Staff can update prescriptions"
  ON public.prescriptions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('pharmacist', 'admin')
    )
  );

-- RLS Policies for orders
CREATE POLICY "Patients can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients can create their own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Staff can view all orders"
  ON public.orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('pharmacist', 'admin')
    )
  );

CREATE POLICY "Staff can update orders"
  ON public.orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('pharmacist', 'admin')
    )
  );

-- RLS Policies for price_history (public read)
CREATE POLICY "Anyone can view price history"
  ON public.price_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only staff can add price history"
  ON public.price_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('pharmacist', 'admin')
    )
  );

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'patient')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for performance
CREATE INDEX idx_prescriptions_patient ON public.prescriptions(patient_id);
CREATE INDEX idx_prescriptions_status ON public.prescriptions(status);
CREATE INDEX idx_orders_patient ON public.orders(patient_id);
CREATE INDEX idx_medications_name ON public.medications(name);
CREATE INDEX idx_medications_generic_name ON public.medications(generic_name);
CREATE INDEX idx_medication_pricing_medication ON public.medication_pricing(medication_id);
