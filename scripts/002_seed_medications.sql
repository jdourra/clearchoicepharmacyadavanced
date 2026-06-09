-- Seed with real medications (100+ common drugs)
-- Prices are realistic wholesale/acquisition costs

-- Cardiovascular Medications
INSERT INTO medications (drug_name, generic_name, brand_name, strength, form, ndc, acquisition_cost, category, description) VALUES
('Lisinopril', 'Lisinopril', 'Prinivil', '5mg', 'tablet', '00093-7369-01', 2.50, 'cardiovascular', 'ACE inhibitor for blood pressure'),
('Lisinopril', 'Lisinopril', 'Prinivil', '10mg', 'tablet', '00093-7370-01', 3.00, 'cardiovascular', 'ACE inhibitor for blood pressure'),
('Lisinopril', 'Lisinopril', 'Prinivil', '20mg', 'tablet', '00093-7371-01', 3.50, 'cardiovascular', 'ACE inhibitor for blood pressure'),
('Lisinopril', 'Lisinopril', 'Prinivil', '40mg', 'tablet', '00093-7372-01', 4.00, 'cardiovascular', 'ACE inhibitor for blood pressure'),
('Amlodipine', 'Amlodipine', 'Norvasc', '2.5mg', 'tablet', '00093-7368-01', 2.00, 'cardiovascular', 'Calcium channel blocker'),
('Amlodipine', 'Amlodipine', 'Norvasc', '5mg', 'tablet', '00093-7369-02', 2.50, 'cardiovascular', 'Calcium channel blocker'),
('Amlodipine', 'Amlodipine', 'Norvasc', '10mg', 'tablet', '00093-7370-02', 3.00, 'cardiovascular', 'Calcium channel blocker'),
('Atorvastatin', 'Atorvastatin', 'Lipitor', '10mg', 'tablet', '00093-7371-02', 4.00, 'cardiovascular', 'Statin for cholesterol'),
('Atorvastatin', 'Atorvastatin', 'Lipitor', '20mg', 'tablet', '00093-7372-02', 5.00, 'cardiovascular', 'Statin for cholesterol'),
('Atorvastatin', 'Atorvastatin', 'Lipitor', '40mg', 'tablet', '00093-7373-02', 6.00, 'cardiovascular', 'Statin for cholesterol'),
('Atorvastatin', 'Atorvastatin', 'Lipitor', '80mg', 'tablet', '00093-7374-02', 8.00, 'cardiovascular', 'Statin for cholesterol'),
('Metoprolol', 'Metoprolol Tartrate', 'Lopressor', '25mg', 'tablet', '00093-7375-02', 2.50, 'cardiovascular', 'Beta blocker'),
('Metoprolol', 'Metoprolol Tartrate', 'Lopressor', '50mg', 'tablet', '00093-7376-02', 3.00, 'cardiovascular', 'Beta blocker'),
('Metoprolol', 'Metoprolol Tartrate', 'Lopressor', '100mg', 'tablet', '00093-7377-02', 4.00, 'cardiovascular', 'Beta blocker'),
('Losartan', 'Losartan', 'Cozaar', '25mg', 'tablet', '00093-7378-02', 3.00, 'cardiovascular', 'ARB for blood pressure'),
('Losartan', 'Losartan', 'Cozaar', '50mg', 'tablet', '00093-7379-02', 4.00, 'cardiovascular', 'ARB for blood pressure'),
('Losartan', 'Losartan', 'Cozaar', '100mg', 'tablet', '00093-7380-02', 5.00, 'cardiovascular', 'ARB for blood pressure'),
('Carvedilol', 'Carvedilol', 'Coreg', '3.125mg', 'tablet', '00093-7381-02', 2.50, 'cardiovascular', 'Beta blocker'),
('Carvedilol', 'Carvedilol', 'Coreg', '6.25mg', 'tablet', '00093-7382-02', 3.00, 'cardiovascular', 'Beta blocker'),
('Carvedilol', 'Carvedilol', 'Coreg', '12.5mg', 'tablet', '00093-7383-02', 3.50, 'cardiovascular', 'Beta blocker'),
('Carvedilol', 'Carvedilol', 'Coreg', '25mg', 'tablet', '00093-7384-02', 4.00, 'cardiovascular', 'Beta blocker');

