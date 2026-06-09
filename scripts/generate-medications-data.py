import csv
import json
import re

# Read the CSV file from the attachment
csv_file = '../user_read_only_context/text_attachments/newdruglistbyaac-vKZ04.csv'

medications = {}
medication_id = 1

with open(csv_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    
    for row in reader:
        drug_name = row['Drug Name '].strip()
        ndc = row['NDC'].strip()
        quantity_str = row['Quantity'].strip()
        cost_str = row['cost'].strip()
        
        # Skip if essential data is missing
        if not drug_name or not ndc or not quantity_str or not cost_str:
            continue
            
        try:
            quantity = float(quantity_str)
            cost = float(cost_str)
        except ValueError:
            continue
        
        # Skip zero quantity or cost
        if quantity <= 0 or cost <= 0:
            continue
        
        # Calculate per-unit cost
        per_unit_cost = cost / quantity
        
        # Parse medication name to extract base name and strength
        # Example: "AMLODIPINE BESYLATE 10 MG TAB" -> name: "Amlodipine", strength: "10 mg", form: "Tablet"
        
        # Common form abbreviations
        form_map = {
            'TAB': 'Tablet',
            'TABLET': 'Tablet',
            'CAP': 'Capsule',
            'CAPSULE': 'Capsule',
            'CREAM': 'Cream',
            'OINTMENT': 'Ointment',
            'OINT': 'Ointment',
            'LOTION': 'Lotion',
            'GEL': 'Gel',
            'SOLUTION': 'Solution',
            'SOLN': 'Solution',
            'SOL': 'Solution',
            'SUSP': 'Suspension',
            'SUSPENSION': 'Suspension',
            'SYRUP': 'Syrup',
            'INHALER': 'Inhaler',
            'INH': 'Inhaler',
            'DROPS': 'Drops',
            'DROP': 'Drops',
            'SPRAY': 'Spray',
            'SPRY': 'Spray',
            'PATCH': 'Patch',
            'SYR': 'Syringe',
            'SYRINGE': 'Syringe',
            'VIAL': 'Vial',
            'INJECTION': 'Injection',
            'INJ': 'Injection'
        }
        
        # Extract form from end of name
        form = 'Other'
        name_upper = drug_name.upper()
        for abbr, full_form in form_map.items():
            if name_upper.endswith(' ' + abbr) or ' ' + abbr + ' ' in name_upper:
                form = full_form
                break
        
        # Extract strength (pattern like "10 MG", "0.5%", "100 UNIT", etc.)
        strength_match = re.search(r'\d+\.?\d*\s*(MG|MCG|GM|ML|%|UNIT|UNITS?)', drug_name.upper())
        strength = strength_match.group(0).title() if strength_match else ''
        
        # Clean base name (remove strength, form, and common suffixes)
        base_name = drug_name
        for abbr in form_map.keys():
            base_name = re.sub(r'\s+' + abbr + r'\b', '', base_name, flags=re.IGNORECASE)
        if strength:
            base_name = base_name.replace(strength.upper(), '').replace(strength.lower(), '')
        
        # Clean up the name
        base_name = ' '.join(base_name.split()).strip()
        base_name = base_name.title()
        
        # Create a unique key based on name, strength, and form
        med_key = f"{base_name}_{strength}_{form}".lower().replace(' ', '_')
        
        # Keep the medication with the lowest per-unit cost
        if med_key not in medications or per_unit_cost < medications[med_key]['per_unit_cost']:
            medications[med_key] = {
                'id': medication_id,
                'name': base_name,
                'strength': strength,
                'form': form,
                'ndc': ndc,
                'acquisition_cost': round(per_unit_cost, 4),
                'per_unit_cost': per_unit_cost,
                'is_generic': True  # Assume all are generic based on your pricing
            }
            medication_id += 1

# Convert to list and sort by name
medications_list = sorted(medications.values(), key=lambda x: x['name'])

# Remove the per_unit_cost field (was just for comparison)
for med in medications_list:
    del med['per_unit_cost']

# Generate TypeScript file
ts_content = f"""// Auto-generated from CSV data - {len(medications_list)} unique medications
// This file contains real medication data from your supplier

export interface Medication {{
  id: number
  name: string
  strength: string
  form: string
  ndc: string
  acquisition_cost: number
  is_generic: boolean
}}

export const medications: Medication[] = {json.dumps(medications_list, indent=2)}
"""

# Write to file
with open('../lib/medications-data.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)

print(f"✅ Generated medications-data.ts with {len(medications_list)} unique medications")
print(f"📊 Parsed from {medication_id - 1} total entries in CSV")
