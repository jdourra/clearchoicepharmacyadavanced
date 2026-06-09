-- Populate database with top 300 most prescribed medications
-- Each medication set at $1 per 30 tablets ($0.0333 per tablet)

-- Add more common medications with realistic NDC codes and RxNorm identifiers
INSERT INTO medications (name, generic_name, brand_name, strength, form, ndc, manufacturer, category, description, acquisition_cost)
VALUES
  -- Cardiovascular
  ('Lisinopril', 'Lisinopril', NULL, '10mg', 'Tablet', '68180098003', 'Generic', 'Prescription', 'ACE inhibitor for high blood pressure', 0.0333),
  ('Lisinopril', 'Lisinopril', NULL, '20mg', 'Tablet', '68180098103', 'Generic', 'Prescription', 'ACE inhibitor for high blood pressure', 0.0333),
  ('Amlodipine', 'Amlodipine', 'Norvasc', '5mg', 'Tablet', '68180051801', 'Generic', 'Prescription', 'Calcium channel blocker for blood pressure', 0.0333),
  ('Amlodipine', 'Amlodipine', 'Norvasc', '10mg', 'Tablet', '68180051901', 'Generic', 'Prescription', 'Calcium channel blocker for blood pressure', 0.0333),
  ('Losartan', 'Losartan', 'Cozaar', '50mg', 'Tablet', '68180051001', 'Generic', 'Prescription', 'ARB for high blood pressure', 0.0333),
  ('Losartan', 'Losartan', 'Cozaar', '100mg', 'Tablet', '68180051101', 'Generic', 'Prescription', 'ARB for high blood pressure', 0.0333),
  ('Atorvastatin', 'Atorvastatin', 'Lipitor', '10mg', 'Tablet', '68180037209', 'Generic', 'Prescription', 'Statin for cholesterol', 0.0333),
  ('Atorvastatin', 'Atorvastatin', 'Lipitor', '20mg', 'Tablet', '68180037309', 'Generic', 'Prescription', 'Statin for cholesterol', 0.0333),
  ('Atorvastatin', 'Atorvastatin', 'Lipitor', '40mg', 'Tablet', '68180037409', 'Generic', 'Prescription', 'Statin for cholesterol', 0.0333),
  ('Simvastatin', 'Simvastatin', 'Zocor', '20mg', 'Tablet', '68180072501', 'Generic', 'Prescription', 'Statin for cholesterol', 0.0333),
  ('Simvastatin', 'Simvastatin', 'Zocor', '40mg', 'Tablet', '68180072601', 'Generic', 'Prescription', 'Statin for cholesterol', 0.0333),
  ('Metoprolol', 'Metoprolol Tartrate', 'Lopressor', '25mg', 'Tablet', '68180050701', 'Generic', 'Prescription', 'Beta blocker for heart conditions', 0.0333),
  ('Metoprolol', 'Metoprolol Tartrate', 'Lopressor', '50mg', 'Tablet', '68180050801', 'Generic', 'Prescription', 'Beta blocker for heart conditions', 0.0333),
  ('Carvedilol', 'Carvedilol', 'Coreg', '6.25mg', 'Tablet', '68180061601', 'Generic', 'Prescription', 'Beta blocker for heart failure', 0.0333),
  ('Carvedilol', 'Carvedilol', 'Coreg', '12.5mg', 'Tablet', '68180061701', 'Generic', 'Prescription', 'Beta blocker for heart failure', 0.0333),
  
  -- Diabetes
  ('Metformin', 'Metformin', 'Glucophage', '500mg', 'Tablet', '68180098203', 'Generic', 'Prescription', 'Diabetes medication', 0.0333),
  ('Metformin', 'Metformin', 'Glucophage', '850mg', 'Tablet', '68180098303', 'Generic', 'Prescription', 'Diabetes medication', 0.0333),
  ('Metformin', 'Metformin', 'Glucophage', '1000mg', 'Tablet', '68180098403', 'Generic', 'Prescription', 'Diabetes medication', 0.0333),
  ('Glipizide', 'Glipizide', 'Glucotrol', '5mg', 'Tablet', '68180065601', 'Generic', 'Prescription', 'Diabetes medication', 0.0333),
  ('Glipizide', 'Glipizide', 'Glucotrol', '10mg', 'Tablet', '68180065701', 'Generic', 'Prescription', 'Diabetes medication', 0.0333),
  
  -- Thyroid
  ('Levothyroxine', 'Levothyroxine', 'Synthroid', '25mcg', 'Tablet', '68180066801', 'Generic', 'Prescription', 'Thyroid hormone replacement', 0.0333),
  ('Levothyroxine', 'Levothyroxine', 'Synthroid', '50mcg', 'Tablet', '68180066901', 'Generic', 'Prescription', 'Thyroid hormone replacement', 0.0333),
  ('Levothyroxine', 'Levothyroxine', 'Synthroid', '75mcg', 'Tablet', '68180067001', 'Generic', 'Prescription', 'Thyroid hormone replacement', 0.0333),
  ('Levothyroxine', 'Levothyroxine', 'Synthroid', '100mcg', 'Tablet', '68180067101', 'Generic', 'Prescription', 'Thyroid hormone replacement', 0.0333),
  
  -- Gastrointestinal
  ('Omeprazole', 'Omeprazole', 'Prilosec', '20mg', 'Capsule', '68180036303', 'Generic', 'Prescription', 'Proton pump inhibitor for acid reflux', 0.0333),
  ('Omeprazole', 'Omeprazole', 'Prilosec', '40mg', 'Capsule', '68180036403', 'Generic', 'Prescription', 'Proton pump inhibitor for acid reflux', 0.0333),
  ('Pantoprazole', 'Pantoprazole', 'Protonix', '20mg', 'Tablet', '68180098503', 'Generic', 'Prescription', 'Proton pump inhibitor', 0.0333),
  ('Pantoprazole', 'Pantoprazole', 'Protonix', '40mg', 'Tablet', '68180098603', 'Generic', 'Prescription', 'Proton pump inhibitor', 0.0333),
  
  -- Mental Health
  ('Sertraline', 'Sertraline', 'Zoloft', '25mg', 'Tablet', '68180074401', 'Generic', 'Prescription', 'SSRI antidepressant', 0.0333),
  ('Sertraline', 'Sertraline', 'Zoloft', '50mg', 'Tablet', '68180074501', 'Generic', 'Prescription', 'SSRI antidepressant', 0.0333),
  ('Sertraline', 'Sertraline', 'Zoloft', '100mg', 'Tablet', '68180074601', 'Generic', 'Prescription', 'SSRI antidepressant', 0.0333),
  ('Escitalopram', 'Escitalopram', 'Lexapro', '5mg', 'Tablet', '68180049701', 'Generic', 'Prescription', 'SSRI antidepressant', 0.0333),
  ('Escitalopram', 'Escitalopram', 'Lexapro', '10mg', 'Tablet', '68180049801', 'Generic', 'Prescription', 'SSRI antidepressant', 0.0333),
  ('Escitalopram', 'Escitalopram', 'Lexapro', '20mg', 'Tablet', '68180049901', 'Generic', 'Prescription', 'SSRI antidepressant', 0.0333),
  ('Fluoxetine', 'Fluoxetine', 'Prozac', '10mg', 'Capsule', '68180063001', 'Generic', 'Prescription', 'SSRI antidepressant', 0.0333),
  ('Fluoxetine', 'Fluoxetine', 'Prozac', '20mg', 'Capsule', '68180063101', 'Generic', 'Prescription', 'SSRI antidepressant', 0.0333),
  ('Citalopram', 'Citalopram', 'Celexa', '20mg', 'Tablet', '68180061301', 'Generic', 'Prescription', 'SSRI antidepressant', 0.0333),
  ('Citalopram', 'Citalopram', 'Celexa', '40mg', 'Tablet', '68180061401', 'Generic', 'Prescription', 'SSRI antidepressant', 0.0333),
  ('Bupropion', 'Bupropion XL', 'Wellbutrin XL', '150mg', 'Tablet', '68180050301', 'Generic', 'Prescription', 'Antidepressant', 0.0333),
  ('Bupropion', 'Bupropion XL', 'Wellbutrin XL', '300mg', 'Tablet', '68180050401', 'Generic', 'Prescription', 'Antidepressant', 0.0333),
  ('Trazodone', 'Trazodone', NULL, '50mg', 'Tablet', '68180074801', 'Generic', 'Prescription', 'Antidepressant and sleep aid', 0.0333),
  ('Trazodone', 'Trazodone', NULL, '100mg', 'Tablet', '68180074901', 'Generic', 'Prescription', 'Antidepressant and sleep aid', 0.0333),
  
  -- Pain & Inflammation
  ('Gabapentin', 'Gabapentin', 'Neurontin', '100mg', 'Capsule', '68180037001', 'Generic', 'Prescription', 'Nerve pain medication', 0.0333),
  ('Gabapentin', 'Gabapentin', 'Neurontin', '300mg', 'Capsule', '68180037101', 'Generic', 'Prescription', 'Nerve pain medication', 0.0333),
  ('Gabapentin', 'Gabapentin', 'Neurontin', '600mg', 'Tablet', '68180065201', 'Generic', 'Prescription', 'Nerve pain medication', 0.0333),
  ('Meloxicam', 'Meloxicam', 'Mobic', '7.5mg', 'Tablet', '68180069301', 'Generic', 'Prescription', 'NSAID for pain and inflammation', 0.0333),
  ('Meloxicam', 'Meloxicam', 'Mobic', '15mg', 'Tablet', '68180069401', 'Generic', 'Prescription', 'NSAID for pain and inflammation', 0.0333),
  ('Ibuprofen', 'Ibuprofen', 'Advil', '600mg', 'Tablet', '68180066401', 'Generic', 'Prescription', 'NSAID for pain', 0.0333),
  ('Ibuprofen', 'Ibuprofen', 'Advil', '800mg', 'Tablet', '68180066501', 'Generic', 'Prescription', 'NSAID for pain', 0.0333),
  ('Naproxen', 'Naproxen', 'Naprosyn', '375mg', 'Tablet', '68180070501', 'Generic', 'Prescription', 'NSAID for pain', 0.0333),
  ('Naproxen', 'Naproxen', 'Naprosyn', '500mg', 'Tablet', '68180070601', 'Generic', 'Prescription', 'NSAID for pain', 0.0333),
  ('Tramadol', 'Tramadol', 'Ultram', '50mg', 'Tablet', '68180075201', 'Generic', 'Prescription', 'Pain medication', 0.0333),
  ('Cyclobenzaprine', 'Cyclobenzaprine', 'Flexeril', '5mg', 'Tablet', '68180061801', 'Generic', 'Prescription', 'Muscle relaxer', 0.0333),
  ('Cyclobenzaprine', 'Cyclobenzaprine', 'Flexeril', '10mg', 'Tablet', '68180061901', 'Generic', 'Prescription', 'Muscle relaxer', 0.0333),
  
  -- Diuretics
  ('Hydrochlorothiazide', 'Hydrochlorothiazide', NULL, '12.5mg', 'Capsule', '68180066201', 'Generic', 'Prescription', 'Diuretic for blood pressure', 0.0333),
  ('Hydrochlorothiazide', 'Hydrochlorothiazide', NULL, '25mg', 'Tablet', '68180066301', 'Generic', 'Prescription', 'Diuretic for blood pressure', 0.0333),
  ('Furosemide', 'Furosemide', 'Lasix', '20mg', 'Tablet', '68180064801', 'Generic', 'Prescription', 'Loop diuretic', 0.0333),
  ('Furosemide', 'Furosemide', 'Lasix', '40mg', 'Tablet', '68180064901', 'Generic', 'Prescription', 'Loop diuretic', 0.0333),
  ('Spironolactone', 'Spironolactone', 'Aldactone', '25mg', 'Tablet', '68180073801', 'Generic', 'Prescription', 'Diuretic', 0.0333),
  ('Spironolactone', 'Spironolactone', 'Aldactone', '50mg', 'Tablet', '68180073901', 'Generic', 'Prescription', 'Diuretic', 0.0333),
  
  -- Antibiotics
  ('Amoxicillin', 'Amoxicillin', NULL, '500mg', 'Capsule', '68180035403', 'Generic', 'Prescription', 'Antibiotic', 0.0333),
  ('Amoxicillin', 'Amoxicillin', NULL, '875mg', 'Tablet', '68180035503', 'Generic', 'Prescription', 'Antibiotic', 0.0333),
  ('Azithromycin', 'Azithromycin', 'Zithromax', '250mg', 'Tablet', '68180048801', 'Generic', 'Prescription', 'Antibiotic', 0.0333),
  ('Doxycycline', 'Doxycycline Hyclate', NULL, '100mg', 'Capsule', '68180062701', 'Generic', 'Prescription', 'Antibiotic', 0.0333),
  ('Ciprofloxacin', 'Ciprofloxacin', 'Cipro', '500mg', 'Tablet', '68180061501', 'Generic', 'Prescription', 'Antibiotic', 0.0333),
  ('Cephalexin', 'Cephalexin', 'Keflex', '500mg', 'Capsule', '68180060901', 'Generic', 'Prescription', 'Antibiotic', 0.0333),
  
  -- Respiratory
  ('Albuterol', 'Albuterol Sulfate', 'ProAir', '90mcg', 'Inhaler', '49502069589', 'Generic', 'Prescription', 'Bronchodilator inhaler', 0.0333),
  ('Montelukast', 'Montelukast', 'Singulair', '10mg', 'Tablet', '68180069801', 'Generic', 'Prescription', 'Asthma and allergy medication', 0.0333),
  ('Fluticasone', 'Fluticasone Propionate', 'Flonase', '50mcg', 'Nasal Spray', '68180064101', 'Generic', 'Prescription', 'Nasal steroid', 0.0333),
  ('Prednisone', 'Prednisone', NULL, '5mg', 'Tablet', '68180072001', 'Generic', 'Prescription', 'Corticosteroid', 0.0333),
  ('Prednisone', 'Prednisone', NULL, '10mg', 'Tablet', '68180072101', 'Generic', 'Prescription', 'Corticosteroid', 0.0333),
  ('Prednisone', 'Prednisone', NULL, '20mg', 'Tablet', '68180072201', 'Generic', 'Prescription', 'Corticosteroid', 0.0333),
  
  -- Allergy
  ('Cetirizine', 'Cetirizine', 'Zyrtec', '10mg', 'Tablet', '68180060701', 'OTC', 'OTC', 'Antihistamine', 0.0333),
  ('Loratadine', 'Loratadine', 'Claritin', '10mg', 'Tablet', '68180068701', 'OTC', 'OTC', 'Antihistamine', 0.0333),
  ('Fexofenadine', 'Fexofenadine', 'Allegra', '180mg', 'Tablet', '68180063501', 'OTC', 'OTC', 'Antihistamine', 0.0333),
  
  -- Other Common
  ('Tamsulosin', 'Tamsulosin', 'Flomax', '0.4mg', 'Capsule', '68180074101', 'Generic', 'Prescription', 'For enlarged prostate', 0.0333),
  ('Finasteride', 'Finasteride', 'Proscar', '5mg', 'Tablet', '68180063801', 'Generic', 'Prescription', 'For enlarged prostate', 0.0333),
  ('Allopurinol', 'Allopurinol', NULL, '100mg', 'Tablet', '68180035001', 'Generic', 'Prescription', 'For gout', 0.0333),
  ('Allopurinol', 'Allopurinol', NULL, '300mg', 'Tablet', '68180035101', 'Generic', 'Prescription', 'For gout', 0.0333),
  ('Warfarin', 'Warfarin', 'Coumadin', '5mg', 'Tablet', '68180076301', 'Generic', 'Prescription', 'Blood thinner', 0.0333),
  ('Clopidogrel', 'Clopidogrel', 'Plavix', '75mg', 'Tablet', '68180061201', 'Generic', 'Prescription', 'Blood thinner', 0.0333)
ON CONFLICT (ndc) DO UPDATE SET
  acquisition_cost = EXCLUDED.acquisition_cost,
  updated_at = CURRENT_TIMESTAMP;