-- Diabetes Medications
INSERT INTO medications (drug_name, generic_name, brand_name, strength, form, ndc, acquisition_cost, category, description) VALUES
('Metformin', 'Metformin HCl', 'Glucophage', '500mg', 'tablet', '00093-7385-02', 2.00, 'diabetes', 'First-line diabetes medication'),
('Metformin', 'Metformin HCl', 'Glucophage', '850mg', 'tablet', '00093-7386-02', 2.50, 'diabetes', 'First-line diabetes medication'),
('Metformin', 'Metformin HCl', 'Glucophage', '1000mg', 'tablet', '00093-7387-02', 3.00, 'diabetes', 'First-line diabetes medication'),
('Metformin ER', 'Metformin HCl Extended Release', 'Glucophage XR', '500mg', 'tablet', '00093-7388-02', 3.00, 'diabetes', 'Extended release diabetes medication'),
('Metformin ER', 'Metformin HCl Extended Release', 'Glucophage XR', '750mg', 'tablet', '00093-7389-02', 3.50, 'diabetes', 'Extended release diabetes medication'),
('Glipizide', 'Glipizide', 'Glucotrol', '5mg', 'tablet', '00093-7390-02', 2.50, 'diabetes', 'Sulfonylurea for diabetes'),
('Glipizide', 'Glipizide', 'Glucotrol', '10mg', 'tablet', '00093-7391-02', 3.00, 'diabetes', 'Sulfonylurea for diabetes'),
('Glimepiride', 'Glimepiride', 'Amaryl', '1mg', 'tablet', '00093-7392-02', 2.50, 'diabetes', 'Sulfonylurea for diabetes'),
('Glimepiride', 'Glimepiride', 'Amaryl', '2mg', 'tablet', '00093-7393-02', 3.00, 'diabetes', 'Sulfonylurea for diabetes'),
('Glimepiride', 'Glimepiride', 'Amaryl', '4mg', 'tablet', '00093-7394-02', 3.50, 'diabetes', 'Sulfonylurea for diabetes');

-- Antibiotics
INSERT INTO medications (drug_name, generic_name, brand_name, strength, form, ndc, acquisition_cost, category, description) VALUES
('Amoxicillin', 'Amoxicillin', 'Amoxil', '250mg', 'capsule', '00093-7395-02', 3.00, 'antibiotics', 'Penicillin antibiotic'),
('Amoxicillin', 'Amoxicillin', 'Amoxil', '500mg', 'capsule', '00093-7396-02', 4.00, 'antibiotics', 'Penicillin antibiotic'),
('Amoxicillin', 'Amoxicillin', 'Amoxil', '875mg', 'tablet', '00093-7397-02', 5.00, 'antibiotics', 'Penicillin antibiotic'),
('Azithromycin', 'Azithromycin', 'Zithromax', '250mg', 'tablet', '00093-7398-02', 8.00, 'antibiotics', 'Z-Pack antibiotic'),
('Azithromycin', 'Azithromycin', 'Zithromax', '500mg', 'tablet', '00093-7399-02', 12.00, 'antibiotics', 'Z-Pack antibiotic'),
('Doxycycline', 'Doxycycline Hyclate', 'Vibramycin', '50mg', 'capsule', '00093-7400-02', 3.00, 'antibiotics', 'Tetracycline antibiotic'),
('Doxycycline', 'Doxycycline Hyclate', 'Vibramycin', '100mg', 'capsule', '00093-7401-02', 4.00, 'antibiotics', 'Tetracycline antibiotic'),
('Ciprofloxacin', 'Ciprofloxacin', 'Cipro', '250mg', 'tablet', '00093-7402-02', 5.00, 'antibiotics', 'Fluoroquinolone antibiotic'),
('Ciprofloxacin', 'Ciprofloxacin', 'Cipro', '500mg', 'tablet', '00093-7403-02', 6.00, 'antibiotics', 'Fluoroquinolone antibiotic'),
('Cephalexin', 'Cephalexin', 'Keflex', '250mg', 'capsule', '00093-7404-02', 4.00, 'antibiotics', 'Cephalosporin antibiotic'),
('Cephalexin', 'Cephalexin', 'Keflex', '500mg', 'capsule', '00093-7405-02', 5.00, 'antibiotics', 'Cephalosporin antibiotic');

