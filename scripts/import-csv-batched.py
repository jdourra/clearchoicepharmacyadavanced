import csv
import os
from pathlib import Path

# Read the CSV file
csv_path = Path(__file__).parent.parent / "user_read_only_context" / "text_attachments" / "newdruglistbyaac-cKXSY.csv"

medications = {}

with open(csv_path, 'r', encoding='utf-8') as file:
    csv_reader = csv.DictReader(file)
    
    for row in csv_reader:
        drug_name = row['Drug Name'].strip()
        quantity = int(row['Quantity']) if row['Quantity'] else 1
        ndc = row['NDC'].strip()
        cost = float(row['cost'].replace('$', '').replace(',', '')) if row['cost'] else 0
        
        # Calculate per-unit cost
        per_unit_cost = cost / quantity if quantity > 0 else 0
        
        # Parse drug name to extract components
        name_parts = drug_name.split()
        strength = ""
        form = "tablet"
        
        # Extract strength (look for patterns like 10MG, 5ML, etc)
        for i, part in enumerate(name_parts):
            part_upper = part.upper()
            if any(unit in part_upper for unit in ['MG', 'ML', 'MCG', 'G', '%']):
                strength = part_upper
                break
        
        # Determine form
        drug_lower = drug_name.lower()
        if 'capsule' in drug_lower or 'cap' in drug_lower:
            form = 'capsule'
        elif 'solution' in drug_lower or 'liquid' in drug_lower:
            form = 'solution'
        elif 'cream' in drug_lower or 'ointment' in drug_lower:
            form = 'cream'
        elif 'injection' in drug_lower or 'injectable' in drug_lower:
            form = 'injection'
        elif 'inhaler' in drug_lower:
            form = 'inhaler'
        elif 'tablet' in drug_lower or 'tab' in drug_lower:
            form = 'tablet'
        
        # Create a key for deduplication
        key = f"{drug_name}||{strength}"
        
        # Keep the medication with lowest cost
        if key not in medications or per_unit_cost < medications[key]['per_unit_cost']:
            medications[key] = {
                'name': drug_name,
                'strength': strength or 'N/A',
                'form': form,
                'ndc': ndc,
                'per_unit_cost': per_unit_cost,
                'is_generic': not any(brand in drug_name.upper() for brand in ['BRAND', 'TRADE'])
            }

# Generate SQL files in batches of 50
batch_size = 50
medication_list = list(medications.values())
total_batches = (len(medication_list) + batch_size - 1) // batch_size

print(f"Total unique medications: {len(medication_list)}")
print(f"Creating {total_batches} batch files...")

for batch_num in range(total_batches):
    start_idx = batch_num * batch_size
    end_idx = min(start_idx + batch_size, len(medication_list))
    batch = medication_list[start_idx:end_idx]
    
    sql_file = Path(__file__).parent / f"013_import_batch_{batch_num + 1:03d}.sql"
    
    with open(sql_file, 'w', encoding='utf-8') as f:
        f.write(f"-- Batch {batch_num + 1} of {total_batches}\n")
        f.write(f"-- Medications {start_idx + 1} to {end_idx}\n\n")
        
        for med in batch:
            name = med['name'].replace("'", "''")
            strength = med['strength'].replace("'", "''")
            form = med['form'].replace("'", "''")
            ndc = med['ndc'].replace("'", "''")
            per_unit_cost = med['per_unit_cost']
            is_generic = 'true' if med['is_generic'] else 'false'
            
            f.write(f"""INSERT INTO medications (name, generic_name, strength, form, ndc_code, acquisition_cost, is_generic)
VALUES ('{name}', '{name}', '{strength}', '{form}', '{ndc}', {per_unit_cost}, {is_generic})
ON CONFLICT (ndc_code) 
DO UPDATE SET 
  acquisition_cost = CASE 
    WHEN EXCLUDED.acquisition_cost < medications.acquisition_cost 
    THEN EXCLUDED.acquisition_cost 
    ELSE medications.acquisition_cost 
  END;

""")
    
    print(f"Created batch {batch_num + 1}: {sql_file.name}")

print(f"\n✅ Created {total_batches} SQL batch files")
print("Run them sequentially from scripts folder to import all medications")
