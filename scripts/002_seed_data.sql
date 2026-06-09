-- Seed insurance plans
INSERT INTO public.insurance_plans (provider_name, plan_name, tier, copay_generic, copay_brand, deductible) VALUES
('BlueCross BlueShield', 'Basic Plan', 'bronze', 15.00, 40.00, 5000.00),
('BlueCross BlueShield', 'Standard Plan', 'silver', 10.00, 30.00, 3000.00),
('BlueCross BlueShield', 'Premium Plan', 'gold', 5.00, 20.00, 1500.00),
('Aetna', 'Essential Coverage', 'bronze', 20.00, 45.00, 6000.00),
('Aetna', 'Plus Coverage', 'silver', 12.00, 35.00, 3500.00),
('Aetna', 'Elite Coverage', 'gold', 8.00, 25.00, 2000.00),
('United Healthcare', 'Basic', 'bronze', 18.00, 42.00, 5500.00),
('United Healthcare', 'Preferred', 'silver', 10.00, 32.00, 3000.00),
('United Healthcare', 'Premium', 'platinum', 5.00, 15.00, 1000.00),
('Cigna', 'Value Plan', 'bronze', 15.00, 38.00, 4500.00),
('Cigna', 'Advantage Plan', 'gold', 7.00, 22.00, 1800.00),
('Medicare', 'Part D Standard', 'silver', 5.00, 20.00, 500.00);

-- Seed medications
INSERT INTO public.medications (name, generic_name, brand_name, strength, form, ndc_code, description, typical_dosage, is_generic) VALUES
('Lisinopril', 'Lisinopril', 'Prinivil', '10mg', 'tablet', '68180-513-01', 'ACE inhibitor for high blood pressure', 'Once daily', true),
('Lisinopril', 'Lisinopril', 'Prinivil', '20mg', 'tablet', '68180-513-02', 'ACE inhibitor for high blood pressure', 'Once daily', true),
('Atorvastatin', 'Atorvastatin', 'Lipitor', '20mg', 'tablet', '00071-0155-23', 'Statin for cholesterol', 'Once daily', true),
('Atorvastatin', 'Atorvastatin', 'Lipitor', '40mg', 'tablet', '00071-0156-23', 'Statin for cholesterol', 'Once daily', true),
('Metformin', 'Metformin HCL', 'Glucophage', '500mg', 'tablet', '00093-7214-01', 'Type 2 diabetes medication', 'Twice daily with meals', true),
('Metformin', 'Metformin HCL', 'Glucophage', '1000mg', 'tablet', '00093-7267-01', 'Type 2 diabetes medication', 'Twice daily with meals', true),
('Amlodipine', 'Amlodipine Besylate', 'Norvasc', '5mg', 'tablet', '00093-0377-01', 'Calcium channel blocker for blood pressure', 'Once daily', true),
('Amlodipine', 'Amlodipine Besylate', 'Norvasc', '10mg', 'tablet', '00093-0378-01', 'Calcium channel blocker for blood pressure', 'Once daily', true),
('Omeprazole', 'Omeprazole', 'Prilosec', '20mg', 'capsule', '00093-7347-56', 'Proton pump inhibitor for acid reflux', 'Once daily before meal', true),
('Levothyroxine', 'Levothyroxine Sodium', 'Synthroid', '50mcg', 'tablet', '00074-3321-13', 'Thyroid hormone replacement', 'Once daily on empty stomach', true),
('Levothyroxine', 'Levothyroxine Sodium', 'Synthroid', '100mcg', 'tablet', '00074-7060-13', 'Thyroid hormone replacement', 'Once daily on empty stomach', true),
('Gabapentin', 'Gabapentin', 'Neurontin', '300mg', 'capsule', '00093-0818-01', 'Nerve pain and seizure medication', '3 times daily', true),
('Sertraline', 'Sertraline HCL', 'Zoloft', '50mg', 'tablet', '00093-7146-56', 'SSRI antidepressant', 'Once daily', true),
('Sertraline', 'Sertraline HCL', 'Zoloft', '100mg', 'tablet', '00093-7147-56', 'SSRI antidepressant', 'Once daily', true),
('Losartan', 'Losartan Potassium', 'Cozaar', '50mg', 'tablet', '00093-7365-56', 'ARB for high blood pressure', 'Once daily', true),
('Albuterol', 'Albuterol Sulfate', 'ProAir HFA', '90mcg', 'inhaler', '66993-0003-08', 'Rescue inhaler for asthma', 'As needed for breathing difficulty', false),
('Montelukast', 'Montelukast Sodium', 'Singulair', '10mg', 'tablet', '00093-7664-56', 'Asthma and allergy medication', 'Once daily in evening', true),
('Citalopram', 'Citalopram HBr', 'Celexa', '20mg', 'tablet', '00093-8159-56', 'SSRI antidepressant', 'Once daily', true),
('Amoxicillin', 'Amoxicillin', 'Amoxil', '500mg', 'capsule', '00093-4151-73', 'Antibiotic', '3 times daily', true),
('Hydrochlorothiazide', 'Hydrochlorothiazide', 'Microzide', '25mg', 'capsule', '00054-0062-25', 'Diuretic for blood pressure', 'Once daily', true);

-- Seed medication pricing (base cash prices and with various insurance plans)
-- We'll add pricing for each medication at common quantities
DO $$
DECLARE
  med RECORD;
  plan RECORD;
  qty INTEGER;
BEGIN
  -- For each medication, add base pricing
  FOR med IN SELECT id, is_generic FROM public.medications LOOP
    -- Common quantities: 30, 60, 90 day supplies
    FOREACH qty IN ARRAY ARRAY[30, 60, 90] LOOP
      -- Base cash price (no insurance)
      INSERT INTO public.medication_pricing (medication_id, quantity, base_price, insurance_plan_id, copay_price)
      VALUES (
        med.id,
        qty,
        CASE 
          WHEN med.is_generic THEN (qty * (RANDOM() * 1.5 + 0.5))::DECIMAL(10,2)
          ELSE (qty * (RANDOM() * 8 + 5))::DECIMAL(10,2)
        END,
        NULL,
        NULL
      );
      
      -- Add pricing for each insurance plan
      FOR plan IN SELECT id, copay_generic, copay_brand FROM public.insurance_plans LOOP
        INSERT INTO public.medication_pricing (medication_id, quantity, base_price, insurance_plan_id, copay_price)
        VALUES (
          med.id,
          qty,
          CASE 
            WHEN med.is_generic THEN (qty * (RANDOM() * 1.5 + 0.5))::DECIMAL(10,2)
            ELSE (qty * (RANDOM() * 8 + 5))::DECIMAL(10,2)
          END,
          plan.id,
          CASE 
            WHEN med.is_generic THEN plan.copay_generic
            ELSE plan.copay_brand
          END
        );
      END LOOP;
    END LOOP;
  END LOOP;
END $$;
