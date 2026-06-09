-- Populate common medications from RxNav with testing prices
-- $1 for tablets/capsules (30-day supply), $30 for inhalers

-- Clear existing medications (optional - remove if you want to keep existing data)
-- TRUNCATE medications CASCADE;

-- Insert top 50 most commonly prescribed medications with proper pricing
INSERT INTO medications (name, generic_name, strength, dosage_form, ndc_code, acquisition_cost, category) VALUES
-- Blood Pressure Medications (Tablets - $1 for 30)
('Lisinopril', 'Lisinopril', '10mg', 'tablet', '00093-1046-01', 0.0333, 'oral'),
('Lisinopril', 'Lisinopril', '20mg', 'tablet', '00093-1047-01', 0.0333, 'oral'),
('Amlodipine', 'Amlodipine Besylate', '5mg', 'tablet', '00093-7369-01', 0.0333, 'oral'),
('Amlodipine', 'Amlodipine Besylate', '10mg', 'tablet', '00093-7370-01', 0.0333, 'oral'),
('Losartan', 'Losartan Potassium', '50mg', 'tablet', '00093-7365-01', 0.0333, 'oral'),
('Losartan', 'Losartan Potassium', '100mg', 'tablet', '00093-7366-01', 0.0333, 'oral'),
('Metoprolol', 'Metoprolol Tartrate', '50mg', 'tablet', '00093-1050-01', 0.0333, 'oral'),
('Atenolol', 'Atenolol', '50mg', 'tablet', '00093-1033-01', 0.0333, 'oral'),

-- Cholesterol Medications (Tablets - $1 for 30)
('Atorvastatin', 'Atorvastatin Calcium', '10mg', 'tablet', '00093-5056-01', 0.0333, 'oral'),
('Atorvastatin', 'Atorvastatin Calcium', '20mg', 'tablet', '00093-5057-01', 0.0333, 'oral'),
('Atorvastatin', 'Atorvastatin Calcium', '40mg', 'tablet', '00093-5058-01', 0.0333, 'oral'),
('Simvastatin', 'Simvastatin', '20mg', 'tablet', '00093-7270-01', 0.0333, 'oral'),
('Simvastatin', 'Simvastatin', '40mg', 'tablet', '00093-7271-01', 0.0333, 'oral'),

-- Diabetes Medications (Tablets - $1 for 30)
('Metformin', 'Metformin HCl', '500mg', 'tablet', '00093-7214-01', 0.0333, 'oral'),
('Metformin', 'Metformin HCl', '850mg', 'tablet', '00093-7267-01', 0.0333, 'oral'),
('Metformin', 'Metformin HCl', '1000mg', 'tablet', '00093-7268-01', 0.0333, 'oral'),
('Glipizide', 'Glipizide', '5mg', 'tablet', '00093-7250-01', 0.0333, 'oral'),
('Glipizide', 'Glipizide', '10mg', 'tablet', '00093-7251-01', 0.0333, 'oral'),

-- Thyroid Medications (Tablets - $1 for 30)
('Levothyroxine', 'Levothyroxine Sodium', '25mcg', 'tablet', '00093-4156-01', 0.0333, 'oral'),
('Levothyroxine', 'Levothyroxine Sodium', '50mcg', 'tablet', '00093-4157-01', 0.0333, 'oral'),
('Levothyroxine', 'Levothyroxine Sodium', '75mcg', 'tablet', '00093-4158-01', 0.0333, 'oral'),
('Levothyroxine', 'Levothyroxine Sodium', '100mcg', 'tablet', '00093-4159-01', 0.0333, 'oral'),

-- Asthma/COPD (Inhalers - $30 each)
('Albuterol HFA', 'Albuterol Sulfate', '90mcg', 'inhaler', '59310-5792-08', 30.00, 'inhaler'),
('Fluticasone Propionate HFA', 'Fluticasone Propionate', '110mcg', 'inhaler', '00173-0862-20', 30.00, 'inhaler'),
('Budesonide', 'Budesonide', '180mcg', 'inhaler', '59310-5796-12', 30.00, 'inhaler'),

-- Antidepressants (Tablets/Capsules - $1 for 30)
('Sertraline', 'Sertraline HCl', '50mg', 'tablet', '00093-7146-01', 0.0333, 'oral'),
('Sertraline', 'Sertraline HCl', '100mg', 'tablet', '00093-7147-01', 0.0333, 'oral'),
('Escitalopram', 'Escitalopram Oxalate', '10mg', 'tablet', '00093-7539-01', 0.0333, 'oral'),
('Escitalopram', 'Escitalopram Oxalate', '20mg', 'tablet', '00093-7540-01', 0.0333, 'oral'),
('Fluoxetine', 'Fluoxetine HCl', '20mg', 'capsule', '00093-7198-01', 0.0333, 'oral'),

-- Acid Reflux (Capsules - $1 for 30)
('Omeprazole', 'Omeprazole', '20mg', 'capsule', '00093-7347-01', 0.0333, 'oral'),
('Omeprazole', 'Omeprazole', '40mg', 'capsule', '00093-7348-01', 0.0333, 'oral'),
('Pantoprazole', 'Pantoprazole Sodium', '40mg', 'tablet', '00093-5145-01', 0.0333, 'oral'),

-- Pain Management (Tablets - $1 for 30)
('Ibuprofen', 'Ibuprofen', '600mg', 'tablet', '00093-2760-01', 0.0333, 'oral'),
('Ibuprofen', 'Ibuprofen', '800mg', 'tablet', '00093-2761-01', 0.0333, 'oral'),
('Naproxen', 'Naproxen', '500mg', 'tablet', '00093-0149-01', 0.0333, 'oral'),

-- Antibiotics (Tablets/Capsules - $1 for 30)
('Amoxicillin', 'Amoxicillin', '500mg', 'capsule', '00093-4150-01', 0.0333, 'oral'),
('Azithromycin', 'Azithromycin', '250mg', 'tablet', '00093-7146-12', 0.0333, 'oral'),
('Doxycycline', 'Doxycycline Hyclate', '100mg', 'tablet', '00093-1130-01', 0.0333, 'oral'),

-- Allergy (Tablets - $1 for 30)
('Cetirizine', 'Cetirizine HCl', '10mg', 'tablet', '00093-1041-01', 0.0333, 'oral'),
('Loratadine', 'Loratadine', '10mg', 'tablet', '00093-1045-01', 0.0333, 'oral'),
('Montelukast', 'Montelukast Sodium', '10mg', 'tablet', '00093-7355-01', 0.0333, 'oral')

ON CONFLICT (ndc_code) DO UPDATE SET
  acquisition_cost = EXCLUDED.acquisition_cost,
  dosage_form = EXCLUDED.dosage_form,
  category = EXCLUDED.category;
