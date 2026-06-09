import csv
import os
import re
from collections import defaultdict

# Read the CSV file
csv_file_path = 'user_read_only_context/text_attachments/newdruglistbyaac-cKXSY.csv'

def parse_drug_name(drug_name):
    """Extract name, strength, and form from drug name string"""
    drug_name = drug_name.strip()
    
    # Common forms to look for
    forms = ['TABLET', 'TAB', 'CAPSULE', 'CAP', 'CREAM', 'OINTMENT', 'GEL', 
             'LOTION', 'SOLUTION', 'SOLN', 'SUSPENSION', 'SUSP', 'SYRUP',
             'INHALER', 'SPRAY', 'DROPS', 'PATCH', 'INJECTION', 'VIAL',
             'POWDER', 'SUPPOSITORY', 'FILM', 'KIT']
    
    # Try to find form
    form = 'tablet'
    for f in forms:
        if f in drug_name.upper():
            form = f.lower().replace('tab', 'tablet').replace('cap', 'capsule').replace('soln', 'solution').replace('susp', 'suspension')
            break
    
    # Extract strength (numbers followed by unit)
    strength_pattern = r'(\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)*)\s*(MG|MCG|GM|ML|%|UNIT)'
    strength_match = re.search(strength_pattern, drug_name.upper())
    strength = strength_match.group(0) if strength_match else ''
    
    # Extract base drug name (before strength/form)
    base_name = drug_name
    if strength_match:
        base_name = drug_name[:strength_match.start()].strip()
    else:
        # Remove form from name
        for f in forms:
            if f in base_name.upper():
                base_name = base_name.upper().replace(f, '').strip()
                break
    
    # Clean up the name
    base_name = re.sub(r'\s+', ' ', base_name).strip()
    
    # Determine if generic (all caps usually means generic)
    is_generic = base_name.isupper() or any(c.isupper() for c in base_name)
    
    return {
        'name': base_name.title() if not is_generic else base_name,
        'strength': strength.lower(),
        'form': form,
        'is_generic': is_generic
    }

def calculate_per_unit_cost(cost_str, quantity_str):
    """Calculate cost per unit"""
    try:
        cost = float(cost_str) if cost_str else 0
        quantity = float(quantity_str) if quantity_str else 1
        return cost / quantity if quantity > 0 else cost
    except:
        return 0

# Read and process CSV
medications = {}
duplicates = defaultdict(list)

print("Reading CSV file...")
with open(csv_file_path, 'r', encoding='utf-8') as file:
    reader = csv.DictReader(file)
    
    for row in reader:
        drug_name = row.get('Drug Name ', '').strip()
        quantity = row.get('Quantity', '1')
        ndc = row.get('NDC', '').strip()
        cost = row.get('cost', '0')
        
        if not drug_name or not ndc:
            continue
        
        # Parse drug information
        parsed = parse_drug_name(drug_name)
        per_unit_cost = calculate_per_unit_cost(cost, quantity)
        
        # Create unique key for deduplication
        key = f"{parsed['name']}|{parsed['strength']}|{parsed['form']}"
        
        med_data = {
            'name': parsed['name'],
            'strength': parsed['strength'],
            'form': parsed['form'],
            'ndc': ndc,
            'acquisition_cost': per_unit_cost,
            'is_generic': parsed['is_generic'],
            'original_name': drug_name
        }
        
        # Keep track for deduplication
        if key in medications:
            duplicates[key].append(med_data)
        else:
            medications[key] = med_data

# For duplicates, keep the one with lowest cost
print(f"\nProcessing {len(medications)} unique medications...")
print(f"Found {len(duplicates)} medications with multiple entries...")

for key, duplicate_list in duplicates.items():
    # Add the original to the list
    duplicate_list.append(medications[key])
    # Keep the one with lowest acquisition cost
    medications[key] = min(duplicate_list, key=lambda x: x['acquisition_cost'])
    print(f"  {medications[key]['name']} - kept ${medications[key]['acquisition_cost']:.4f} per unit")

# Generate SQL INSERT statements
print(f"\nGenerating SQL for {len(medications)} medications...")

sql_statements = []
sql_statements.append("-- Clear existing medications (optional, comment out if you want to keep existing data)")
sql_statements.append("-- TRUNCATE TABLE medications RESTART IDENTITY CASCADE;")
sql_statements.append("")
sql_statements.append("-- Insert new medications from supplier drug list")

for med in medications.values():
    # Escape single quotes in names
    name = med['name'].replace("'", "''")
    original_name = med['original_name'].replace("'", "''")
    
    sql = f"""INSERT INTO medications (name, generic_name, strength, form, ndc_code, acquisition_cost, is_generic, created_at)
VALUES ('{name}', '{name}', '{med['strength']}', '{med['form']}', '{med['ndc']}', {med['acquisition_cost']:.4f}, {str(med['is_generic']).lower()}, NOW())
ON CONFLICT (ndc_code) DO UPDATE 
SET acquisition_cost = EXCLUDED.acquisition_cost
WHERE EXCLUDED.acquisition_cost < medications.acquisition_cost;"""
    
    sql_statements.append(sql)

# Write to SQL file
output_file = 'scripts/012_import_supplier_drugs.sql'
with open(output_file, 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_statements))

print(f"\n✅ SQL file generated: {output_file}")
print(f"Total medications to import: {len(medications)}")
print("\nRun this SQL script to import the medications into your database.")