-- Mental Health
INSERT INTO medications (drug_name, generic_name, brand_name, strength, form, ndc, acquisition_cost, category, description) VALUES
('Sertraline', 'Sertraline', 'Zoloft', '25mg', 'tablet', '00093-7406-02', 3.00, 'mental health', 'SSRI antidepressant'),
('Sertraline', 'Sertraline', 'Zoloft', '50mg', 'tablet', '00093-7407-02', 3.50, 'mental health', 'SSRI antidepressant'),
('Sertraline', 'Sertraline', 'Zoloft', '100mg', 'tablet', '00093-7408-02', 4.00, 'mental health', 'SSRI antidepressant'),
('Escitalopram', 'Escitalopram', 'Lexapro', '5mg', 'tablet', '00093-7409-02', 3.00, 'mental health', 'SSRI antidepressant'),
('Escitalopram', 'Escitalopram', 'Lexapro', '10mg', 'tablet', '00093-7410-02', 3.50, 'mental health', 'SSRI antidepressant'),
('Escitalopram', 'Escitalopram', 'Lexapro', '20mg', 'tablet', '00093-7411-02', 4.00, 'mental health', 'SSRI antidepressant'),
('Bupropion', 'Bupropion', 'Wellbutrin', '75mg', 'tablet', '00093-7412-02', 4.00, 'mental health', 'Antidepressant'),
('Bupropion', 'Bupropion', 'Wellbutrin', '100mg', 'tablet', '00093-7413-02', 4.50, 'mental health', 'Antidepressant'),
('Bupropion XL', 'Bupropion XL', 'Wellbutrin XL', '150mg', 'tablet', '00093-7414-02', 5.00, 'mental health', 'Extended release antidepressant'),
('Bupropion XL', 'Bupropion XL', 'Wellbutrin XL', '300mg', 'tablet', '00093-7415-02', 6.00, 'mental health', 'Extended release antidepressant'),
('Fluoxetine', 'Fluoxetine', 'Prozac', '10mg', 'capsule', '00093-7416-02', 2.50, 'mental health', 'SSRI antidepressant'),
('Fluoxetine', 'Fluoxetine', 'Prozac', '20mg', 'capsule', '00093-7417-02', 3.00, 'mental health', 'SSRI antidepressant'),
('Fluoxetine', 'Fluoxetine', 'Prozac', '40mg', 'capsule', '00093-7418-02', 4.00, 'mental health', 'SSRI antidepressant'),
('Trazodone', 'Trazodone', 'Desyrel', '50mg', 'tablet', '00093-7419-02', 2.00, 'mental health', 'Antidepressant/sleep aid'),
('Trazodone', 'Trazodone', 'Desyrel', '100mg', 'tablet', '00093-7420-02', 2.50, 'mental health', 'Antidepressant/sleep aid'),
('Buspirone', 'Buspirone', 'BuSpar', '5mg', 'tablet', '00093-7421-02', 2.50, 'mental health', 'Anti-anxiety'),
('Buspirone', 'Buspirone', 'BuSpar', '10mg', 'tablet', '00093-7422-02', 3.00, 'mental health', 'Anti-anxiety'),
('Buspirone', 'Buspirone', 'BuSpar', '15mg', 'tablet', '00093-7423-02', 3.50, 'mental health', 'Anti-anxiety');

-- Pain Management & Anti-inflammatory
INSERT INTO medications (drug_name, generic_name, brand_name, strength, form, ndc, acquisition_cost, category, description) VALUES
('Ibuprofen', 'Ibuprofen', 'Motrin', '200mg', 'tablet', '00093-7424-02', 1.50, 'pain management', 'NSAID pain reliever'),
('Ibuprofen', 'Ibuprofen', 'Motrin', '400mg', 'tablet', '00093-7425-02', 2.00, 'pain management', 'NSAID pain reliever'),
('Ibuprofen', 'Ibuprofen', 'Motrin', '600mg', 'tablet', '00093-7426-02', 2.50, 'pain management', 'NSAID pain reliever'),
('Ibuprofen', 'Ibuprofen', 'Motrin', '800mg', 'tablet', '00093-7427-02', 3.00, 'pain management', 'NSAID pain reliever'),
('Naproxen', 'Naproxen', 'Aleve', '220mg', 'tablet', '00093-7428-02', 2.00, 'pain management', 'NSAID pain reliever'),
('Naproxen', 'Naproxen', 'Naprosyn', '500mg', 'tablet', '00093-7429-02', 3.00, 'pain management', 'NSAID pain reliever'),
('Meloxicam', 'Meloxicam', 'Mobic', '7.5mg', 'tablet', '00093-7430-02', 2.50, 'pain management', 'NSAID for arthritis'),
('Meloxicam', 'Meloxicam', 'Mobic', '15mg', 'tablet', '00093-7431-02', 3.00, 'pain management', 'NSAID for arthritis'),
('Celecoxib', 'Celecoxib', 'Celebrex', '100mg', 'capsule', '00093-7432-02', 8.00, 'pain management', 'COX-2 inhibitor'),
('Celecoxib', 'Celecoxib', 'Celebrex', '200mg', 'capsule', '00093-7433-02', 10.00, 'pain management', 'COX-2 inhibitor'),
('Tramadol', 'Tramadol', 'Ultram', '50mg', 'tablet', '00093-7434-02', 3.00, 'pain management', 'Opioid-like pain reliever'),
('Cyclobenzaprine', 'Cyclobenzaprine', 'Flexeril', '5mg', 'tablet', '00093-7435-02', 2.00, 'pain management', 'Muscle relaxant'),
('Cyclobenzaprine', 'Cyclobenzaprine', 'Flexeril', '10mg', 'tablet', '00093-7436-02', 2.50, 'pain management', 'Muscle relaxant');

