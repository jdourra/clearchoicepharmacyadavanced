import csv
import json
from collections import defaultdict
import re

# Read the CSV file
def parse_drug_report(csv_path):
    """Parse the supplier drug report and extract unique medications with lowest prices"""
    
    # Dictionary to store drugs: {(drug_name, ndc): {'qty': X, 'cost': Y, 'per_unit_cost': Z}}
    drugs_data = defaultdict(lambda: {'qty': 0, 'cost': float('inf'), 'per_unit_cost': float('inf')})
    
    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        
        for row in reader:
            drug_name = row['DrugName'].strip()
            ndc = row['DrugNDC'].strip()
            qty = int(row['RxQty'])
            cost = float(row['AACCost'])
            
            # Calculate per-unit cost
            per_unit_cost = cost / qty if qty > 0 else cost
            
            # Key is (drug_name, ndc)
            key = (drug_name, ndc)
            
            # Keep the entry with lowest per-unit cost
            if per_unit_cost < drugs_data[key]['per_unit_cost']:
                drugs_data[key] = {
                    'qty': qty,
                    'cost': cost,
                    'per_unit_cost': per_unit_cost
                }
    
    return drugs_data

def extract_strength_and_form(drug_name):
    """Extract strength and form from drug name"""
    
    # Common forms
    forms = {
        'TAB': 'Tablet',
        'TABLET': 'Tablet',
        'CAP': 'Capsule',
        'CAPSULE': 'Capsule',
        'CAPLET': 'Caplet',
        'SYR': 'Syrup',
        'SYRUP': 'Syrup',
        'SOL': 'Solution',
        'SOLUTION': 'Solution',
        'SUSP': 'Suspension',
        'INJ': 'Injectable',
        'CREAM': 'Cream',
        'OINTMENT': 'Ointment',
        'GEL': 'Gel',
        'LOTION': 'Lotion',
        'SPRAY': 'Spray',
        'INHALER': 'Inhaler',
        'PATCH': 'Patch',
        'SUPPOS': 'Suppository',
        'LIQ': 'Liquid',
        'POWDER': 'Powder',
        'AEROSOL': 'Aerosol',
        'VL': 'Vial',
        'VIAL': 'Vial',
        'ER': 'Extended Release',
        'DR': 'Delayed Release'
    }
    
    # Extract strength (e.g., "10 MG", "500MG", "5ML")
    strength_match = re.search(r'(\d+(?:\.\d+)?)\s*(MG|MCG|ML|GM|%|UNITS?)', drug_name, re.IGNORECASE)
    strength = strength_match.group(0) if strength_match else None
    
    # Extract form
    form = 'Tablet'  # default
    drug_upper = drug_name.upper()
    for key, value in forms.items():
        if key in drug_upper:
            form = value
            break
    
    # Extract base drug name (everything before the strength/form)
    base_name = drug_name
    if strength_match:
        base_name = drug_name[:strength_match.start()].strip()
    
    # Clean up base name
    base_name = re.sub(r'\s+(ER|DR|TAB|CAP|SYR|SOL|SUSP|INJ|CREAM|OINTMENT|GEL|LOTION|SPRAY|INHALER|PATCH|SUPPOS|LIQ|POWDER|AEROSOL|VL|VIAL).*$', '', base_name, flags=re.IGNORECASE)
    
    return base_name.strip(), strength, form

def generate_sql(drugs_data):
    """Generate SQL INSERT statements"""
    
    sql_statements = []
    sql_statements.append("-- Import supplier drug data")
    sql_statements.append("-- Eliminates duplicates, keeps lowest per-unit cost\n")
    
    for (drug_name, ndc), data in drugs_data.items():
        base_name, strength, form = extract_strength_and_form(drug_name)
        per_unit_cost = data['per_unit_cost']
        
        # Escape single quotes
        base_name_escaped = base_name.replace("'", "''")
        drug_name_escaped = drug_name.replace("'", "''")
        form_escaped = form.replace("'", "''")
        strength_escaped = (strength or '').replace("'", "''")
        
        # Determine if generic (basic heuristic - if all caps, likely generic)
        is_generic = drug_name.isupper()
        
        sql = f"""INSERT INTO medications (name, generic_name, strength, form, ndc_code, acquisition_cost, is_generic)
VALUES ('{drug_name_escaped}', '{base_name_escaped}', '{strength_escaped}', '{form_escaped}', '{ndc}', {per_unit_cost:.4f}, {str(is_generic).lower()})
ON CONFLICT (ndc_code) DO UPDATE SET
  acquisition_cost = EXCLUDED.acquisition_cost
WHERE medications.acquisition_cost > EXCLUDED.acquisition_cost;"""
        
        sql_statements.append(sql)
    
    return '\n\n'.join(sql_statements)

# Main execution
if __name__ == '__main__':
    print("Parsing supplier drug report...")
    drugs_data = parse_drug_report('user_read_only_context/text_attachments/drugreport2025-y9H9z.csv')
    
    print(f"Found {len(drugs_data)} unique medications")
    
    print("Generating SQL...")
    sql = generate_sql(drugs_data)
    
    # Write SQL to file
    with open('scripts/010_import_supplier_drugs.sql', 'w', encoding='utf-8') as f:
        f.write(sql)
    
    print("SQL generated successfully!")
    print("Run scripts/010_import_supplier_drugs.sql to import the data")