-- Respiratory
INSERT INTO medications (drug_name, generic_name, brand_name, strength, form, ndc, acquisition_cost, category, description) VALUES
('Albuterol Inhaler', 'Albuterol Sulfate', 'ProAir HFA', '90mcg', 'inhaler', '00093-7437-02', 15.00, 'respiratory', 'Rescue inhaler for asthma'),
('Montelukast', 'Montelukast', 'Singulair', '4mg', 'chewable', '00093-7438-02', 4.00, 'respiratory', 'Asthma and allergy'),
('Montelukast', 'Montelukast', 'Singulair', '5mg', 'chewable', '00093-7439-02', 4.50, 'respiratory', 'Asthma and allergy'),
('Montelukast', 'Montelukast', 'Singulair', '10mg', 'tablet', '00093-7440-02', 5.00, 'respiratory', 'Asthma and allergy'),
('Fluticasone Nasal Spray', 'Fluticasone Propionate', 'Flonase', '50mcg', 'nasal spray', '00093-7441-02', 8.00, 'respiratory', 'Allergy nasal spray'),
('Cetirizine', 'Cetirizine', 'Zyrtec', '10mg', 'tablet', '00093-7442-02', 2.00, 'respiratory', 'Antihistamine'),
('Loratadine', 'Loratadine', 'Claritin', '10mg', 'tablet', '00093-7443-02', 2.00, 'respiratory', 'Antihistamine'),
('Fexofenadine', 'Fexofenadine', 'Allegra', '180mg', 'tablet', '00093-7444-02', 3.00, 'respiratory', 'Antihistamine');

-- Gastrointestinal
INSERT INTO medications (drug_name, generic_name, brand_name, strength, form, ndc, acquisition_cost, category, description) VALUES
('Omeprazole', 'Omeprazole', 'Prilosec', '10mg', 'capsule', '00093-7445-02', 3.00, 'gastrointestinal', 'Proton pump inhibitor'),
('Omeprazole', 'Omeprazole', 'Prilosec', '20mg', 'capsule', '00093-7446-02', 3.50, 'gastrointestinal', 'Proton pump inhibitor'),
('Omeprazole', 'Omeprazole', 'Prilosec', '40mg', 'capsule', '00093-7447-02', 4.00, 'gastrointestinal', 'Proton pump inhibitor'),
('Pantoprazole', 'Pantoprazole', 'Protonix', '20mg', 'tablet', '00093-7448-02', 3.00, 'gastrointestinal', 'Proton pump inhibitor'),
('Pantoprazole', 'Pantoprazole', 'Protonix', '40mg', 'tablet', '00093-7449-02', 3.50, 'gastrointestinal', 'Proton pump inhibitor'),
('Famotidine', 'Famotidine', 'Pepcid', '20mg', 'tablet', '00093-7450-02', 2.00, 'gastrointestinal', 'H2 blocker'),
('Famotidine', 'Famotidine', 'Pepcid', '40mg', 'tablet', '00093-7451-02', 2.50, 'gastrointestinal', 'H2 blocker'),
('Ondansetron', 'Ondansetron', 'Zofran', '4mg', 'tablet', '00093-7452-02', 5.00, 'gastrointestinal', 'Anti-nausea'),
('Ondansetron', 'Ondansetron', 'Zofran', '8mg', 'tablet', '00093-7453-02', 6.00, 'gastrointestinal', 'Anti-nausea');

-- Thyroid & Hormones
INSERT INTO medications (drug_name, generic_name, brand_name, strength, form, ndc, acquisition_cost, category, description) VALUES
('Levothyroxine', 'Levothyroxine', 'Synthroid', '25mcg', 'tablet', '00093-7454-02', 2.50, 'thyroid', 'Thyroid hormone'),
('Levothyroxine', 'Levothyroxine', 'Synthroid', '50mcg', 'tablet', '00093-7455-02', 3.00, 'thyroid', 'Thyroid hormone'),
('Levothyroxine', 'Levothyroxine', 'Synthroid', '75mcg', 'tablet', '00093-7456-02', 3.50, 'thyroid', 'Thyroid hormone'),
('Levothyroxine', 'Levothyroxine', 'Synthroid', '100mcg', 'tablet', '00093-7457-02', 4.00, 'thyroid', 'Thyroid hormone'),
('Levothyroxine', 'Levothyroxine', 'Synthroid', '125mcg', 'tablet', '00093-7458-02', 4.50, 'thyroid', 'Thyroid hormone'),
('Levothyroxine', 'Levothyroxine', 'Synthroid', '150mcg', 'tablet', '00093-7459-02', 5.00, 'thyroid', 'Thyroid hormone');

-- Miscellaneous Common Medications
INSERT INTO medications (drug_name, generic_name, brand_name, strength, form, ndc, acquisition_cost, category, description) VALUES
('Gabapentin', 'Gabapentin', 'Neurontin', '100mg', 'capsule', '00093-7460-02', 2.50, 'neurological', 'Nerve pain and seizures'),
('Gabapentin', 'Gabapentin', 'Neurontin', '300mg', 'capsule', '00093-7461-02', 3.00, 'neurological', 'Nerve pain and seizures'),
('Gabapentin', 'Gabapentin', 'Neurontin', '600mg', 'tablet', '00093-7462-02', 4.00, 'neurological', 'Nerve pain and seizures'),
('Hydrochlorothiazide', 'Hydrochlorothiazide', 'Microzide', '12.5mg', 'capsule', '00093-7463-02', 2.00, 'cardiovascular', 'Diuretic for blood pressure'),
('Hydrochlorothiazide', 'Hydrochlorothiazide', 'HCTZ', '25mg', 'tablet', '00093-7464-02', 2.50, 'cardiovascular', 'Diuretic for blood pressure'),
('Prednisone', 'Prednisone', 'Deltasone', '5mg', 'tablet', '00093-7465-02', 2.00, 'corticosteroid', 'Anti-inflammatory steroid'),
('Prednisone', 'Prednisone', 'Deltasone', '10mg', 'tablet', '00093-7466-02', 2.50, 'corticosteroid', 'Anti-inflammatory steroid'),
('Prednisone', 'Prednisone', 'Deltasone', '20mg', 'tablet', '00093-7467-02', 3.00, 'corticosteroid', 'Anti-inflammatory steroid'),
('Allopurinol', 'Allopurinol', 'Zyloprim', '100mg', 'tablet', '00093-7468-02', 2.50, 'gout', 'Gout prevention'),
('Allopurinol', 'Allopurinol', 'Zyloprim', '300mg', 'tablet', '00093-7469-02', 3.00, 'gout', 'Gout prevention'),
('Spironolactone', 'Spironolactone', 'Aldactone', '25mg', 'tablet', '00093-7470-02', 2.50, 'cardiovascular', 'Diuretic'),
('Spironolactone', 'Spironolactone', 'Aldactone', '50mg', 'tablet', '00093-7471-02', 3.00, 'cardiovascular', 'Diuretic'),
('Warfarin', 'Warfarin', 'Coumadin', '1mg', 'tablet', '00093-7472-02', 3.00, 'anticoagulant', 'Blood thinner'),
('Warfarin', 'Warfarin', 'Coumadin', '2mg', 'tablet', '00093-7473-02', 3.00, 'anticoagulant', 'Blood thinner'),
('Warfarin', 'Warfarin', 'Coumadin', '5mg', 'tablet', '00093-7474-02', 3.00, 'anticoagulant', 'Blood thinner'),
('Clopidogrel', 'Clopidogrel', 'Plavix', '75mg', 'tablet', '00093-7475-02', 5.00, 'anticoagulant', 'Blood thinner'),
('Finasteride', 'Finasteride', 'Propecia', '1mg', 'tablet', '00093-7476-02', 4.00, 'hair loss', 'Hair loss prevention'),
('Finasteride', 'Finasteride', 'Proscar', '5mg', 'tablet', '00093-7477-02', 5.00, 'prostate', 'Prostate enlargement'),
('Tamsulosin', 'Tamsulosin', 'Flomax', '0.4mg', 'capsule', '00093-7478-02', 4.00, 'prostate', 'Prostate enlargement');
